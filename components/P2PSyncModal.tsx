import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';
import { p2pSync } from '../services/p2pSyncService';

interface P2PSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const P2PSyncModal: React.FC<P2PSyncModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslations();
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'initializing' | 'ready' | 'connecting' | 'connected' | 'error'>('initializing');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [connectionInfo, setConnectionInfo] = useState<{ ip: string; port: number } | null>(null);

    // Electron API type definition
    const electron = (window as any).electron;

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (isOpen && electron?.p2p) {
            initializeSync();
        } else {
            // Reset state on close
            setQrCodeUrl(null);
            setStatus('initializing');
            setErrorMsg(null);

            // Stop signaling when closed (optional, keeps server running usually better)
            // if (electron?.p2p) electron.p2p.stopSignaling();
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isOpen]);

    const initializeSync = async () => {
        try {
            setStatus('initializing');

            // 1. Start Signaling Server (Electron Main Process)
            const result = await electron.p2p.startSignaling();
            if (!result.success) {
                throw new Error(result.error || 'Failed to start signaling server');
            }

            setConnectionInfo({ ip: result.ip, port: result.port });

            // 2. Generate Peer ID for this desktop client
            const peerId = p2pSync.generatePeerId();

            // 3. Generate QR Code containing connection info
            const qrResult = await electron.p2p.generateQR(peerId);
            if (!qrResult.success) {
                throw new Error(qrResult.error || 'Failed to generate QR code');
            }
            setQrCodeUrl(qrResult.qrDataUrl);

            // 4. Initialize P2P Service (Renderer Process)
            // Connect to local signaling server
            const signalingUrl = `ws://localhost:${result.port}`; // Connect locally
            await p2pSync.connectToSignaling(signalingUrl);

            // Initialize WebRTC
            await p2pSync.initializeConnection({
                peerId: peerId,
                onDataReceived: handleDataReceived,
                onConnectionStateChange: (state) => {
                    console.log('[P2P UI] Connection state:', state);
                    if (state === 'connected') setStatus('connected');
                    else if (state === 'connecting') setStatus('connecting');
                    else if (state === 'disconnected') setStatus('ready'); // Back to ready/waiting
                },
                onError: (err) => {
                    console.error('[P2P UI] Error:', err);
                    setErrorMsg(err.message);
                    setStatus('error');
                }
            });

            setStatus('ready');

        } catch (err) {
            console.error('[P2P UI] Initialization error:', err);
            setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
            setStatus('error');
        }
    };

    const handleDataReceived = (message: any) => {
        console.log('[P2P UI] Data message:', message);
        // Handle sync messages here (in future steps)
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="📱 Mobil Senkronizasyon (P2P)">
            <div className="p-6 flex flex-col items-center justify-center space-y-6 text-center">

                {status === 'initializing' && (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
                        <p className="text-text-secondary">P2P Sunucusu başlatılıyor...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                        <p className="font-bold mb-1">Hata Oluştu</p>
                        <p className="text-sm">{errorMsg}</p>
                        <button
                            onClick={initializeSync}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}

                {(status === 'ready' || status === 'connecting') && qrCodeUrl && (
                    <>
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <img src={qrCodeUrl} alt="P2P QR Code" className="w-56 h-56" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-text-primary">Mobil Uygulama ile Eşleştir</h3>
                            <p className="text-sm text-text-secondary max-w-xs mx-auto">
                                Neural Pad mobil uygulamasını açın ve bu QR kodu tarayarak cihazları eşleştirin.
                            </p>
                            <p className="text-xs text-amber-500 font-medium">
                                ⚠️ Cihazlar internete bağlı olmalıdır (WebRTC handshake için)
                            </p>
                        </div>

                        {connectionInfo && (
                            <div className="text-xs text-text-secondary font-mono bg-background-secondary p-2 rounded">
                                Signaling: {connectionInfo.ip}:{connectionInfo.port}
                            </div>
                        )}
                    </>
                )}

                {status === 'connected' && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-500">Bağlantı Kuruldu!</h3>
                            <p className="text-text-secondary">Cihazlarınız artık senkronize.</p>
                        </div>
                        <button
                            onClick={() => {
                                p2pSync.requestSync();
                            }}
                            className="px-6 py-2 bg-primary text-primary-text rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                        >
                            Senkronizasyonu Başlat
                        </button>
                    </div>
                )}

            </div>
        </Modal>
    );
};

export default P2PSyncModal;
