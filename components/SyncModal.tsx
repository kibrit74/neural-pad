import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';

interface SyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, addNotification }) => {
    const { t } = useTranslations();
    const [isServerRunning, setIsServerRunning] = useState(false);
    const [serverInfo, setServerInfo] = useState<{ ip: string; port: number; url: string } | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check server status on mount
    useEffect(() => {
        if (isOpen) {
            checkServerStatus();
        }
    }, [isOpen]);

    const checkServerStatus = async () => {
        try {
            const status = await (window as any).electron.sync.status();
            setIsServerRunning(status.running);
            if (status.running) {
                setServerInfo({ ip: status.ip, port: status.port, url: status.url });
                const qr = await (window as any).electron.sync.qr();
                if (qr.success) {
                    setQrCode(qr.qrDataUrl);
                }
            }
        } catch (error) {
            console.error('Failed to check sync status:', error);
        }
    };

    const handleStartServer = async () => {
        setIsLoading(true);
        try {
            const result = await (window as any).electron.sync.start();
            if (result.success) {
                setIsServerRunning(true);
                setServerInfo({ ip: result.ip, port: result.port, url: `http://${result.ip}:${result.port}` });

                // Generate QR code
                const qr = await (window as any).electron.sync.qr();
                if (qr.success) {
                    setQrCode(qr.qrDataUrl);
                }

                addNotification('Senkronizasyon sunucusu başlatıldı!', 'success');
            } else {
                addNotification('Sunucu başlatılamadı: ' + result.error, 'error');
            }
        } catch (error) {
            addNotification('Sunucu başlatılamadı', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopServer = async () => {
        try {
            await (window as any).electron.sync.stop();
            setIsServerRunning(false);
            setServerInfo(null);
            setQrCode(null);
            addNotification('Sunucu durduruldu', 'success');
        } catch (error) {
            addNotification('Sunucu durdurulamadı', 'error');
        }
    };

    const copyUrl = async () => {
        if (serverInfo?.url) {
            await navigator.clipboard.writeText(serverInfo.url);
            addNotification('URL kopyalandı!', 'success');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="📱 Mobil Senkronizasyon">
            <div className="p-4 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isServerRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="font-medium">
                            {isServerRunning ? 'Sunucu Çalışıyor' : 'Sunucu Kapalı'}
                        </span>
                    </div>
                    <button
                        onClick={isServerRunning ? handleStopServer : handleStartServer}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isServerRunning
                                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                : 'bg-primary text-primary-text hover:bg-primary-hover'
                            } disabled:opacity-50`}
                    >
                        {isLoading ? 'Yükleniyor...' : isServerRunning ? 'Durdur' : 'Başlat'}
                    </button>
                </div>

                {/* QR Code */}
                {isServerRunning && qrCode && (
                    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                        <p className="text-gray-600 text-sm text-center">
                            Mobil uygulamada bu QR kodu tarayın
                        </p>
                    </div>
                )}

                {/* Connection Info */}
                {isServerRunning && serverInfo && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                            <span className="text-sm text-text-secondary">IP Adresi:</span>
                            <code className="font-mono text-sm">{serverInfo.ip}</code>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                            <span className="text-sm text-text-secondary">Port:</span>
                            <code className="font-mono text-sm">{serverInfo.port}</code>
                        </div>
                        <button
                            onClick={copyUrl}
                            className="w-full p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                        >
                            🔗 URL'yi Kopyala
                        </button>
                    </div>
                )}

                {/* Instructions */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="font-semibold text-blue-600 mb-2">📋 Nasıl Bağlanılır?</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>"Başlat" butonuna tıklayın</li>
                        <li>Mobil cihazınızda Neural Pad'i açın</li>
                        <li>QR kodu tarayın veya URL'yi girin</li>
                        <li>Aynı WiFi ağında olduğunuzdan emin olun</li>
                    </ol>
                </div>

                {/* Note */}
                <p className="text-xs text-text-secondary text-center">
                    💡 Verileriniz yalnızca yerel ağınızda paylaşılır, buluta gönderilmez.
                </p>
            </div>
        </Modal>
    );
};

export default SyncModal;
