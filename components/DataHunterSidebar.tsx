import React, { useState, useEffect, useMemo } from 'react';
import { extractAllData, CategoryizedData, ExtractedData, CustomPattern } from '../utils/dataExtractor';
import { extractDataWithAI } from '../utils/aiDataExtractor';
import { exportToExcel } from '../utils/exportData';
import { downloadVCard } from '../utils/contactExport';
import { openExternalUrl } from '../utils/openExternal';
import { Settings } from '../types';

interface DataHunterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    noteContent: string;
    noteTitle: string;
    customPatterns: CustomPattern[];
    onOpenPatternManager?: () => void;
    settings: Settings;
}

const DataHunterSidebar: React.FC<DataHunterSidebarProps> = ({
    isOpen,
    onClose,
    noteContent,
    noteTitle,
    customPatterns,
    onOpenPatternManager,
    settings
}) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['phones', 'ibans', 'emails', 'dates']));

    // AI Scan State
    const [aiData, setAiData] = useState<CategoryizedData | null>(null);
    const [isAiScanning, setIsAiScanning] = useState(false);

    // Reset AI data when note content changes drastically? 
    // Usually better to keep it until user re-scans or content changes.
    // For now, let's reset if note changes to avoid stale data.
    useEffect(() => {
        setAiData(null);
    }, [noteContent]);

    // Regex Extraction (Default)
    const regexData = useMemo(() => {
        if (!noteContent) return null;
        return extractAllData(noteContent, customPatterns);
    }, [noteContent, customPatterns]);

    // Determine which data to show
    const finalData = aiData || regexData;

    const handleAiScan = async () => {
        if (!noteContent.trim()) return;
        setIsAiScanning(true);
        try {
            const data = await extractDataWithAI(noteContent, settings);
            setAiData(data);
            // Auto expand robust categories
            setExpandedCategories(new Set(['phones', 'addresses', 'emails', 'dates', 'prices', 'tckn']));
        } catch (error) {
            console.error('AI Scan failed:', error);
            alert('Akıllı tarama başarısız oldu. API anahtarınızı kontrol edin.');
        } finally {
            setIsAiScanning(false);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleCall = (phone: string) => {
        const cleanPhone = phone.replace(/\s/g, '');
        window.location.href = `tel:${cleanPhone}`;
    };

    const handleEmail = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    const handleAddToCalendar = (dateStr: string, context: string = '') => {
        // Convert DD.MM.YYYY to YYYYMMDD (Google Calendar format)
        const parts = dateStr.split(/[.\/-]/);
        if (parts.length === 3) {
            const [day, month, year] = parts;
            // Google Calendar needs YYYYMMDD format (no dashes/slashes)
            const isoDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;

            // Clean context for event title (remove ellipses)
            const cleanContext = context.replace(/^\.{3}|\.{3}$/g, '').trim();
            const eventTitle = cleanContext || noteTitle;

            // Build detailed event description
            const eventDetails = `📅 Tarih: ${dateStr}\n📄 Not: ${noteTitle}\n\n${context}`;

            // Build calendar URL
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${isoDate}/${isoDate}&details=${encodeURIComponent(eventDetails)}`;

            // Use openExternalUrl for proper Electron support
            openExternalUrl(calendarUrl);
        }
    };

    const handleOpenURL = (url: string) => {
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }
        // Use openExternalUrl for proper Electron support
        openExternalUrl(fullUrl);
    };

    const handleOpenMap = (address: string) => {
        const encoded = encodeURIComponent(address);
        // Use openExternalUrl for proper Electron support
        openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    };

    const handleAddContact = (phone?: string, email?: string) => {
        downloadVCard({
            name: phone || email || 'Kişi',
            phone: phone,
            email: email,
            note: `${noteTitle} notundan eklendi`
        });
    };

    const categories = [
        { key: 'phones', label: 'Telefonlar', icon: '📞', data: finalData?.phones || [], color: 'text-green-500' },
        { key: 'ibans', label: 'IBAN\'lar', icon: '💳', data: finalData?.ibans || [], color: 'text-blue-500' },
        { key: 'emails', label: 'E-postalar', icon: '📧', data: finalData?.emails || [], color: 'text-purple-500' },
        { key: 'dates', label: 'Tarihler', icon: '📅', data: finalData?.dates || [], color: 'text-orange-500' },
        { key: 'urls', label: 'Web Siteleri', icon: '🌐', data: finalData?.urls || [], color: 'text-cyan-500' },
        { key: 'addresses', label: 'Adresler', icon: '📍', data: finalData?.addresses || [], color: 'text-rose-500' },
        { key: 'plates', label: 'Plakalar', icon: '🚗', data: finalData?.plates || [], color: 'text-gray-500' },
        { key: 'tckn', label: 'TC Kimlik No', icon: '🆔', data: finalData?.tckn || [], color: 'text-red-500' },
        { key: 'prices', label: 'Tutarlar', icon: '💰', data: finalData?.prices || [], color: 'text-yellow-500' },
        { key: 'custom', label: 'Özel Veriler', icon: '🎯', data: finalData?.custom || [], color: 'text-indigo-500' },
    ];

    const totalItems = categories.reduce((sum, cat) => sum + cat.data.length, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-30 flex flex-col">
            {/* Header */}
            <div className="flex flex-col border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h2 className="text-lg font-bold text-text-primary">Veri Avcısı</h2>
                    </div>
                    <div className="flex items-center gap-1">
                        {onOpenPatternManager && (
                            <button
                                onClick={onOpenPatternManager}
                                className="p-1 hover:bg-border rounded transition-colors"
                                title="Özel Desen Ayarları"
                            >
                                <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-border rounded transition-colors"
                            title="Kapat"
                        >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* AI Toggle / Action Area */}
                <div className="px-4 pb-4">
                    <button
                        onClick={handleAiScan}
                        disabled={isAiScanning}
                        className={`w-full py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all ${aiData
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-primary text-primary-text hover:bg-primary-hover shadow-sm'
                            } ${isAiScanning ? 'opacity-75 cursor-wait' : ''}`}
                    >
                        {isAiScanning ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analiz Ediliyor...
                            </>
                        ) : aiData ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Akıllı Tarama Aktif
                                <span className="ml-1 text-xs opacity-70 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setAiData(null); }}>(Sıfırla)</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Akıllı Tarama (AI) Başlat
                            </>
                        )}
                    </button>

                    {/* Model Info Highlight */}
                    <div className="mt-3 bg-background-secondary rounded-lg p-2 border border-border/50">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-text-secondary">Seçili Model:</span>
                            <span className="font-semibold text-primary capitalize">{settings.apiProvider}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${aiData ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-xs font-medium text-text-primary truncate" title={settings.model}>
                                {settings.model}
                            </span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1.5 pt-1.5 border-t border-border/50 leading-tight">
                            💡 Ayarlardan {settings.apiProvider === 'gemini' ? 'GPT-4 veya Claude 3' : 'diğer modelleri'} de seçebilirsiniz.
                        </p>
                    </div>

                    {aiData && (
                        <p className="text-[10px] text-center text-purple-600 mt-2 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {settings.apiProvider.toUpperCase()} ile analiz edildi
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 py-3 bg-primary/5 border-b border-border">
                <p className="text-sm text-text-secondary">
                    <strong className="text-primary">{totalItems}</strong> veri bulundu
                    {aiData ? ' (AI)' : ' (Regex)'}
                </p>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {totalItems === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <svg className="w-16 h-16 text-text-secondary/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm text-text-secondary">Bu notta veri bulunamadı</p>
                        <p className="text-xs text-text-secondary mt-2">Telefon, IBAN, e-posta, tarih gibi veriler otomatik olarak algılanır</p>
                    </div>
                ) : (
                    categories.map(category => {
                        if (category.data.length === 0) return null;
                        const isExpanded = expandedCategories.has(category.key);

                        return (
                            <div key={category.key} className="border border-border rounded-lg overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category.key)}
                                    className="w-full px-4 py-3 bg-background-secondary hover:bg-border flex items-center justify-between transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{category.icon}</span>
                                        <span className="font-semibold text-sm text-text-primary">{category.label}</span>
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                            {category.data.length}
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Category Items */}
                                {isExpanded && (
                                    <div className="divide-y divide-border">
                                        {category.data.map((item: ExtractedData, idx: number) => (
                                            <div key={idx} className="p-3 bg-background hover:bg-background-secondary/50 transition-colors">
                                                {/* Value */}
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <code className={`text-sm font-mono font-semibold ${category.color} break-all`}>
                                                        {item.value}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(item.value)}
                                                        className="p-1 hover:bg-border rounded flex-shrink-0"
                                                        title="Kopyala"
                                                    >
                                                        <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Context */}
                                                <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                                                    {item.context}
                                                </p>

                                                {/* Quick Actions */}
                                                <div className="flex flex-wrap gap-2">
                                                    {category.key === 'phones' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleCall(item.value)}
                                                                className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                                                            >
                                                                Ara
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddContact(item.value, undefined)}
                                                                className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                                                            >
                                                                Kişi Ekle
                                                            </button>
                                                        </>
                                                    )}
                                                    {category.key === 'emails' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEmail(item.value)}
                                                                className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded hover:bg-purple-500/20 transition-colors"
                                                            >
                                                                E-posta Gönder
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddContact(undefined, item.value)}
                                                                className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                                                            >
                                                                Kişi Ekle
                                                            </button>
                                                        </>
                                                    )}
                                                    {category.key === 'dates' && (
                                                        <button
                                                            onClick={() => handleAddToCalendar(item.value, item.context)}
                                                            className="text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded hover:bg-orange-500/20 transition-colors"
                                                        >
                                                            Takvime Ekle
                                                        </button>
                                                    )}
                                                    {category.key === 'urls' && (
                                                        <button
                                                            onClick={() => handleOpenURL(item.value)}
                                                            className="text-xs bg-cyan-500/10 text-cyan-600 px-2 py-1 rounded hover:bg-cyan-500/20 transition-colors"
                                                        >
                                                            Siteyi Aç
                                                        </button>
                                                    )}
                                                    {category.key === 'addresses' && (
                                                        <button
                                                            onClick={() => handleOpenMap(item.value)}
                                                            className="text-xs bg-rose-500/10 text-rose-600 px-2 py-1 rounded hover:bg-rose-500/20 transition-colors"
                                                        >
                                                            Haritada Göster
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer - Export Button */}
            {totalItems > 0 && (
                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => {
                            if (finalData) {
                                exportToExcel(finalData, noteTitle);
                            }
                        }}
                        className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel İndir
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataHunterSidebar;
