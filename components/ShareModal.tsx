import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';
import { WhatsAppIcon, TelegramIcon, MailIcon, CopyIcon, DownloadIcon } from './icons/Icons';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string; // Selection content
    fullContent: string; // Full note content
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

type ExportFormat = 'txt' | 'html' | 'json' | 'pdf';

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, content, fullContent, addNotification }) => {
    const { t } = useTranslations();
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('txt');
    // Default to selection if available, otherwise full note
    const [shareScope, setShareScope] = useState<'full' | 'selection'>(content ? 'selection' : 'full');

    const activeContent = shareScope === 'full' ? fullContent : content;

    // Simple robust text extraction
    const getPlainText = (html: string) => {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.innerHTML = html.replace(/<br>/g, '\n').replace(/<\/p>/g, '\n\n');
        return temp.innerText.trim();
    };

    const plainText = getPlainText(activeContent);
    const shareText = shareScope === 'full' && title ? `${title}\n\n${plainText}` : plainText;

    const encodedText = encodeURIComponent(shareText);
    const encodedTitle = encodeURIComponent(title || 'Neural Pad');

    const handleSocialShare = (platform: 'whatsapp' | 'telegram' | 'email') => {
        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodedText}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?text=${encodedText}`;
                break;
            case 'email':
                url = `mailto:?subject=${encodedTitle}&body=${encodedText.slice(0, 500)}...`; // Truncate for mailto limits
                break;
        }
        window.open(url, '_blank');
        onClose();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            addNotification(t('notifications.copiedToClipboard') || 'Panoya kopyalandı', 'success');
            onClose();
        } catch {
            addNotification('Kopyalama başarısız', 'error');
        }
    };

    const handleDownload = () => {
        const safeTitle = (title || 'note').replace(/[^a-z0-9-_]+/gi, '_');
        let blob: Blob;
        let filename: string = `${safeTitle}.${selectedFormat}`;

        if (selectedFormat === 'pdf') {
            // Basic print fallback for PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${title}</title></head><body><h1>${title}</h1>${activeContent}</body></html>`);
                printWindow.document.close();
                printWindow.print();
            }
            onClose();
            return;
        }

        switch (selectedFormat) {
            case 'html':
                blob = new Blob([activeContent], { type: 'text/html' });
                break;
            case 'json':
                blob = new Blob([JSON.stringify({ title, content: activeContent }, null, 2)], { type: 'application/json' });
                break;
            case 'txt':
            default:
                blob = new Blob([plainText], { type: 'text/plain' });
                break;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addNotification(t('notifications.downloadSuccess') || 'İndirildi', 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notu Paylaş">
            <div className="p-1 space-y-6">

                {/* 1. Scope Selection (Modern Segmented Control) */}
                {content && (
                    <div className="flex bg-background p-1 rounded-xl border border-border/60 relative">
                        <button
                            onClick={() => setShareScope('selection')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 z-10 ${shareScope === 'selection'
                                ? 'bg-primary text-primary-text shadow-md transform scale-[1.02]'
                                : 'text-text-secondary hover:bg-background-secondary'
                                }`}
                        >
                            <span className="text-lg">✨</span> Seçili Alan
                        </button>
                        <button
                            onClick={() => setShareScope('full')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 z-10 ${shareScope === 'full'
                                ? 'bg-primary text-primary-text shadow-md transform scale-[1.02]'
                                : 'text-text-secondary hover:bg-background-secondary'
                                }`}
                        >
                            <span className="text-lg">📄</span> Tüm Not
                        </button>
                    </div>
                )}

                {/* 2. Primary Actions (Social Grid) */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-text-secondary tracking-wider ml-1 opacity-70">
                        METİN OLARAK PAYLAŞ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleSocialShare('whatsapp')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all hover:scale-[1.02] gap-2 group">
                            <WhatsAppIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-sm">WhatsApp</span>
                        </button>
                        <button onClick={() => handleSocialShare('telegram')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 border border-[#0088cc]/20 transition-all hover:scale-[1.02] gap-2 group">
                            <TelegramIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-sm">Telegram</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleCopy} className="flex items-center justify-center gap-3 p-3 rounded-xl bg-background-secondary hover:bg-border border border-border text-text-primary transition-all font-medium">
                            <CopyIcon className="w-5 h-5 text-gray-500" />
                            Kopyala
                        </button>
                        <button onClick={() => handleSocialShare('email')} className="flex items-center justify-center gap-3 p-3 rounded-xl bg-background-secondary hover:bg-border border border-border text-text-primary transition-all font-medium">
                            <MailIcon className="w-5 h-5 text-gray-500" />
                            E-posta
                        </button>
                    </div>
                </div>

                <div className="h-px bg-border/50 my-2" />

                {/* 3. Download Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-text-secondary tracking-wider ml-1 opacity-70">
                            İNDİR
                        </label>
                    </div>

                    <div className="flex bg-background-secondary rounded-xl p-1.5 border border-border/50">
                        {(['txt', 'html', 'json', 'pdf'] as ExportFormat[]).map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => setSelectedFormat(fmt)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${selectedFormat === fmt
                                    ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {fmt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold transition-colors border border-primary/20"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        İndir .{selectedFormat.toUpperCase()}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
