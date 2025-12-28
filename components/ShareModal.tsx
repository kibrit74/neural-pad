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
    const [isExporting, setIsExporting] = useState(false);
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

    // Convert images in HTML to base64 data URLs
    const embedImagesInHtml = async (html: string): Promise<string> => {
        if (!html) return '';

        const container = document.createElement('div');
        container.innerHTML = html;

        const images = container.querySelectorAll('img');

        for (const img of Array.from(images)) {
            const src = img.getAttribute('src') || '';

            // Skip if already a data URL
            if (src.startsWith('data:')) continue;

            try {
                // Handle file:// URLs or blob: URLs
                if (src.startsWith('file://') || src.startsWith('blob:')) {
                    const response = await fetch(src);
                    const blob = await response.blob();
                    const dataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                    img.setAttribute('src', dataUrl);
                } else if (src.startsWith('http://') || src.startsWith('https://')) {
                    // For external URLs, try to fetch and embed
                    try {
                        const response = await fetch(src);
                        const blob = await response.blob();
                        const dataUrl = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                        img.setAttribute('src', dataUrl);
                    } catch {
                        // If can't fetch, keep original URL
                        console.warn('Could not embed external image:', src);
                    }
                }
            } catch (error) {
                console.error('Error embedding image:', error);
            }
        }

        return container.innerHTML;
    };

    // Create complete HTML document
    const createHtmlDocument = (content: string, docTitle: string): string => {
        return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docTitle || 'Neural Pad Note'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #1a1a1a;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: #111;
        }
        h1 { font-size: 2em; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.3em; }
        p { margin: 1em 0; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
        code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Consolas', 'Monaco', monospace; }
        pre { background: #1a1a1a; color: #e5e5e5; padding: 1em; border-radius: 8px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #e5e5e5; margin: 1em 0; padding-left: 1em; color: #555; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e5e5e5; padding: 8px 12px; text-align: left; }
        th { background: #f9f9f9; }
        ul, ol { padding-left: 2em; }
        li { margin: 0.5em 0; }
        a { color: #0066cc; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 2em; }
    </style>
</head>
<body>
    ${docTitle ? `<h1>${docTitle}</h1>` : ''}
    <div class="meta">
        <p>Exported from Neural Pad on ${new Date().toLocaleString('tr-TR')}</p>
    </div>
    <div class="content">
        ${content}
    </div>
</body>
</html>`;
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

    const handleDownload = async () => {
        setIsExporting(true);

        try {
            const safeTitle = (title || 'note').replace(/[^a-z0-9-_]+/gi, '_');
            let blob: Blob;
            let filename: string = `${safeTitle}.${selectedFormat}`;

            if (selectedFormat === 'pdf') {
                // Basic print fallback for PDF
                const embeddedContent = await embedImagesInHtml(activeContent);
                const htmlDoc = createHtmlDocument(embeddedContent, title);
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlDoc);
                    printWindow.document.close();
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                }
                setIsExporting(false);
                onClose();
                return;
            }

            switch (selectedFormat) {
                case 'html': {
                    // Embed images as base64
                    const embeddedContent = await embedImagesInHtml(activeContent);
                    const htmlDoc = createHtmlDocument(embeddedContent, title);
                    blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
                    break;
                }
                case 'json': {
                    // Create a clean, readable JSON structure
                    const jsonData = {
                        metadata: {
                            application: 'Neural Pad',
                            version: '1.0',
                            exportedAt: new Date().toISOString(),
                            exportedAtLocal: new Date().toLocaleString('tr-TR'),
                        },
                        note: {
                            title: title || 'Untitled',
                            plainText: plainText,
                            htmlContent: activeContent,
                            wordCount: plainText.split(/\s+/).filter(w => w.length > 0).length,
                            characterCount: plainText.length,
                        }
                    };
                    blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8' });
                    break;
                }
                case 'txt':
                default:
                    blob = new Blob([shareText], { type: 'text/plain;charset=utf-8' });
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
        } catch (error) {
            console.error('Download error:', error);
            addNotification('İndirme başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'), 'error');
        } finally {
            setIsExporting(false);
        }
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
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold transition-colors border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Hazırlanıyor...
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-5 h-5" />
                                İndir .{selectedFormat.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
