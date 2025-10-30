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

// First-run cleanup for packaged app
// This ensures users get a clean install without dev data
window.addEventListener('DOMContentLoaded', () => {
  const isFirstRun = !localStorage.getItem('appInstalled')
  
  if (isFirstRun) {
    console.log('🎉 First run detected - initializing clean state...')
    
    // Clear any existing data
    localStorage.clear()
    
    // Clear IndexedDB (your DB name from db.ts)
    if (window.indexedDB) {
      window.indexedDB.deleteDatabase('GeminiWriterDB')
    }
    
    // Set default settings (NO API KEYS)
    const defaultSettings = {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      apiProvider: 'gemini',
      autoSave: false,
    }
    localStorage.setItem('gemini-writer-settings', JSON.stringify(defaultSettings))
    
    // Mark as installed
    localStorage.setItem('appInstalled', 'true')
    localStorage.setItem('installDate', new Date().toISOString())
    
    console.log('✅ Clean state initialized - no notes, no API keys, default settings')
  }
})
