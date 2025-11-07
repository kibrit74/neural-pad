"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    isElectron: true,
    platform: process.platform,
    db: {
        saveNote: (note) => electron_1.ipcRenderer.invoke('db:save-note', note),
        getAllNotes: () => electron_1.ipcRenderer.invoke('db:get-all-notes'),
        getNote: (id) => electron_1.ipcRenderer.invoke('db:get-note', id),
        getHistory: (noteId) => electron_1.ipcRenderer.invoke('db:get-history', noteId),
        deleteNote: (id) => electron_1.ipcRenderer.invoke('db:delete-note', id),
    },
    settings: {
        get: (key) => electron_1.ipcRenderer.invoke('settings:get', key),
        set: (key, value) => electron_1.ipcRenderer.invoke('settings:set', key, value),
    },
    files: {
        saveImage: (buffer) => electron_1.ipcRenderer.invoke('files:save-image', buffer),
    },
    speech: {
        // Send audio data to main process for transcription
        sendAudioData: (audioBlob) => electron_1.ipcRenderer.invoke('speech:transcribe-audio', audioBlob),
        // Listen for transcription results
        onTranscription: (callback) => {
            const listener = (event, text) => callback(text);
            electron_1.ipcRenderer.on('speech:transcription-result', listener);
            return () => electron_1.ipcRenderer.removeListener('speech:transcription-result', listener);
        }
    },
    whisper: {
        start: (modelSize) => electron_1.ipcRenderer.invoke('whisper:start', modelSize),
        transcribe: (audioBuffer, language) => electron_1.ipcRenderer.invoke('whisper:transcribe', audioBuffer, language),
        stop: () => electron_1.ipcRenderer.invoke('whisper:stop'),
    },
};
electron_1.contextBridge.exposeInMainWorld('electron', electronAPI);
