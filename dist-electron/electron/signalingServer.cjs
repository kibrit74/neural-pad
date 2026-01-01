"use strict";
/**
 * Signaling Server for WebRTC P2P Connections
 * Bu sunucu sadece peer'ları tanıştırır - VERİ AKTARMAZ
 * Electron içinde veya harici olarak çalıştırılabilir
 */
const WebSocket = require('ws');
class SignalingServer {
    constructor() {
        this.wss = null;
        this.peers = new Map(); // peerId -> WebSocket
        this.port = null;
    }
    /**
     * Sunucuyu başlat
     * @param {number} port - Dinlenecek port (varsayılan 8766)
     */
    start(port = 8766) {
        return new Promise((resolve, reject) => {
            const tryPort = (currentPort) => {
                try {
                    this.wss = new WebSocket.Server({ port: currentPort });
                    this.port = currentPort;
                    this.wss.on('listening', () => {
                        console.log(`[Signaling] ✅ Server running on port ${currentPort}`);
                        resolve({ port: currentPort });
                    });
                    this.wss.on('connection', (ws) => {
                        this.handleConnection(ws);
                    });
                    this.wss.on('error', (error) => {
                        if (error.code === 'EADDRINUSE') {
                            console.log(`[Signaling] Port ${currentPort} in use, trying ${currentPort + 1}...`);
                            this.wss = null;
                            if (currentPort < port + 10) {
                                tryPort(currentPort + 1);
                            }
                            else {
                                reject(new Error('No available ports found'));
                            }
                        }
                        else {
                            console.error('[Signaling] Server error:', error);
                            reject(error);
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            };
            tryPort(port);
        });
    }
    /**
     * Yeni bağlantıyı işle
     */
    handleConnection(ws) {
        let peerId = null;
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(ws, message, peerId, (newPeerId) => {
                    peerId = newPeerId;
                });
            }
            catch (error) {
                console.error('[Signaling] Message parse error:', error);
            }
        });
        ws.on('close', () => {
            if (peerId) {
                console.log(`[Signaling] Peer disconnected: ${peerId}`);
                this.peers.delete(peerId);
                this.broadcastPeerList();
            }
        });
        ws.on('error', (error) => {
            console.error('[Signaling] Client error:', error.message);
        });
    }
    /**
     * Mesajları işle
     */
    handleMessage(ws, message, currentPeerId, setPeerId) {
        switch (message.type) {
            case 'register':
                // Peer kayıt ol
                const peerId = message.peerId;
                this.peers.set(peerId, ws);
                setPeerId(peerId);
                console.log(`[Signaling] Peer registered: ${peerId}`);
                // Kayıt onayı gönder
                ws.send(JSON.stringify({
                    type: 'registered',
                    peerId: peerId,
                    onlinePeers: Array.from(this.peers.keys()).filter(id => id !== peerId)
                }));
                // Diğerlerine bildir
                this.broadcastPeerList();
                break;
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // Hedef peer'a ilet
                const targetPeer = this.peers.get(message.targetPeerId);
                if (targetPeer && targetPeer.readyState === WebSocket.OPEN) {
                    targetPeer.send(JSON.stringify(message));
                }
                else {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Target peer not found or offline'
                    }));
                }
                break;
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;
        }
    }
    /**
     * Tüm peer'lara güncel listeyi gönder
     */
    broadcastPeerList() {
        const peerIds = Array.from(this.peers.keys());
        const message = JSON.stringify({
            type: 'peer-list',
            peers: peerIds
        });
        this.peers.forEach((ws, peerId) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    }
    /**
     * Sunucuyu durdur
     */
    stop() {
        if (this.wss) {
            this.wss.close();
            this.wss = null;
            this.peers.clear();
            console.log('[Signaling] Server stopped');
        }
    }
    /**
     * Sunucu durumunu al
     */
    getStatus() {
        return {
            running: this.wss !== null,
            port: this.port,
            connectedPeers: this.peers.size,
            peerIds: Array.from(this.peers.keys())
        };
    }
}
// Singleton instance
let signalingServer = null;
function getSignalingServer() {
    if (!signalingServer) {
        signalingServer = new SignalingServer();
    }
    return signalingServer;
}
module.exports = {
    SignalingServer,
    getSignalingServer
};
