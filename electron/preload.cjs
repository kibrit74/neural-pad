import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  isElectron: true,
  platform: process.platform,
  db: {
    saveNote: (note) => ipcRenderer.invoke('db:save-note', note),
    getAllNotes: () => ipcRenderer.invoke('db:get-all-notes'),
    getNote: (id) => ipcRenderer.invoke('db:get-note', id),
    getHistory: (noteId) => ipcRenderer.invoke('db:get-history', noteId),
    deleteNote: (id) => ipcRenderer.invoke('db:delete-note', id),
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },
  files: {
    export: (content, filename) => ipcRenderer.invoke('files:export', { content, filename }),
    saveAs: (noteData) => ipcRenderer.invoke('files:save-as', noteData),
    saveTemp: (content, filename) => ipcRenderer.invoke('files:save-temp', { content, filename }),
    saveImage: (data) => ipcRenderer.invoke('files:save-image', data),
  },
  speech: {
    start: (options) => ipcRenderer.send('speech:start', options),
    stop: () => ipcRenderer.send('speech:stop'),
    onResult: (callback) => ipcRenderer.on('speech:result', (e, text) => callback(text)),
    onError: (callback) => ipcRenderer.on('speech:error', (e, err) => callback(err)),
    onStatus: (callback) => ipcRenderer.on('speech:status', (e, status) => callback(status)),
  },
  whisper: {
    transcribe: (audioBlob, model) => ipcRenderer.invoke('whisper:transcribe', audioBlob, model),
  },
  showNotification: (options) => ipcRenderer.send('app:show-notification', options),
  showItemInFolder: (filePath) => ipcRenderer.send('app:show-item-in-folder', filePath),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
  sync: {
    start: () => ipcRenderer.invoke('sync:start'),
    stop: () => ipcRenderer.invoke('sync:stop'),
    status: () => ipcRenderer.invoke('sync:status'),
    qr: () => ipcRenderer.invoke('sync:qr'),
    ip: () => ipcRenderer.invoke('sync:ip'),
  },
  p2p: {
    startSignaling: (port) => ipcRenderer.invoke('p2p:start-signaling', port),
    stopSignaling: () => ipcRenderer.invoke('p2p:stop-signaling'),
    status: () => ipcRenderer.invoke('p2p:signaling-status'),
    generateQR: (peerId) => ipcRenderer.invoke('p2p:generate-qr', peerId),
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    onChecking: (callback) => ipcRenderer.on('update:checking', callback),
    onAvailable: (callback) => ipcRenderer.on('update:available', (e, info) => callback(info)),
    onNotAvailable: (callback) => ipcRenderer.on('update:not-available', (e, info) => callback(info)),
    onProgress: (callback) => ipcRenderer.on('update:progress', (e, progress) => callback(progress)),
    onDownloaded: (callback) => ipcRenderer.on('update:downloaded', (e, info) => callback(info)),
    onError: (callback) => ipcRenderer.on('update:error', (e, err) => callback(err)),
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);
