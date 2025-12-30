
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { ChatIcon, SettingsIcon, NotesIcon, SaveIcon, SaveAsIcon, HelpCircleIcon, LockIcon, UnlockIcon, HistoryIcon, DownloadIcon, HomeIcon, ShareIcon, BellIcon, BellOffIcon, SyncIcon } from './icons/Icons';
import type { Note } from '../types';

interface HeaderProps {
    onToggleNotesSidebar: () => void;
    onToggleChatSidebar: () => void;
    isChatOpen: boolean;
    onSave: () => void;
    onSaveAs?: () => void;
    onSettings: () => void;
    onHelp: () => void;
    onToggleLock: () => void;
    onOpenHistory?: () => void;
    onDownload?: () => void;
    onOpenLandingPage?: () => void;
    onShare?: () => void;
    onSync?: () => void;
    onReminder?: () => void;
    onToggleDataHunter?: () => void;
    isDataHunterOpen?: boolean;
    isLocked: boolean;
    activeNote: Note | null;
    onProfile?: () => void; // Profile dashboard
    currentUser?: any; // Current authenticated user
    // These props are deprecated but kept for compatibility with App.tsx
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
    onToggleNotesSidebar, onToggleChatSidebar, isChatOpen, onSave, onSaveAs, onSettings, onHelp, onToggleLock, onOpenHistory, onDownload, onOpenLandingPage, onShare, onSync, onReminder, onToggleDataHunter, isDataHunterOpen, isLocked, activeNote, onProfile, currentUser
}) => {
    const { t } = useTranslations();

    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && (window as any).electron;

    const IconButton: React.FC<{ onClick: () => void; title: string; isActive?: boolean; children: React.ReactNode, className?: string }> =
        ({ onClick, title, isActive = false, children, className = '' }) => (
            <button
                onClick={onClick}
                title={title}
                aria-label={title}
                className={`
                    w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200
                    border border-transparent
                    ${isActive
                        ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/10 hover:border-white/10'
                    } ${className}
                `}
            >
                {children}
            </button>
        );

    return (
        <header className="relative z-40 flex items-center justify-between px-6 py-3 border-b border-border/10 bg-gradient-to-r from-background/90 to-background/60 backdrop-blur-md flex-shrink-0 transition-all duration-300">
            {/* Left section: Sidebar Toggle & Breadcrumb */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <IconButton onClick={onToggleNotesSidebar} title={t('header.toggleNotes')}>
                    <NotesIcon />
                </IconButton>

                <div className="flex items-center gap-2 text-sm font-medium animate-fade-in">
                    <span className="text-text-secondary/60">📁 {t('notesSidebar.allNotes') || 'Notlarım'}</span>
                    <span className="text-text-secondary/40 text-xs">/</span>
                    <span className="text-primary truncate max-w-[200px] md:max-w-[400px]">
                        {activeNote?.title || t('defaultNoteTitle') || 'Yeni Not'}
                    </span>
                    {activeNote?.updatedAt && (
                        <span className="hidden lg:inline-block ml-3 text-[10px] text-text-secondary/30 bg-white/5 px-2 py-0.5 rounded-full">
                            {t('header.lastSaved')} {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Right section: Toolbar Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isElectron && onOpenLandingPage && (
                    <IconButton onClick={onOpenLandingPage} title={t('header.backToLanding')}>
                        <HomeIcon />
                    </IconButton>
                )}

                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                {onReminder && (
                    <IconButton onClick={onReminder} title={t('reminder.title')} className={activeNote?.reminder ? 'text-amber-500 hover:text-amber-400' : ''}>
                        {activeNote?.reminder ? <BellIcon className="text-amber-500" /> : <BellOffIcon />}
                    </IconButton>
                )}

                {onShare && (
                    <IconButton onClick={onShare} title={t('share.title')}>
                        <ShareIcon />
                    </IconButton>
                )}

                {onSync && (
                    <IconButton onClick={onSync} title="Mobil ile Eşle">
                        <SyncIcon />
                    </IconButton>
                )}

                {onDownload && (
                    <IconButton onClick={onDownload} title={t('header.download')}>
                        <DownloadIcon />
                    </IconButton>
                )}

                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                {onToggleDataHunter && (
                    <IconButton onClick={onToggleDataHunter} title="Veri Avcısı" isActive={isDataHunterOpen}>
                        {/* Crosshair/Target icon - represents data hunting */}
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                            <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
                            <circle cx="12" cy="12" r="2" strokeWidth={2} fill="currentColor" />
                            <path strokeLinecap="round" strokeWidth={2} d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                        </svg>
                    </IconButton>
                )}

                <IconButton onClick={onToggleLock} title={isLocked ? t('header.unlock') : t('header.lock')} isActive={isLocked}>
                    {isLocked ? <UnlockIcon /> : <LockIcon />}
                </IconButton>

                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                {/* Profile Button (Web only) */}
                {!isElectron && onProfile && currentUser && (
                    <IconButton onClick={onProfile} title="Profil">
                        <svg className="w-5 h-5 text-coral-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </IconButton>
                )}

                {/* Save buttons for Web */}
                {!isElectron && (
                    <>
                        <IconButton onClick={onSave} title={t('header.save') || 'Kaydet'}>
                            <SaveIcon />
                        </IconButton>
                        {onSaveAs && (
                            <IconButton onClick={onSaveAs} title={t('header.saveAs') || 'Farklı Kaydet'}>
                                <SaveAsIcon />
                            </IconButton>
                        )}
                    </>
                )}

                {/* Save buttons and Settings for Electron */}
                {isElectron && (
                    <>
                        <IconButton onClick={onSave} title={t('header.save') || 'Kaydet'}>
                            <SaveIcon />
                        </IconButton>
                        {onSaveAs && (
                            <IconButton onClick={onSaveAs} title={t('header.saveAs') || 'Farklı Kaydet'}>
                                <SaveAsIcon />
                            </IconButton>
                        )}
                        <IconButton onClick={onSettings} title={t('header.settings')}>
                            <SettingsIcon />
                        </IconButton>
                    </>
                )}

                <IconButton onClick={onToggleChatSidebar} title={isChatOpen ? t('chat.close') : t('chat.open')} isActive={isChatOpen}>
                    <ChatIcon />
                </IconButton>
            </div>
        </header>
    );
};

export default Header;
