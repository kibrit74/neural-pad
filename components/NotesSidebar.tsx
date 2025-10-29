import React, { useState, useMemo } from 'react';
import type { Note } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { TrashIcon, CloseIcon, EditIcon, PinIcon, ChevronDownIcon, LockIcon } from './icons/Icons';

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
}

type SortOption = 'recent' | 'oldest' | 'alphabetical';

const NotesSidebar: React.FC<NotesSidebarProps> = ({ 
    notes, activeNoteId, onSelectNote, onNewNote, onDeleteNote, onTogglePin, onClose,
    allTags, selectedTag, onSelectTag 
}) => {
    const { t } = useTranslations();
    const [sortBy, setSortBy] = useState<SortOption>('recent');

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
        let sortedNotes = [...notes];

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
    }, [notes, sortBy, t]);

    return (
        <aside className="w-full h-full bg-background-secondary border-r border-border-strong flex flex-col">
             <div className="p-2 border-b border-border-strong flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">{t('notesSidebar.title')}</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onNewNote}
                        title={t('notesSidebar.newNote')}
                        className="p-2 text-sm font-semibold bg-primary text-primary-text rounded-full hover:bg-primary-hover transition-colors"
                    >
                        <EditIcon />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border">
                        <CloseIcon />
                    </button>
                </div>
            </div>

            {/* Sort buttons */}
            <div className="p-2 border-b border-border-strong flex gap-1 overflow-x-auto">
                <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                        sortBy === 'recent' ? 'bg-primary text-primary-text' : 'bg-background border border-border-strong text-text-primary hover:bg-border'
                    }`}
                >
                    {t('notesSidebar.sortRecent')}
                </button>
                <button
                    onClick={() => setSortBy('oldest')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                        sortBy === 'oldest' ? 'bg-primary text-primary-text' : 'bg-background border border-border-strong text-text-primary hover:bg-border'
                    }`}
                >
                    {t('notesSidebar.sortOldest')}
                </button>
                <button
                    onClick={() => setSortBy('alphabetical')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                        sortBy === 'alphabetical' ? 'bg-primary text-primary-text' : 'bg-background border border-border-strong text-text-primary hover:bg-border'
                    }`}
                >
                    {t('notesSidebar.sortAlphabetical')}
                </button>
            </div>

            {allTags.length > 0 && (
                <div className="p-3 border-b border-border-strong">
                    <h3 className="text-xs font-bold uppercase text-text-secondary tracking-wider mb-2">{t('notesSidebar.tagsTitle')}</h3>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => onSelectTag(null)}
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                selectedTag === null ? 'bg-primary text-primary-text' : 'bg-border hover:bg-border-strong text-text-primary'
                            }`}
                        >
                            {t('notesSidebar.allNotes')}
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => onSelectTag(tag)}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                    selectedTag === tag ? 'bg-primary text-primary-text' : 'bg-border hover:bg-border-strong text-text-primary'
                                }`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="overflow-y-auto flex-grow">
                {notes.length === 0 ? (
                    <p className="p-4 text-center text-text-secondary">{t('openNote.noNotes')}</p>
                ) : (
                    <div>
                        {Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
                            <div key={groupName}>
                                <h3 className="sticky top-0 bg-background-secondary px-3 py-2 text-xs font-bold uppercase text-text-secondary tracking-wider border-b border-border">
                                    {groupName === t('notesSidebar.pinned') && '📌 '}{groupName} ({groupNotes.length})
                                </h3>
                                <ul>
                                    {groupNotes.map(note => (
                                        <li key={note.id}>
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNote(note.id); } }}
                                                onClick={() => onSelectNote(note.id)}
                                                className={`w-full text-left p-3 border-b border-border transition-colors group ${
                                                    activeNoteId === note.id ? 'bg-primary/20' : 'hover:bg-border'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-grow overflow-hidden">
                                                        <h3 className="font-semibold truncate text-text-primary flex items-center gap-1">
                                                            {note.title || t('defaultNoteTitle')}
                                                            {note.isLocked && <LockIcon width="14" height="14" className="text-text-secondary" />}
                                                        </h3>
                                                        <p className="text-xs text-text-secondary mt-1">{formatDate(note.updatedAt)}</p>
                                                        {note.tags && note.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                                {note.tags.slice(0, 3).map(tag => (
                                                                    <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-border text-text-secondary">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onTogglePin(note.id);
                                                            }}
                                                            title={note.isPinned ? 'Unpin' : 'Pin'}
                                                            className={`p-1 rounded-full transition-all ${
                                                                note.isPinned 
                                                                    ? 'text-primary opacity-100' 
                                                                    : 'opacity-0 group-hover:opacity-100 text-text-secondary hover:text-primary'
                                                            }`}
                                                        >
                                                            <PinIcon />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteNote(note.id);
                                                            }}
                                                            title={t('notesSidebar.deleteNote')}
                                                            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-error-bg text-text-secondary hover:text-error-text transition-opacity"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default NotesSidebar;