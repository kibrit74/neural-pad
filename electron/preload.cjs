const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
  speech: {
    initialize: () => ipcRenderer.invoke('speech:initialize'),
    transcribe: (audioData) => ipcRenderer.invoke('speech:transcribe', audioData),
    isInitialized: () => ipcRenderer.invoke('speech:isInitialized'),
  },
})
