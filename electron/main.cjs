const { app, BrowserWindow, ipcMain, screen, session, shell } = require('electron');

// Determine if we're in development mode FIRST (before any logging setup)
const isDev = !!process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === 'development';

// Suppress noisy Chromium network error lines and ONNX Runtime warnings
try {
  app.commandLine.appendSwitch('log-level', '3'); // Only show fatal errors

  // Suppress ONNX Runtime warnings (both dev and production)
  // These warnings about unused initializers are harmless but noisy
  process.env.ORT_LOGGING_LEVEL = 'error'; // Only show errors, not warnings
  process.env.ONNXRUNTIME_LOG_SEVERITY_LEVEL = '3'; // 0=Verbose, 1=Info, 2=Warning, 3=Error, 4=Fatal

  if (!isDev) {
    app.commandLine.appendSwitch('disable-logging');
  }
} catch (e) {
  console.warn('[Startup] Failed to set log level:', e);
}

// Enable Web Speech API support
// These switches are required for speech recognition to work in Electron
try {
  app.commandLine.appendSwitch('enable-speech-input'); // Enable speech input features
  app.commandLine.appendSwitch('enable-speech-dispatcher'); // Enable speech dispatcher service
  console.log('[Speech] Web Speech API switches enabled');
} catch (e) {
  console.warn('[Speech] Failed to enable speech switches:', e);
}
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
// Speech recognition removed - using Web Speech API only
// db and settings will be loaded after app is ready
let db = null;
let settings = null;

// Database check will be done after app is ready

// app:// protocol removed - using file:// for Web Speech API compatibility

// Reduce Chromium-internal network noise and background requests in production
// NOTE: disable-background-networking is NOT used because it blocks Web Speech API
try {
  if (!isDev) {
    // app.commandLine.appendSwitch('disable-background-networking'); // REMOVED: Blocks Web Speech API
    app.commandLine.appendSwitch('disable-client-side-phishing-detection');
    app.commandLine.appendSwitch('no-proxy-server');
    // Disable some Autofill-related features that can trigger background requests
    // OutOfBlinkCors is also disabled to allow Web Speech API to work
    app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,AutofillAddressProfileSavePrompt,OutOfBlinkCors');
  }
} catch (e) {
  console.warn('[Startup] Failed to apply background networking switches:', e);
}
let mainWindow = null;

function setupFileIPC() {
  const { dialog } = require('electron');

  const imagesDir = path.join(app.getPath('userData'), 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`[FileIPC] Created images directory at: ${imagesDir}`);
  }

  // Save As Dialog
  ipcMain.handle('files:save-as', async (event, noteData) => {
    console.log(`[FileIPC] Received 'files:save-as' request for note: ${noteData.title}`);
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Note As',
        defaultPath: `${noteData.title || 'note'}.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'HTML Files', extensions: ['html'] },
          { name: 'RTF Files', extensions: ['rtf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        console.log('[FileIPC] Save As canceled by user');
        return { success: false, canceled: true };
      }

      const filePath = result.filePath;
      const ext = path.extname(filePath).toLowerCase();

      let content = '';

      // Prepare content based on file extension
      if (ext === '.json') {
        const data = {
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          createdAt: noteData.createdAt,
          updatedAt: noteData.updatedAt,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        };
        content = JSON.stringify(data, null, 2);
      } else if (ext === '.html') {
        content = `<!doctype html><html><head><meta charset="utf-8"><title>${noteData.title}</title></head><body>${noteData.content}</body></html>`;
      } else {
        // Default to plain text
        const tempDiv = { innerHTML: noteData.content };
        content = noteData.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      }

      await fs.promises.writeFile(filePath, content, 'utf8');
      console.log(`[FileIPC] Note saved to: ${filePath}`);

      return { success: true, filePath };
    } catch (error) {
      console.error('[FileIPC] Failed to save note:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('files:save-image', async (event, data) => {
    console.log(`[FileIPC] Received 'files:save-image' request with data size: ${data.length}`);
    try {
      // Convert Uint8Array from renderer to a Node.js Buffer
      const buffer = Buffer.from(data);

      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const extension = '.png'; // Assuming png for simplicity
      const filename = `${hash}${extension}`;
      const filePath = path.join(imagesDir, filename);

      if (!fs.existsSync(filePath)) {
        await fs.promises.writeFile(filePath, buffer);
        console.log(`[FileIPC] Image saved to: ${filePath}`);
      } else {
        console.log(`[FileIPC] Image already exists, skipping write: ${filePath}`);
      }

      // Track image in database
      try {
        await db.trackImage(filename, hash, buffer.length);
        console.log(`[FileIPC] Image tracked in database: ${hash}`);
      } catch (dbError) {
        console.error('[FileIPC] Failed to track image in database:', dbError);
        // Continue anyway, file is saved
      }

      // Use file:// protocol since app:// was removed for Web Speech API compatibility
      const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
      console.log(`[FileIPC] Returning file URL: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('[FileIPC] Failed to save image:', error);
      return null;
    }
  });

  // Save Temp File (now using Downloads for visibility)
  ipcMain.handle('files:save-temp', async (event, { content, filename }) => {
    try {
      const downloadPath = app.getPath('downloads');
      const filePath = path.join(downloadPath, filename);
      console.log(`[FileIPC] Saving share file to: ${filePath}`);

      // content is string (HTML/JSON/TXT)
      fs.writeFileSync(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      console.error('[FileIPC] Failed to save share file:', error);
      return null;
    }
  });
}

function setupDatabaseIPC() {
  ipcMain.handle('db:save-note', async (event, note) => { try { return await db.saveNote(note); } catch (error) { console.error('db:save-note failed:', error); throw error; } });
  ipcMain.handle('db:get-all-notes', async () => { try { return await db.getAllNotes(); } catch (error) { console.error('db:get-all-notes failed:', error); throw error; } });
  ipcMain.handle('db:get-note', async (event, id) => { try { return await db.getNote(id); } catch (error) { console.error('db:get-note failed:', error); throw error; } });
  ipcMain.handle('db:get-history', async (event, noteId) => { try { return await db.getHistory(noteId); } catch (error) { console.error('db:get-history failed:', error); throw error; } });
  ipcMain.handle('db:delete-note', async (event, id) => { try { return await db.deleteNote(id); } catch (error) { console.error('db:delete-note failed:', error); throw error; } });
}

function setupSettingsIPC() {
  ipcMain.handle('settings:get', (event, key) => {
    const settingsData = settings.getSettings();
    return key ? settingsData[key] : settingsData;
  });
  ipcMain.handle('settings:set', (event, key, value) => {
    settings.setSetting(key, value);
  });
}

function setupAppIPC() {
  const { Notification } = require('electron');

  // Show Notification
  ipcMain.on('app:show-notification', (event, { title, body }) => {
    new Notification({ title, body }).show();
  });

  // Show Item In Folder
  ipcMain.on('app:show-item-in-folder', (event, filePath) => {
    if (filePath && typeof filePath === 'string') {
      shell.showItemInFolder(filePath);
    }
  });

  // Open External URL in default browser
  ipcMain.handle('app:open-external', async (event, url) => {
    if (url && typeof url === 'string') {
      try {
        await shell.openExternal(url);
        return { success: true };
      } catch (error) {
        console.error('[App IPC] Failed to open external URL:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Invalid URL' };
  });
}

function setupSyncIPC() {
  const syncServer = require('./syncServer.cjs');
  const { getSignalingServer } = require('./signalingServer.cjs');

  // Start sync server (WiFi - LAN only)
  ipcMain.handle('sync:start', async () => {
    try {
      const result = await syncServer.startSyncServer(db);
      console.log('[SyncIPC] Server started:', result);
      return { success: true, ...result };
    } catch (error) {
      console.error('[SyncIPC] Failed to start server:', error);
      return { success: false, error: error.message };
    }
  });

  // Stop sync server
  ipcMain.handle('sync:stop', () => {
    syncServer.stopSyncServer();
    return { success: true };
  });

  // Get server status
  ipcMain.handle('sync:status', () => {
    return syncServer.getSyncServerStatus();
  });

  // Generate QR code
  ipcMain.handle('sync:qr', async () => {
    try {
      const status = syncServer.getSyncServerStatus();
      if (!status.running) {
        return { success: false, error: 'Server not running' };
      }
      const qr = await syncServer.generateQRCode(status.ip, status.port);
      return { success: true, ...qr };
    } catch (error) {
      console.error('[SyncIPC] Failed to generate QR:', error);
      return { success: false, error: error.message };
    }
  });

  // Get local IP
  ipcMain.handle('sync:ip', () => {
    return { ip: syncServer.getLocalIP() };
  });

  // ========== P2P Signaling Server (WebRTC) ==========

  // Start P2P signaling server
  ipcMain.handle('p2p:start-signaling', async (event, port = 8766) => {
    try {
      const signalingServer = getSignalingServer();
      const result = await signalingServer.start(port);
      console.log('[P2P IPC] Signaling server started:', result);
      return { success: true, port: result.port, ip: syncServer.getLocalIP() };
    } catch (error) {
      console.error('[P2P IPC] Failed to start signaling:', error);
      return { success: false, error: error.message };
    }
  });

  // Stop P2P signaling server
  ipcMain.handle('p2p:stop-signaling', () => {
    const signalingServer = getSignalingServer();
    signalingServer.stop();
    return { success: true };
  });

  // Get P2P signaling status
  ipcMain.handle('p2p:signaling-status', () => {
    const signalingServer = getSignalingServer();
    return signalingServer.getStatus();
  });

  // Generate P2P connection QR code
  ipcMain.handle('p2p:generate-qr', async (event, peerId) => {
    try {
      const signalingServer = getSignalingServer();
      const status = signalingServer.getStatus();

      if (!status.running) {
        return { success: false, error: 'Signaling server not running' };
      }

      const ip = syncServer.getLocalIP();
      const connectionInfo = {
        type: 'neural-pad-p2p',
        peerId: peerId,
        signalingUrl: `ws://${ip}:${status.port}`,
        timestamp: Date.now()
      };

      const QRCode = require('qrcode');
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(connectionInfo), {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });

      return {
        success: true,
        qrDataUrl,
        connectionInfo,
        url: `ws://${ip}:${status.port}`
      };
    } catch (error) {
      console.error('[P2P IPC] Failed to generate QR:', error);
      return { success: false, error: error.message };
    }
  });
}

function setupSpeechIPC() {
  const whisperService = require('./whisperService.cjs');

  // Start Whisper service
  ipcMain.handle('whisper:start', async (event, modelSize = 'base') => {
    try {
      await whisperService.start(modelSize);
      return { success: true };
    } catch (error) {
      console.error('[Whisper IPC] Start error:', error);
      return { success: false, error: error.message };
    }
  });

  // Transcribe audio
  ipcMain.handle('whisper:transcribe', async (event, audioBuffer, language = 'tr') => {
    try {
      console.log('[Whisper IPC] Transcribing audio, size:', audioBuffer.length);
      const transcript = await whisperService.transcribe(Buffer.from(audioBuffer), language);
      console.log('[Whisper IPC] Transcript:', transcript);
      return { success: true, transcript };
    } catch (error) {
      console.error('[Whisper IPC] Transcribe error:', error);
      return { success: false, error: error.message };
    }
  });

  // Stop Whisper service
  ipcMain.handle('whisper:stop', () => {
    whisperService.stop();
    return { success: true };
  });

  // Speech API handlers for Electron IPC
  ipcMain.handle('speech:transcribe-audio', async (event, audioData) => {
    try {
      console.log('[Speech IPC] Received audio data, size:', audioData.length);

      // Use Whisper service to transcribe the audio
      const transcript = await whisperService.transcribe(Buffer.from(audioData), 'tr');
      console.log('[Speech IPC] Transcription result:', transcript);

      // Send result back to renderer
      event.sender.send('speech:transcription-result', transcript);

      return { success: true, transcript };
    } catch (error) {
      console.error('[Speech IPC] Transcription error:', error);
      return { success: false, error: error.message };
    }
  });
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Icon path - check if exists to avoid errors
  const iconPath = path.join(__dirname, '..', '..', 'build', 'icons', 'app.ico');

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    autoHideMenuBar: true,
    ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
      sandbox: false, // Required for Web Speech API in Electron
      webSecurity: false, // Required for Web Speech API to connect to Google servers
      allowRunningInsecureContent: true, // Allow mixed content for Web Speech API
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow && mainWindow.show());

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5175');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Use file:// protocol - resolve absolute path
    // In production, __dirname is dist-electron/electron, so we go up two levels to project root
    const projectRoot = path.resolve(__dirname, '..', '..');
    const indexPath = path.join(projectRoot, 'dist', 'index.html');
    console.log('[Main] __dirname:', __dirname);
    console.log('[Main] Project root:', projectRoot);
    console.log('[Main] Loading file:', indexPath);
    console.log('[Main] File exists:', fs.existsSync(indexPath));
    mainWindow.loadFile(indexPath);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle standard navigation events (like window.location.href = 'mailto:...')
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('http')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Automatically grant permissions for microphone, Web Speech API, and clipboard
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'microphone', 'audioCapture', 'mediaDevices', 'clipboard-sanitized-write', 'clipboard-read'];
    if (allowedPermissions.includes(permission)) {
      console.log('[Permissions] Granted:', permission);
      callback(true);
    } else {
      console.log('[Permissions] Denied:', permission);
      callback(false);
    }
  });

  // Set permission check handler for Web Speech API and clipboard
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    const allowedPermissions = ['media', 'microphone', 'audioCapture', 'mediaDevices', 'clipboard-sanitized-write', 'clipboard-read'];
    const allowed = allowedPermissions.includes(permission);
    console.log('[Permissions Check]', permission, '→', allowed);
    return allowed;
  });

  // Register keyboard shortcuts for DevTools
  // F12 - Toggle DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    }
    // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac) - Toggle DevTools
    if ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    }
  });
}

app.whenReady().then(() => {
  // Load database and settings after app is ready
  db = require('../utils/db.cjs');
  settings = require('./settings.cjs');

  // --- Start Database File Check ---
  const dbCheckPath = path.join(app.getPath('userData'), 'neural-pad.sqlite');
  console.log(`[DB Check] Checking for database file at: ${dbCheckPath}`);
  if (fs.existsSync(dbCheckPath)) {
    console.log('[DB Check] ✅ SUCCESS: Database file found.');
  } else {
    console.log('[DB Check] ❌ ERROR: Database file NOT found.');
  }
  // --- End Database File Check ---

  // Disable CSP completely for Web Speech API to work
  // Web Speech API requires unrestricted access to Google servers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // Remove CSP header completely
      }
    });
  });

  // Lightweight network instrumentation to trace POST/upload errors
  try {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      if (details.method === 'POST' || (details.uploadData && details.uploadData.length > 0)) {
        console.log('[NetLog] onBeforeRequest', {
          method: details.method,
          url: details.url,
          hasUploadData: !!details.uploadData,
        });
      }
      callback({});
    });

    session.defaultSession.webRequest.onCompleted((details) => {
      if (details.method === 'POST') {
        console.log('[NetLog] onCompleted', {
          method: details.method,
          url: details.url,
          statusCode: details.statusCode,
          error: details.error,
        });
      }
    });

    session.defaultSession.webRequest.onSendHeaders((details) => {
      if (details.method === 'POST') {
        console.log('[NetLog] onSendHeaders', {
          url: details.url,
          requestHeaders: details.requestHeaders,
        });
      }
    });

    session.defaultSession.webRequest.onErrorOccurred((details) => {
      console.warn('[NetLog] onErrorOccurred', {
        method: details.method,
        url: details.url,
        error: details.error,
        fromCache: details.fromCache,
        resourceType: details.resourceType,
      });
    });
  } catch (e) {
    console.warn('[NetLog] Instrumentation error:', e);
  }

  const distPath = path.join(__dirname, '../../dist');
  const userDataPath = app.getPath('userData');

  // app:// protocol removed - using file:// for Web Speech API compatibility
  // Images will be loaded using file:// protocol directly

  setupFileIPC();
  setupDatabaseIPC();
  setupSettingsIPC();
  setupSpeechIPC();
  setupAppIPC();
  setupSyncIPC();

  if (process.platform === 'win32') {
    app.setAppUserModelId('com.neural-pad.app');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
