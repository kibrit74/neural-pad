"use strict";
const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');
class WhisperService {
    constructor() {
        this.process = null;
        this.isReady = false;
        this.modelSize = 'base';
        this.queue = [];
        this.isProcessing = false;
        this.pendingRequests = [];
    }
    async start(modelSize = 'base') {
        if (this.process) {
            console.log('[Whisper] Already running');
            return;
        }
        this.modelSize = modelSize;
        const pythonScript = path.join(__dirname, '..', '..', 'python', 'whisper_server.py');
        console.log('[Whisper] Starting Python process...');
        console.log('[Whisper] Script path:', pythonScript);
        console.log('[Whisper] Model size:', modelSize);
        try {
            this.process = spawn('python', [pythonScript, modelSize], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            this.process.stdout.on('data', (data) => {
                const lines = data.toString().split('\n').filter(line => line.trim());
                lines.forEach(line => {
                    // Skip empty lines and non-JSON output
                    if (!line.trim() || !line.startsWith('{')) {
                        return;
                    }
                    try {
                        const message = JSON.parse(line);
                        console.log('[Whisper]', message);
                        if (message.status === 'ready') {
                            this.isReady = true;
                            console.log('[Whisper] Ready!');
                        }
                        else if (message.status === 'success' || message.status === 'error') {
                            // Handle transcription result
                            const callback = this.queue.shift();
                            if (callback) {
                                callback(message);
                            }
                        }
                    }
                    catch (e) {
                        // Ignore parse errors for non-JSON lines (like model loading messages)
                        if (line.includes('{')) {
                            console.error('[Whisper] Failed to parse JSON:', line.substring(0, 100));
                        }
                    }
                });
            });
            this.process.stderr.on('data', (data) => {
                const message = data.toString();
                // Log all stderr output for debugging
                const lines = message.split('\n').filter(line => line.trim());
                lines.forEach(line => {
                    if (line.includes('error') || line.includes('Error') || line.includes('failed')) {
                        console.error('[Whisper Error]', line);
                    }
                    else if (line.includes('[Whisper Python]')) {
                        console.log(line); // Log Python debug messages
                    }
                    else if (!line.includes('FP16') && !line.includes('CUDA')) {
                        // Skip common non-error messages
                        console.log('[Whisper Info]', line.substring(0, 200));
                    }
                });
            });
            this.process.on('close', (code) => {
                console.log('[Whisper] Process exited with code', code);
                this.process = null;
                this.isReady = false;
            });
            // Wait for ready status
            await this.waitForReady();
        }
        catch (error) {
            console.error('[Whisper] Failed to start:', error);
            throw error;
        }
    }
    waitForReady(timeout = 30000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkReady = setInterval(() => {
                if (this.isReady) {
                    clearInterval(checkReady);
                    resolve();
                }
                else if (Date.now() - startTime > timeout) {
                    clearInterval(checkReady);
                    reject(new Error('Whisper startup timeout'));
                }
            }, 100);
        });
    }
    async transcribe(audioBuffer, language = 'tr') {
        if (!this.isReady) {
            throw new Error('Whisper not ready');
        }
        // Queue requests to prevent stdin buffer corruption
        return new Promise((resolve, reject) => {
            this.pendingRequests.push({ audioBuffer, language, resolve, reject });
            this._processNextRequest();
        });
    }
    async _processNextRequest() {
        // If already processing or no pending requests, return
        if (this.isProcessing || this.pendingRequests.length === 0) {
            return;
        }
        this.isProcessing = true;
        const request = this.pendingRequests.shift();
        const { audioBuffer, language, resolve, reject } = request;
        let timeoutId = null;
        let isResolved = false;
        try {
            // Add callback to queue with timeout tracking
            const callback = (result) => {
                if (isResolved)
                    return;
                isResolved = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                this.isProcessing = false;
                if (result.status === 'success') {
                    resolve(result.text || '');
                }
                else {
                    reject(new Error(result.message || 'Transcription failed'));
                }
                // Process next request in queue
                setImmediate(() => this._processNextRequest());
            };
            this.queue.push(callback);
            // Send command
            const command = {
                action: 'transcribe',
                length: audioBuffer.length,
                language: language
            };
            console.log('[Whisper] Sending transcription request:', {
                size: audioBuffer.length,
                language,
                queueLength: this.pendingRequests.length
            });
            this.process.stdin.write(JSON.stringify(command) + '\n');
            this.process.stdin.write(audioBuffer);
            // Timeout - 15 seconds should be enough for base model
            timeoutId = setTimeout(() => {
                if (isResolved)
                    return;
                isResolved = true;
                // Remove callback from queue
                const index = this.queue.indexOf(callback);
                if (index > -1) {
                    this.queue.splice(index, 1);
                }
                this.isProcessing = false;
                console.error('[Whisper] Transcription timeout after 15s');
                reject(new Error('Transcription timeout - Python service not responding'));
                // Process next request in queue
                setImmediate(() => this._processNextRequest());
            }, 15000);
        }
        catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            this.isProcessing = false;
            reject(error);
            // Process next request in queue
            setImmediate(() => this._processNextRequest());
        }
    }
    async stop() {
        if (!this.process) {
            return;
        }
        console.log('[Whisper] Stopping...');
        // Clear pending requests
        this.pendingRequests.forEach(req => {
            req.reject(new Error('Whisper service stopped'));
        });
        this.pendingRequests = [];
        this.queue = [];
        this.isProcessing = false;
        try {
            this.process.stdin.write(JSON.stringify({ action: 'exit' }) + '\n');
            // Wait for graceful shutdown
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            if (this.process) {
                this.process.kill();
            }
        }
        catch (error) {
            console.error('[Whisper] Error stopping:', error);
            if (this.process) {
                this.process.kill('SIGKILL');
            }
        }
        this.process = null;
        this.isReady = false;
    }
    async ping() {
        if (!this.process) {
            return false;
        }
        try {
            this.process.stdin.write(JSON.stringify({ action: 'ping' }) + '\n');
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
module.exports = new WhisperService();
