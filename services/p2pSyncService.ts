/**
 * P2P Sync Service
 * WebRTC tabanlı peer-to-peer senkronizasyon
 * Bulut depolama KULLANMAZ - sadece signaling için bağlantı
 */

// Public STUN servers for NAT traversal
const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
];

export interface P2PSyncConfig {
    peerId: string;
    onDataReceived: (data: any) => void;
    onConnectionStateChange: (state: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
    onError: (error: Error) => void;
}

export interface SyncMessage {
    type: 'sync-request' | 'sync-response' | 'note-update' | 'note-delete' | 'ping' | 'pong';
    payload?: any;
    timestamp: number;
}

class P2PSyncService {
    private peerConnection: RTCPeerConnection | null = null;
    private dataChannel: RTCDataChannel | null = null;
    private config: P2PSyncConfig | null = null;
    private localPeerId: string = '';
    private remotePeerId: string = '';
    private signalingSocket: WebSocket | null = null;
    private isInitiator: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    /**
     * Benzersiz peer ID oluştur
     */
    generatePeerId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `np-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Signaling sunucusuna bağlan
     * Not: Gerçek implementasyonda kendi signaling sunucunuz olmalı
     * Şimdilik basit bir WebSocket mock kullanıyoruz
     */
    async connectToSignaling(signalingUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.signalingSocket = new WebSocket(signalingUrl);

                this.signalingSocket.onopen = () => {
                    console.log('[P2P] Signaling connected');
                    // Register with peer ID
                    this.sendSignaling({
                        type: 'register',
                        peerId: this.localPeerId
                    });
                    resolve();
                };

                this.signalingSocket.onmessage = async (event) => {
                    const message = JSON.parse(event.data);
                    await this.handleSignalingMessage(message);
                };

                this.signalingSocket.onerror = (error) => {
                    console.error('[P2P] Signaling error:', error);
                    reject(new Error('Signaling connection failed'));
                };

                this.signalingSocket.onclose = () => {
                    console.log('[P2P] Signaling disconnected');
                    this.config?.onConnectionStateChange('disconnected');
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Signaling mesajlarını işle
     */
    private async handleSignalingMessage(message: any): Promise<void> {
        switch (message.type) {
            case 'offer':
                await this.handleOffer(message);
                break;
            case 'answer':
                await this.handleAnswer(message);
                break;
            case 'ice-candidate':
                await this.handleIceCandidate(message);
                break;
            case 'peer-connected':
                console.log('[P2P] Remote peer connected:', message.peerId);
                break;
        }
    }

    /**
     * WebRTC bağlantısını başlat
     */
    async initializeConnection(config: P2PSyncConfig): Promise<void> {
        this.config = config;
        this.localPeerId = config.peerId;

        this.peerConnection = new RTCPeerConnection({
            iceServers: ICE_SERVERS
        });

        // ICE candidate handling
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignaling({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    targetPeerId: this.remotePeerId
                });
            }
        };

        // Connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection?.connectionState;
            console.log('[P2P] Connection state:', state);

            switch (state) {
                case 'connecting':
                    config.onConnectionStateChange('connecting');
                    break;
                case 'connected':
                    config.onConnectionStateChange('connected');
                    this.reconnectAttempts = 0;
                    break;
                case 'disconnected':
                case 'failed':
                    config.onConnectionStateChange('disconnected');
                    this.attemptReconnect();
                    break;
            }
        };

        // Handle incoming data channel
        this.peerConnection.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };
    }

    /**
     * Bağlantı başlat (initiator olarak)
     */
    async connectToPeer(remotePeerId: string): Promise<void> {
        if (!this.peerConnection || !this.signalingSocket) {
            throw new Error('P2P not initialized');
        }

        this.remotePeerId = remotePeerId;
        this.isInitiator = true;

        // Create data channel
        const dataChannel = this.peerConnection.createDataChannel('sync', {
            ordered: true
        });
        this.setupDataChannel(dataChannel);

        // Create and send offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.sendSignaling({
            type: 'offer',
            offer: offer,
            targetPeerId: remotePeerId,
            fromPeerId: this.localPeerId
        });

        this.config?.onConnectionStateChange('connecting');
    }

    /**
     * Offer'ı işle (responder olarak)
     */
    private async handleOffer(message: any): Promise<void> {
        if (!this.peerConnection) return;

        this.remotePeerId = message.fromPeerId;
        this.isInitiator = false;

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.sendSignaling({
            type: 'answer',
            answer: answer,
            targetPeerId: this.remotePeerId,
            fromPeerId: this.localPeerId
        });
    }

    /**
     * Answer'ı işle
     */
    private async handleAnswer(message: any): Promise<void> {
        if (!this.peerConnection) return;
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
    }

    /**
     * ICE candidate işle
     */
    private async handleIceCandidate(message: any): Promise<void> {
        if (!this.peerConnection) return;
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }

    /**
     * Data channel kurulumu
     */
    private setupDataChannel(channel: RTCDataChannel): void {
        this.dataChannel = channel;

        channel.onopen = () => {
            console.log('[P2P] Data channel open');
            // Send ping to confirm connection
            this.sendMessage({ type: 'ping', timestamp: Date.now() });
        };

        channel.onclose = () => {
            console.log('[P2P] Data channel closed');
        };

        channel.onmessage = (event) => {
            try {
                const message: SyncMessage = JSON.parse(event.data);
                this.handleDataMessage(message);
            } catch (error) {
                console.error('[P2P] Failed to parse message:', error);
            }
        };

        channel.onerror = (error) => {
            console.error('[P2P] Data channel error:', error);
            this.config?.onError(new Error('Data channel error'));
        };
    }

    /**
     * Data mesajlarını işle
     */
    private handleDataMessage(message: SyncMessage): void {
        switch (message.type) {
            case 'ping':
                this.sendMessage({ type: 'pong', timestamp: Date.now() });
                break;
            case 'pong':
                console.log('[P2P] Connection confirmed, latency:', Date.now() - message.timestamp, 'ms');
                break;
            case 'sync-request':
            case 'sync-response':
            case 'note-update':
            case 'note-delete':
                this.config?.onDataReceived(message);
                break;
        }
    }

    /**
     * Mesaj gönder
     */
    sendMessage(message: SyncMessage): boolean {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
            console.warn('[P2P] Data channel not ready');
            return false;
        }

        try {
            this.dataChannel.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('[P2P] Failed to send message:', error);
            return false;
        }
    }

    /**
     * Signaling mesajı gönder
     */
    private sendSignaling(message: any): void {
        if (this.signalingSocket?.readyState === WebSocket.OPEN) {
            this.signalingSocket.send(JSON.stringify(message));
        }
    }

    /**
     * Yeniden bağlanmayı dene
     */
    private async attemptReconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[P2P] Max reconnect attempts reached');
            this.config?.onError(new Error('Connection lost'));
            return;
        }

        this.reconnectAttempts++;
        console.log(`[P2P] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        // Wait before reconnecting
        await new Promise(resolve => setTimeout(resolve, 2000 * this.reconnectAttempts));

        if (this.isInitiator && this.remotePeerId) {
            await this.connectToPeer(this.remotePeerId);
        }
    }

    /**
     * Not senkronizasyonu iste
     */
    requestSync(): void {
        this.sendMessage({
            type: 'sync-request',
            timestamp: Date.now()
        });
    }

    /**
     * Not güncelleme gönder
     */
    sendNoteUpdate(note: any): void {
        this.sendMessage({
            type: 'note-update',
            payload: note,
            timestamp: Date.now()
        });
    }

    /**
     * Not silme gönder
     */
    sendNoteDelete(noteId: number): void {
        this.sendMessage({
            type: 'note-delete',
            payload: { noteId },
            timestamp: Date.now()
        });
    }

    /**
     * Bağlantıyı kapat
     */
    disconnect(): void {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.signalingSocket) {
            this.signalingSocket.close();
            this.signalingSocket = null;
        }

        console.log('[P2P] Disconnected');
    }

    /**
     * Bağlantı durumunu al
     */
    getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
        if (!this.peerConnection) return 'disconnected';

        switch (this.peerConnection.connectionState) {
            case 'connected':
                return 'connected';
            case 'connecting':
            case 'new':
                return 'connecting';
            default:
                return 'disconnected';
        }
    }

    /**
     * QR kod için bağlantı bilgisi oluştur
     */
    getConnectionInfo(): { peerId: string; signalingUrl: string } {
        return {
            peerId: this.localPeerId,
            signalingUrl: '' // Will be set when signaling server is configured
        };
    }
}

// Singleton instance
export const p2pSync = new P2PSyncService();

export default P2PSyncService;
