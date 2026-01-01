import React, { useState, useMemo } from 'react';
import type { Note } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { TrashIcon, CloseIcon, EditIcon, PinIcon, ChevronDownIcon, LockIcon, BellIcon } from './icons/Icons';
import MobileSyncButton from './MobileSyncButton';
import { useTheme } from '../contexts/ThemeContext';
import { getLogoForTheme, defaultLogo } from '../utils/themeLogos';

interface NotesSidebarProps {
    notes: Note[];
    activeNoteId: number | null;
    onSelectNote: (id: number) => void;
    onNewNote: () => void;
    onDeleteNote: (id: number) => void;
    onTogglePin: (id: number) => void;
    onClose: () => void;
    allTags: string[];
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
    // New optional props for mockup compliance
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    // Template selector (Electron-only)
    onOpenTemplates?: () => void;
}

type SortOption = 'recent' | 'oldest' | 'alphabetical';
type DateFilter = 'all' | 'today' | 'week' | 'month';

const NotesSidebar: React.FC<NotesSidebarProps> = ({
    notes, activeNoteId, onSelectNote, onNewNote, onDeleteNote, onTogglePin, onClose,
    allTags, selectedTag, onSelectTag, searchQuery, onSearchChange, onOpenTemplates
}) => {
    const { t } = useTranslations();
    const { theme } = useTheme();
    const isElectron = typeof window !== 'undefined' && (window as any).electron;
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [isTagsExpanded, setIsTagsExpanded] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Get the logo for current theme
    const currentLogo = getLogoForTheme(theme);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(date));
    };

    // Group notes by date
    const getDateGroup = (date: Date): string => {
        const now = new Date();
        const noteDate = new Date(date);
        const diffTime = now.getTime() - noteDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('notesSidebar.today');
        if (diffDays === 1) return t('notesSidebar.yesterday');
        if (diffDays <= 7) return t('notesSidebar.thisWeek');
        if (diffDays <= 30) return t('notesSidebar.thisMonth');
        return t('notesSidebar.older');
    };

    // Sort and group notes
    const groupedNotes = useMemo(() => {
        let filteredNotes = [...notes];

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filteredNotes = filteredNotes.filter(note => {
                const noteDate = new Date(note.updatedAt);
                const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());
                const diffTime = today.getTime() - noteDateOnly.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                switch (dateFilter) {
                    case 'today':
                        return diffDays === 0;
                    case 'week':
                        return diffDays <= 7;
                    case 'month':
                        return diffDays <= 30;
                    default:
                        return true;
                }
            });
        }

        let sortedNotes = [...filteredNotes];

        // Sort by pin first
        sortedNotes.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

        // Then apply selected sorting
        const unpinnedNotes = sortedNotes.filter(n => !n.isPinned);
        const pinnedNotes = sortedNotes.filter(n => n.isPinned);

        switch (sortBy) {
            case 'oldest':
                unpinnedNotes.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
                break;
            case 'alphabetical':
                unpinnedNotes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'recent':
            default:
                unpinnedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }

        sortedNotes = [...pinnedNotes, ...unpinnedNotes];

        // Group by date
        const groups: { [key: string]: Note[] } = {};

        if (pinnedNotes.length > 0) {
            groups[t('notesSidebar.pinned')] = pinnedNotes;
        }

        unpinnedNotes.forEach(note => {
            const group = getDateGroup(note.updatedAt);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(note);
        });

        return groups;
    }, [notes, sortBy, dateFilter, t]);

    return (
        <aside className="w-full h-full flex flex-col bg-background/80 backdrop-blur-xl border-r border-border/40 transition-colors duration-300">
            {/* Sidebar Header: Logo & Search */}
            <div className="p-5 border-b border-border/20 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                            <img
                                src={currentLogo}
                                alt="Neural Pad"
                                className="w-10 h-10 object-contain transition-transform duration-300 hover:scale-110"
                                onError={(e) => { e.currentTarget.src = defaultLogo; }}
                            />
                        </div>
                        <span className="font-bold text-lg text-primary tracking-tight">Neural Pad</span>
                    </div>

                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary md:hidden">
                        <CloseIcon />
                    </button>
                </div>

                {onSearchChange && (
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder={t('notesSidebar.searchPlaceholder')}
                            value={searchQuery || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 space-y-3 border-b border-border/20">
                {/* Action Buttons Row */}
                <div className="flex gap-2">
                    <button
                        onClick={onNewNote}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-colors border border-primary/20"
                    >
                        <EditIcon className="w-3.5 h-3.5" />
                        <span>{t('notesSidebar.newNote')}</span>
                    </button>
                    {/* Electron-only: Template button */}
                    {isElectron && onOpenTemplates && (
                        <button
                            onClick={onOpenTemplates}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold rounded-lg transition-colors border border-amber-500/20"
                            title={t('templates.createFromTemplate')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <span>{t('templates.title')}</span>
                        </button>
                    )}
                </div>



                {/* Filters Row */}
                <div className="flex gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                        className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg text-[11px] font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 focus:outline-none focus:border-primary/50 cursor-pointer appearance-none"
                        style={{ colorScheme: 'dark' }}
                    >
                        <option value="all">{t('notesSidebar.filterAll')}</option>
                        <option value="today">{t('notesSidebar.filterToday')}</option>
                        <option value="week">{t('notesSidebar.filterWeek')}</option>
                        <option value="month">{t('notesSidebar.filterMonth')}</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg text-[11px] font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 focus:outline-none focus:border-primary/50 cursor-pointer appearance-none"
                        style={{ colorScheme: 'dark' }}
                    >
                        <option value="recent">{t('notesSidebar.sortRecent')}</option>
                        <option value="oldest">{t('notesSidebar.sortOldest')}</option>
                        <option value="alphabetical">{t('notesSidebar.sortAlphabetical')}</option>
                    </select>
                </div>

                {/* Mobile Sync Button (Native only) */}
                <div className="mt-2">
                    <MobileSyncButton />
                </div>
            </div>

            {/* Tags Section */}
            {allTags.length > 0 && (
                <div className="border-b border-border/20">
                    <button
                        onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                        className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors group"
                    >
                        <h3 className="text-[10px] font-bold uppercase text-text-secondary tracking-widest group-hover:text-primary transition-colors">
                            {t('notesSidebar.tagsTitle')}
                        </h3>
                        <ChevronDownIcon
                            className={`w-3 h-3 text-text-secondary transition-transform duration-200 ${isTagsExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {isTagsExpanded && (
                        <div className="px-4 pb-3 flex flex-wrap gap-1.5 animate-fade-in-down">
                            <button
                                onClick={() => onSelectTag(null)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedTag === null ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'}`}
                            >
                                All
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onSelectTag(tag)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border ${selectedTag === tag ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'}`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notes List */}
            <div className="flex-grow overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40">
                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-text-secondary opacity-50">
                        <span className="text-4xl mb-2">📝</span>
                        <p className="text-sm">{t('openNote.noNotes') || "Not bulunamadı"}</p>
                    </div>
                ) : (
                    <div>
                        {Object.entries(groupedNotes).map(([groupName, groupNotes]) => {
                            const isPinned = groupName === t('notesSidebar.pinned');
                            const isExpanded = expandedGroups[groupName] ?? (isPinned || groupName === t('notesSidebar.today') || true); // Always expand mostly

                            return (
                                <div key={groupName} className="mb-4">
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        className="w-full px-3 py-2 flex items-center justify-between group"
                                    >
                                        <span className="text-[10px] font-bold uppercase text-text-secondary/70 tracking-widest group-hover:text-primary transition-colors">
                                            {isPinned && '📌 '}{groupName}
                                        </span>
                                        <div className="h-[1px] flex-grow bg-border/20 mx-3 group-hover:bg-primary/20 transition-colors"></div>
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-1">
                                            {groupNotes.map(note => {
                                                const isActive = activeNoteId === note.id;
                                                return (
                                                    <div
                                                        key={note.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => onSelectNote(note.id)}
                                                        className={`
                                                            group relative w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer
                                                            ${isActive
                                                                ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/5'
                                                                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10 hover:translate-y-[-1px]'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex justify-between items-start">
                                                                <h3 className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                                                                    {note.title || t('defaultNoteTitle')}
                                                                </h3>
                                                                {note.isLocked && <LockIcon width="12" height="12" className="text-text-secondary" />}
                                                                {note.reminder && <BellIcon width="12" height="12" className="text-amber-500" />}
                                                            </div>

                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-text-secondary/60 truncate max-w-[120px]">
                                                                    {note.plainTextContent?.slice(0, 30) || "Empty..."}
                                                                </span>
                                                                <span className="text-[10px] text-text-secondary/40 whitespace-nowrap">
                                                                    {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>

                                                            {/* Tags in list */}
                                                            {note.tags && note.tags.length > 0 && (
                                                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                                                    {note.tags.slice(0, 2).map(tag => (
                                                                        <span key={tag} className={`px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide ${isActive ? 'bg-primary/20 text-primary' : 'bg-black/20 text-text-secondary'}`}>
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                    {note.tags.length > 2 && <span className="text-[9px] text-text-secondary">+{note.tags.length - 2}</span>}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Hover Actions */}
                                                        <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm rounded-lg p-0.5 ${isActive ? 'opacity-100' : ''}`}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
                                                                className={`p-1 rounded hover:bg-background/80 ${note.isPinned ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                                                            >
                                                                <PinIcon width="12" height="12" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                                                className="p-1 rounded hover:bg-red-500/20 text-text-secondary hover:text-red-500"
                                                            >
                                                                <TrashIcon width="12" height="12" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* User/Settings Compact Area at bottom */}
            <div className="p-4 border-t border-border/20 text-xs text-center text-text-secondary/40">
                Neural Pad v3.0
            </div>
        </aside>
    );
};

export default NotesSidebar;