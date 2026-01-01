import React, { useState } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { isNative } from '../utils/platform';
import { p2pSync } from '../services/p2pSyncService';
import { useTranslations } from '../hooks/useTranslations';

const MobileSyncButton: React.FC = () => {
    const { t } = useTranslations();
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'connecting' | 'connected' | 'error'>('idle');

    const startScan = async () => {
        if (!isNative) return;

        try {
            setStatus('scanning');
            setIsScanning(true);

            // Check permissions
            const status = await BarcodeScanner.checkPermission({ force: true });
            if (!status.granted) {
                alert('Kamera izni reddedildi');
                setStatus('idle');
                setIsScanning(false);
                return;
            }

            // Make background transparent
            document.body.classList.add('qr-scanner-active');
            await BarcodeScanner.hideBackground();

            const result = await BarcodeScanner.startScan();

            // Stop scanning
            document.body.classList.remove('qr-scanner-active');
            setIsScanning(false);

            if (result.hasContent) {
                handleQrContent(result.content);
            } else {
                setStatus('idle');
            }
        } catch (error) {
            console.error('Scan error:', error);
            document.body.classList.remove('qr-scanner-active');
            setIsScanning(false);
            setStatus('error');
            alert('Tarama hatası: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    const stopScan = () => {
        BarcodeScanner.stopScan();
        document.body.classList.remove('qr-scanner-active');
        setIsScanning(false);
        setStatus('idle');
    };

    const handleQrContent = async (content: string) => {
        try {
            setStatus('connecting');
            const data = JSON.parse(content);

            if (data.type !== 'neural-pad-p2p' || !data.signalingUrl || !data.peerId) {
                throw new Error('Geçersiz QR kod');
            }

            // Generate local peer ID
            const localPeerId = p2pSync.generatePeerId();

            // Connect to signaling server (ws)
            // Note: On Android local IP access requires cleartext traffic enabled in manifest
            await p2pSync.connectToSignaling(data.signalingUrl);

            // Initialize connection
            await p2pSync.initializeConnection({
                peerId: localPeerId,
                onDataReceived: (msg) => console.log('Data:', msg),
                onConnectionStateChange: (state) => {
                    if (state === 'connected') setStatus('connected');
                    else if (state === 'disconnected') setStatus('error');
                },
                onError: (err) => {
                    alert('Hata: ' + err.message);
                    setStatus('error');
                }
            });

            // Connect to desktop peer
            await p2pSync.connectToPeer(data.peerId);

        } catch (error) {
            alert('Bağlantı hatası: ' + (error instanceof Error ? error.message : String(error)));
            setStatus('error');
        }
    };

    if (!isNative) return null;

    if (isScanning) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col justify-end pb-10 items-center bg-transparent pointer-events-none">
                <div className="pointer-events-auto bg-black/50 p-4 rounded-xl backdrop-blur-md mb-8">
                    <p className="text-white text-center mb-4 font-bold text-lg">Masaüstü QR Kodunu Tarayın</p>
                    <button
                        onClick={stopScan}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-bold w-full"
                    >
                        İptal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={startScan}
            className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg font-semibold text-sm hover:bg-primary/30 transition-colors w-full justify-center"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Masaüstü ile Eşleş</span>
        </button>
    );
};

export default MobileSyncButton;
