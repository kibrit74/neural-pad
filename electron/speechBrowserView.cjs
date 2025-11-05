const { BrowserView, ipcMain } = require('electron');

/**
 * Speech Browser View for Electron
 * Opens a real browser context for Web Speech API to work properly
 */

let speechView = null;
let mainWindow = null;

function setupSpeechBrowserView(window) {
  mainWindow = window;

  // Create speech recognition in browser view
  ipcMain.handle('speech-view:start', async (event, { language = 'tr-TR' }) => {
    try {
      if (speechView) {
        // Reuse existing view
        return { success: true, message: 'View already exists' };
      }

      // Create a BrowserView with real browser context
      speechView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true, // Enable sandbox for real browser context
          webSecurity: true, // Enable web security
        }
      });

      mainWindow.setBrowserView(speechView);

      // Position it off-screen (invisible)
      speechView.setBounds({ x: 0, y: 0, width: 1, height: 1 });

      // Load a simple HTML page with Web Speech API
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Speech Recognition</title>
        </head>
        <body>
          <script>
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (SpeechRecognition) {
              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = '${language}';
              
              recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                  .map(result => result[0])
                  .map(result => result.transcript)
                  .join('');
                
                const isFinal = event.results[event.results.length - 1]?.isFinal;
                
                // Send result back to main process
                console.log('Speech result:', transcript, isFinal);
              };
              
              recognition.onerror = (event) => {
                console.error('Speech error:', event.error);
              };
              
              recognition.start();
              console.log('Speech recognition started');
            } else {
              console.error('Web Speech API not supported');
            }
          </script>
        </body>
        </html>
      `;

      speechView.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      return { success: true };
    } catch (error) {
      console.error('[SpeechView] Error:', error);
      return { success: false, error: error.message };
    }
  });

  // Stop speech recognition
  ipcMain.handle('speech-view:stop', async () => {
    try {
      if (speechView) {
        mainWindow.removeBrowserView(speechView);
        speechView.webContents.close();
        speechView = null;
      }
      return { success: true };
    } catch (error) {
      console.error('[SpeechView] Stop error:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupSpeechBrowserView };
