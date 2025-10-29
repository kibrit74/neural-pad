
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { ChatIcon, SettingsIcon, NotesIcon, SaveIcon, SearchIcon, HelpCircleIcon, LockIcon, UnlockIcon, HistoryIcon } from './icons/Icons';
import type { Note } from '../types';

interface HeaderProps {
    onToggleNotesSidebar: () => void;
    onToggleChatSidebar: () => void;
    isChatOpen: boolean;
    onSave: () => void;
    onSettings: () => void;
    onHelp: () => void;
    onToggleLock: () => void;
    onOpenHistory?: () => void;
    isLocked: boolean;
    activeNote: Note | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onToggleNotesSidebar, onToggleChatSidebar, isChatOpen, onSave, onSettings, onHelp, onToggleLock, onOpenHistory, isLocked, activeNote, searchQuery, onSearchChange 
}) => {
    const { t } = useTranslations();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(date));
    };

    const IconButton: React.FC<{ onClick: () => void; title: string; isActive?: boolean; children: React.ReactNode, className?: string }> = 
    ({ onClick, title, isActive = false, children, className = '' }) => (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded-full transition-colors ${
                isActive ? 'bg-primary text-primary-text' : 'hover:bg-border'
            } ${className}`}
        >
            {children}
        </button>
    );

    return (
        <header className="relative z-50 flex items-center justify-between p-2 border-b border-border-strong bg-background-secondary text-text-primary flex-shrink-0 gap-4">
            {/* Left section */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <IconButton onClick={onToggleNotesSidebar} title={t('header.toggleNotes')}>
                    <NotesIcon />
                </IconButton>
                <div className="flex-col items-start hidden sm:flex">
                    <h1 className="text-lg font-bold leading-tight">{t('header.title')}</h1>
                    {activeNote?.updatedAt && (
                        <span className="text-xs text-text-secondary leading-tight">
                            {t('header.lastSaved')} {formatDate(activeNote.updatedAt)}
                        </span>
                    )}
                </div>
            </div>
            
            {/* Center section - Search */}
            <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-md relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-text-secondary" />
                    </div>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t('notesSidebar.searchPlaceholder')}
                        className="w-full bg-background border border-border rounded-full py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <IconButton onClick={onSave} title={t('header.save')}>
                    <SaveIcon />
                </IconButton>
                <IconButton onClick={onToggleLock} title={isLocked ? t('header.unlock') : t('header.lock')}>
                    {isLocked ? <UnlockIcon /> : <LockIcon />}
                </IconButton>
                <IconButton onClick={onHelp} title={t('header.help')}>
                    <HelpCircleIcon />
                </IconButton>
                {onOpenHistory && (
                    <IconButton onClick={onOpenHistory} title="History">
                        <HistoryIcon />
                    </IconButton>
                )}
                 <IconButton onClick={onSettings} title={t('header.settings')}>
                    <SettingsIcon />
                </IconButton>
                <IconButton onClick={onToggleChatSidebar} title={isChatOpen ? t('chat.close') : t('chat.open')} isActive={isChatOpen}>
                    <ChatIcon />
                </IconButton>
            </div>
        </header>
    );
};

export default Header;
