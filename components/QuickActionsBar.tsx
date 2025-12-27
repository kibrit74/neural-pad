import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { ShareIcon, DownloadIcon, SettingsIcon } from './icons/Icons';

interface QuickActionsBarProps {
    onCopyAll: () => void;
    onExport: () => void;
    onShare: () => void;
    onSettings: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onCopyAll, onExport, onShare, onSettings }) => {
    const { t } = useTranslations();

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:scale-105 hover:bg-black/50">
                <button
                    onClick={onCopyAll}
                    className="group relative p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    aria-label="Kopyala"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Kopyala
                    </span>
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1"></div>

                <button
                    onClick={onExport}
                    className="group relative p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    aria-label="İndir"
                >
                    <DownloadIcon width="20" height="20" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        İndir (.txt)
                    </span>
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1"></div>

                <button
                    onClick={onShare}
                    className="group relative p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    aria-label="Paylaş"
                >
                    <ShareIcon width="20" height="20" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Paylaş
                    </span>
                </button>

                <div className="w-[1px] h-5 bg-white/10 mx-1"></div>

                <button
                    onClick={onSettings}
                    className="group relative p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    aria-label="Ayarlar"
                >
                    <SettingsIcon width="20" height="20" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Ayarlar
                    </span>
                </button>
            </div>
        </div>
    );
};

export default QuickActionsBar;
