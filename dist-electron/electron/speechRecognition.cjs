"use strict";
const { ipcMain } = require('electron');
const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');
// The @xenova/transformers library is an ES Module, so we must use dynamic import().
// Worker-based implementation to avoid blocking the main process
let worker = null;
let isInitialized = false;
const pending = new Map(); // id -> { resolve, reject }
let nextId = 1;
let selectedModel = process.env.WHISPER_MODEL || null;
function resolveWorkerPath() {
    // Prefer compiled worker next to this file
    const direct = path.join(__dirname, 'speechWorker.cjs');
    if (fs.existsSync(direct))
        return direct;
    // Fallback to source worker in project (during dev)
    const fallback = path.join(__dirname, '../../electron/speechWorker.cjs');
    if (fs.existsSync(fallback))
        return fallback;
    // Last resort: CWD-based path
    const alt = path.join(process.cwd(), 'electron', 'speechWorker.cjs');
    return alt;
}
function ensureWorker() {
    if (worker)
        return worker;
    const workerPath = resolveWorkerPath();
    worker = new Worker(workerPath);
    worker.on('message', (msg) => {
        const { id, type } = msg || {};
        if (type === 'initialized') {
            isInitialized = true;
            return;
        }
        const entry = pending.get(id);
        if (!entry)
            return; // unknown or already handled
        if (type && type.endsWith(':done')) {
            pending.delete(id);
            entry.resolve(msg);
        }
        else if (type === 'error') {
            pending.delete(id);
            entry.reject(new Error(msg.error || 'Worker error'));
        }
    });
    worker.on('error', (err) => {
        console.error('[SpeechWorker] Error:', err);
    });
    worker.on('exit', (code) => {
        console.error('[SpeechWorker] Exited with code:', code);
        worker = null;
        isInitialized = false;
    });
    return worker;
}
function callWorker(type, payload) {
    ensureWorker();
    return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, type, payload });
    });
}
function setupSpeechRecognition() {
    // Initialize worker and model in background
    ensureWorker();
    try {
        // Try to read preferred model from persisted settings
        const settings = require('./settings.cjs');
        const settingsData = settings.getSettings();
        selectedModel = settingsData.sttModel || selectedModel || 'Xenova/whisper-tiny';
    }
    catch { }
    callWorker('initialize', { model: selectedModel }).catch((err) => {
        console.error('[SpeechInit] Background initialization failed:', err);
    });
    ipcMain.handle('speech:initialize', async () => {
        try {
            await callWorker('initialize', { model: selectedModel || 'Xenova/whisper-tiny' });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle('speech:transcribe', async (event, { audioData, language }) => {
        try {
            const { text, language: lang } = await callWorker('transcribe', { audioData, language, model: selectedModel || 'Xenova/whisper-tiny' });
            const label = lang || language || 'auto';
            console.log(`Transcription result (${label}):`, text);
            return { success: true, text };
        }
        catch (error) {
            console.error('Transcription error details:', error);
            return { success: false, error: error.message || String(error) };
        }
    });
    ipcMain.handle('speech:isInitialized', async () => {
        try {
            const { isInitialized: ok } = await callWorker('isInitialized');
            return ok;
        }
        catch {
            return false;
        }
    });
}
module.exports = {
    setupSpeechRecognition,
    // Initialize via worker to avoid blocking the main process
    initializeSpeechRecognizer: () => callWorker('initialize'),
};
