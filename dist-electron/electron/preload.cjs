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
        export: (content, filename) => electron_1.ipcRenderer.invoke('files:export', { content, filename }),
        saveAs: (noteData) => electron_1.ipcRenderer.invoke('files:save-as', noteData),
        saveTemp: (content, filename) => electron_1.ipcRenderer.invoke('files:save-temp', { content, filename }),
        saveImage: (data) => electron_1.ipcRenderer.invoke('files:save-image', data),
    },
    speech: {
        start: (options) => electron_1.ipcRenderer.send('speech:start', options),
        stop: () => electron_1.ipcRenderer.send('speech:stop'),
        onResult: (callback) => electron_1.ipcRenderer.on('speech:result', (e, text) => callback(text)),
        onError: (callback) => electron_1.ipcRenderer.on('speech:error', (e, err) => callback(err)),
        onStatus: (callback) => electron_1.ipcRenderer.on('speech:status', (e, status) => callback(status)),
    },
    whisper: {
        transcribe: (audioBlob, model) => electron_1.ipcRenderer.invoke('whisper:transcribe', audioBlob, model),
    },
    showNotification: (options) => electron_1.ipcRenderer.send('app:show-notification', options),
    showItemInFolder: (filePath) => electron_1.ipcRenderer.send('app:show-item-in-folder', filePath),
    openExternal: (url) => electron_1.ipcRenderer.invoke('app:open-external', url),
    sync: {
        start: () => electron_1.ipcRenderer.invoke('sync:start'),
        stop: () => electron_1.ipcRenderer.invoke('sync:stop'),
        status: () => electron_1.ipcRenderer.invoke('sync:status'),
        qr: () => electron_1.ipcRenderer.invoke('sync:qr'),
        ip: () => electron_1.ipcRenderer.invoke('sync:ip'),
    },
};
electron_1.contextBridge.exposeInMainWorld('electron', electronAPI);
