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
    saveImage: (buffer) => ipcRenderer.invoke('files:save-image', buffer),
  },
  speech: {
    // Send audio data to main process for transcription
    sendAudioData: (audioBlob) => ipcRenderer.invoke('speech:transcribe-audio', audioBlob),
    // Listen for transcription results
    onTranscription: (callback) => {
      const listener = (event, text) => callback(text);
      ipcRenderer.on('speech:transcription-result', listener);
      return () => ipcRenderer.removeListener('speech:transcription-result', listener);
    }
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);


