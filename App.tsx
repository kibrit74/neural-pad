
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Editor as TiptapEditor } from '@tiptap/react';

import Header from './components/Header';
import Editor from './components/Editor';
import NotesSidebar from './components/NotesSidebar';
import Chat from './components/Chat';
import ContextMenu from './components/ContextMenu';
import SettingsModal from './components/SettingsModal';
import Notification from './components/Notification';
import ResizableHandle from './components/ResizableHandle';
import WelcomeModal from './components/WelcomeModal';
import HelpModal from './components/HelpModal';
import MakeBlueprintModal from './components/MakeBlueprintModal';
import MarkdownModal from './components/MarkdownModal';
import HistoryModal from './components/HistoryModal';
import PasswordModal, { PasswordMode } from './components/PasswordModal';

import type { Settings, NotificationType, Note } from './types';
import { useTranslations } from './hooks/useTranslations';
import * as db from './utils/db';
import { CloseIcon } from './components/icons/Icons';
import { encryptString, decryptString } from './utils/crypto';

const DEFAULT_SETTINGS: Settings = {
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    apiProvider: 'gemini',
    autoSave: false,
};

const API_KEY_NOTIFICATION_ID = -1; // Special ID for the persistent API key notification

const App: React.FC = () => {
    const { t } = useTranslations();
    
    // State
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const editorRef = useRef<TiptapEditor | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const activeNoteRef = useRef(activeNote);

    useEffect(() => {
        activeNoteRef.current = activeNote;
    }, [activeNote]);

    // UI State
    const [isNotesSidebarOpen, setNotesSidebarOpen] = useState(false);
    const [isChatSidebarOpen, setChatSidebarOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isHelpModalOpen, setHelpModalOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ 
        anchorEl: HTMLElement | null;
        type?: 'text' | 'image';
        data?: string;
    }>({ anchorEl: null });
    const [chatWidth, setChatWidth] = useState(384); // 24rem
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMakeBlueprintOpen, setMakeBlueprintOpen] = useState(false);
    const [blueprintSelectedText, setBlueprintSelectedText] = useState('');
    const [isMarkdownModalOpen, setMarkdownModalOpen] = useState(false);

    // Password / lock state
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordMode, setPasswordMode] = useState<PasswordMode>('set');
    const [passwordTargetNoteId, setPasswordTargetNoteId] = useState<number | null>(null);
    const passwordCacheRef = useRef<Map<number, string>>(new Map());

    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const addNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
    };
    
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Effect to manage the API key missing notification
    useEffect(() => {
        const { apiProvider, openaiApiKey, claudeApiKey, geminiApiKey } = settings;
        const isKeyMissing =
            (apiProvider === 'openai' && !openaiApiKey) ||
            (apiProvider === 'claude' && !claudeApiKey) ||
            (apiProvider === 'gemini' && !geminiApiKey);

        setNotifications(prev => {
            const hasNotification = prev.some(n => n.id === API_KEY_NOTIFICATION_ID);

            if (isKeyMissing) {
                // Key is missing, add notification if it's not there.
                if (!hasNotification) {
                    return [...prev, {
                        id: API_KEY_NOTIFICATION_ID,
                        message: t('notifications.apiKeyMissingAction'),
                        type: 'warning',
                        persistent: true,
                        onClick: () => setSettingsModalOpen(true)
                    }];
                }
            } else {
                // Key is NOT missing, remove notification if it's there.
                if (hasNotification) {
                    return prev.filter(n => n.id !== API_KEY_NOTIFICATION_ID);
                }
            }
            // No change needed
            return prev;
        });
    }, [settings, t]);


    // Note Management
    const handleSaveNow = useCallback(async (quiet = false) => {
        const noteToSave = activeNoteRef.current;
        if (noteToSave) {
            try {
                let payload = noteToSave as any;
                if (noteToSave.isLocked) {
                    const pwd = passwordCacheRef.current.get(noteToSave.id);
                    if (!pwd) {
                        if (!quiet) addNotification(t('notifications.cannotSaveLocked'), 'error');
                        return null;
                    }
                    const encrypted = await encryptString(noteToSave.content || '', pwd);
                    payload = { ...noteToSave, encrypted, content: '' };
                }

                const savedId = await db.saveNote(payload);
                const allNotes = await db.getAllNotes();
                setNotes(allNotes);

                const updatedNoteInList = allNotes.find(n => n.id === savedId);
                
                // Ensure the active note in state is also updated with the new `updatedAt` timestamp
                if (activeNoteRef.current && activeNoteRef.current.id === savedId && updatedNoteInList) {
                    if (noteToSave.isLocked) {
                        // Preserve decrypted content in the editor/state
                        setActiveNote(prev => prev ? { ...updatedNoteInList, content: prev.content } : updatedNoteInList);
                    } else {
                        setActiveNote(updatedNoteInList);
                    }
                }
                
                if (!quiet) {
                    addNotification(t('notifications.noteSaved'), 'success');
                }
                return savedId;
            } catch (error: any) {
                if (!quiet) {
                    addNotification(t('notifications.saveError', { message: error.message }), 'error');
                }
                console.error('Save failed:', error.message);
                return null;
            }
        }
        return null;
    }, [t]);

    // Ctrl+S shortcut
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleSaveNow(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleSaveNow]);
    
    // Auto-Save Effect
    useEffect(() => {
        if (!settings.autoSave) return;

        const intervalId = setInterval(() => {
            handleSaveNow(true);
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(intervalId);
    }, [settings.autoSave, handleSaveNow]);

    const handleSelectNote = useCallback(async (id: number, skipSave = false) => {
        if (activeNoteRef.current && activeNoteRef.current.id === id) {
            return;
        }

        if (!skipSave && activeNoteRef.current) {
            await handleSaveNow(true);
        }

        const note = await db.getNote(id);
        if (note) {
            setActiveNote(note);
            if (note.isLocked && note.encrypted) {
                // Show empty editor until unlocked
                editorRef.current?.commands.setContent('', { emitUpdate: false });
                setPasswordTargetNoteId(note.id);
                setPasswordMode('unlock');
                setPasswordModalOpen(true);
            } else {
                // By passing `emitUpdate: false`, we prevent `onUpdate` from firing unnecessarily,
                // which avoids a potential race condition and improves stability.
                editorRef.current?.commands.setContent(note.content, { emitUpdate: false });
            }
        }
    }, [handleSaveNow]);

    const handleNewNote = useCallback(async () => {
        if (activeNoteRef.current) {
            await handleSaveNow(true);
        }
    
        const newNoteData: Omit<Note, 'id'> = {
            title: '',
            content: '',
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        try {
            const newId = await db.saveNote(newNoteData);
            const allNotes = await db.getAllNotes();
            setNotes(allNotes);
            await handleSelectNote(newId, true); // Select the new note, skip saving the previous (already saved)
            titleInputRef.current?.focus();
        } catch (error: any) {
            addNotification(t('notifications.saveError', { message: error.message }), 'error');
        }
    }, [handleSaveNow, handleSelectNote, t]);


    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            const isElectron = (window as any)?.electron?.isElectron === true;
            console.log('Electron Detection:', {
                isElectron,
                windowElectron: (window as any)?.electron,
                platform: (window as any)?.electron?.platform
            });
            
            if (isElectron) {
                // Electron'da welcome ekranını asla gösterme
                console.log('Running in Electron - skipping welcome screen');
                setShowWelcome(false);
            } else {
                // Web versiyonunda localStorage kontrolü yap
                const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeScreen');
                console.log('Running in Web - hasSeenWelcome:', hasSeenWelcome);
                if (!hasSeenWelcome) {
                    setShowWelcome(true);
                } else {
                    setShowWelcome(false);
                }
            }

            const saved = localStorage.getItem('gemini-writer-settings');
            if (saved) {
                setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
            }
            try {
                const allNotes = await db.getAllNotes();
                setNotes(allNotes);
                if (allNotes.length > 0) {
                    await handleSelectNote(allNotes[0].id, true);
                } else {
                    await handleNewNote();
                }
            } catch (error: any) {
                addNotification(t('notifications.loadError', { message: error.message }), 'error');
            }
        };

        loadInitialData();
    }, [t, handleNewNote, handleSelectNote]);

    const handleEnterApp = () => {
        setShowWelcome(false);
        localStorage.setItem('hasSeenWelcomeScreen', 'true');
    };

    const handleTitleChange = (newTitle: string) => {
        if (activeNote) {
            setActiveNote(prev => prev ? { ...prev, title: newTitle } : null);
        }
    };

    const handleEditorChange = (html: string) => {
        setActiveNote(prev => prev ? { ...prev, content: html } : null);
    };

    const handleTagsChange = (newTags: string[]) => {
        setActiveNote(prev => prev ? { ...prev, tags: newTags } : null);
    };
    
    const handleRemoveTag = (tagToRemove: string) => {
        if (activeNote) {
            const newTags = activeNote.tags?.filter(tag => tag !== tagToRemove) || [];
            handleTagsChange(newTags);
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            await db.deleteNote(id);
            addNotification(t('notifications.noteDeleted'), 'success');
            const remainingNotes = notes.filter(n => n.id !== id);
            setNotes(remainingNotes);
            if (activeNote?.id === id) {
                if (remainingNotes.length > 0) {
                    await handleSelectNote(remainingNotes[0].id, true);
                } else {
                    await handleNewNote();
                }
            }
        } catch (error: any) {
            addNotification(t('notifications.deleteError', { message: error.message }), 'error');
        }
    };

    const handleTogglePin = async (id: number) => {
        const noteToToggle = notes.find(n => n.id === id);
        if (!noteToToggle) return;

        const updatedNote = { ...noteToToggle, isPinned: !noteToToggle.isPinned };
        
        try {
            await db.saveNote(updatedNote);
            const allNotes = await db.getAllNotes();
            setNotes(allNotes);
            
            // Update active note if it's the one being pinned
            if (activeNote?.id === id) {
                setActiveNote(updatedNote);
            }
        } catch (error: any) {
            addNotification(t('notifications.saveError', { message: error.message }), 'error');
        }
    };
    
    // Settings Management
    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem('gemini-writer-settings', JSON.stringify(newSettings));
        setSettingsModalOpen(false);
    };
    
    // Context Menu
    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        const editor = editorRef.current;
        if (!editor) return;

        const target = event.target as HTMLElement;
        const isImage = target.tagName === 'IMG' && target.classList.contains('gemini-writer-image');
        const isTextSelected = !editor.state.selection.empty;

        let menuType: 'text' | 'image' | undefined = undefined;
        let menuData: string | undefined = undefined;

        if (isImage) {
            menuType = 'image';
            menuData = (target as HTMLImageElement).src;
        } else if (isTextSelected) {
            menuType = 'text';
        } else {
            closeContextMenu();
            return;
        }

        const anchor = document.createElement('div');
        anchor.style.position = 'fixed';
        anchor.style.left = `${event.clientX}px`;
        anchor.style.top = `${event.clientY}px`;
        
        setContextMenu({ anchorEl: anchor, type: menuType, data: menuData });
    };
    
    const closeContextMenu = () => {
        setContextMenu({ anchorEl: null });
    };

    const handleAiImageMenu = (target: HTMLElement, src: string) => {
        setContextMenu({ anchorEl: target, type: 'image', data: src });
    };

    const handleMakeBlueprintOpen = (selectedText: string) => {
        setBlueprintSelectedText(selectedText);
        setMakeBlueprintOpen(true);
    };
    
    // UI Toggles
    const toggleNotesSidebar = () => setNotesSidebarOpen(!isNotesSidebarOpen);
    const toggleChatSidebar = () => setChatSidebarOpen(!isChatSidebarOpen);

    // Resize handler
    const handleChatResize = (deltaX: number) => {
        setChatWidth(prev => Math.max(256, Math.min(window.innerWidth - 300, prev - deltaX)));
    };
    
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.trim() && !isNotesSidebarOpen) {
            setNotesSidebarOpen(true);
        }
    };

    const getEditorContext = useCallback(() => {
        const html = activeNoteRef.current?.content || '';
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = (div.textContent || div.innerText || '').trim();
        const imgs = Array.from(div.querySelectorAll('img')) as HTMLImageElement[];
        const images = imgs
            .map(img => {
                const src = img.src || '';
                if (!src.startsWith('data:')) return null;
                const [meta, data] = src.split(',');
                const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/png';
                return { mimeType, data };
            })
            .filter(Boolean) as { mimeType: string; data: string }[];
        return { text, images };
    }, []);
    
    const allTags = useMemo(() => [...new Set(notes.flatMap(note => note.tags || []))].sort(), [notes]);

    const filteredNotes = useMemo(() => {
        let notesToFilter = notes;

        if (selectedTag) {
            notesToFilter = notesToFilter.filter(note => note.tags?.includes(selectedTag));
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const div = document.createElement('div'); // For fallback only
            notesToFilter = notesToFilter.filter(note => {
                if (note.title.toLowerCase().includes(lowerCaseQuery)) {
                    return true;
                }
                // Use performant plain text search if available
                if (note.plainTextContent !== undefined) {
                    return note.plainTextContent.toLowerCase().includes(lowerCaseQuery);
                }
                // Fallback for older notes without the plain text field
                div.innerHTML = note.content;
                const textContent = div.textContent || div.innerText || '';
                return textContent.toLowerCase().includes(lowerCaseQuery);
            });
        }
        
        return notesToFilter;
    }, [notes, selectedTag, searchQuery]);

    if (showWelcome) {
        return <WelcomeModal isOpen={showWelcome} onClose={handleEnterApp} />;
    }

    return (
        <div className="flex h-screen w-screen bg-background text-text-primary overflow-hidden font-sans">
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />

            {!isMobile && isNotesSidebarOpen && (
                <div className="w-72 flex-shrink-0">
                    <NotesSidebar
                        notes={filteredNotes}
                        activeNoteId={activeNote?.id || null}
                        onSelectNote={handleSelectNote}
                        onNewNote={handleNewNote}
                        onDeleteNote={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onClose={() => setNotesSidebarOpen(false)}
                        allTags={allTags}
                        selectedTag={selectedTag}
                        onSelectTag={setSelectedTag}
                    />
                </div>
            )}

            <main className="flex-grow flex flex-col h-full relative">
                <Header
                    onToggleNotesSidebar={toggleNotesSidebar}
                    onToggleChatSidebar={toggleChatSidebar}
                    isChatOpen={isChatSidebarOpen}
                    onSave={() => handleSaveNow(false)}
                    onSettings={() => setSettingsModalOpen(true)}
                    onHelp={() => setHelpModalOpen(true)}
                    onToggleLock={() => {
                        if (!activeNote) return;
                        setPasswordTargetNoteId(activeNote.id);
                        if (activeNote.isLocked) {
                            setPasswordMode('remove');
                        } else {
                            setPasswordMode('set');
                        }
                        setPasswordModalOpen(true);
                    }}
                    onOpenHistory={() => setHistoryModalOpen(true)}
                    isLocked={!!activeNote?.isLocked}
                    activeNote={activeNote}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                />
                <div className="px-4 pt-4 pb-4 border-b border-border-strong flex-shrink-0">
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={activeNote?.title || ''}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder={t('defaultNoteTitle')}
                        className="w-full text-2xl font-bold bg-transparent focus:outline-none text-text-primary placeholder:text-text-secondary"
                        aria-label="Note Title"
                    />
                     {activeNote?.tags && activeNote.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {activeNote.tags.map(tag => (
                                <span key={tag} className="flex items-center bg-border text-text-secondary text-xs font-semibold px-2 py-1 rounded-full">
                                    {tag}
                                    <button 
                                        onClick={() => handleRemoveTag(tag)} 
                                        className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-background"
                                        aria-label={`Remove tag ${tag}`}
                                    >
                                        <CloseIcon width="12" height="12" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-grow overflow-hidden relative" onContextMenu={handleContextMenu}>
                    <div className="absolute right-4 top-4 z-10 flex gap-2">
                        <button onClick={() => setMarkdownModalOpen(true)} className="px-2 py-1 text-xs rounded bg-background border border-border text-text-primary hover:bg-border">MD</button>
                    </div>
                    <Editor
                        content={activeNote?.content || ''}
                        onChange={handleEditorChange}
                        editorRef={editorRef}
                        onAiImageMenu={handleAiImageMenu}
                    />
                     {contextMenu.anchorEl && (
                        <ContextMenu
                            editor={editorRef.current!}
                            onClose={closeContextMenu}
                            settings={settings}
                            addNotification={addNotification}
                            anchorEl={contextMenu.anchorEl}
                            type={contextMenu.type}
                            data={contextMenu.data}
                            activeNote={activeNote}
                            onTagsChange={handleTagsChange}
                            onMakeBlueprintOpen={handleMakeBlueprintOpen}
                        />
                    )}
                </div>
            </main>

            {!isMobile && isChatSidebarOpen && (
                <>
                    <ResizableHandle direction="horizontal" onResize={handleChatResize} />
                    <aside style={{ width: `${chatWidth}px` }} className="flex-shrink-0 h-full">
                         <Chat
                            settings={settings}
                            addNotification={addNotification}
                            onClose={toggleChatSidebar}
                            getEditorContext={getEditorContext}
                        />
                    </aside>
                </>
            )}

            {/* Mobile Sidebars & Overlays */}
            {isMobile && (
                <>
                    {(isNotesSidebarOpen || isChatSidebarOpen) && (
                        <div
                            className="fixed inset-0 bg-backdrop z-30 animate-modal-enter"
                            onClick={() => {
                                setNotesSidebarOpen(false);
                                setChatSidebarOpen(false);
                            }}
                            aria-hidden="true"
                        />
                    )}
                    <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out w-[85vw] max-w-sm ${isNotesSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <NotesSidebar
                            notes={filteredNotes}
                            activeNoteId={activeNote?.id || null}
                            onSelectNote={(id) => {
                                handleSelectNote(id);
                                setNotesSidebarOpen(false);
                            }}
                            onNewNote={() => {
                                handleNewNote();
                                setNotesSidebarOpen(false);
                            }}
                            onDeleteNote={handleDeleteNote}
                            onTogglePin={handleTogglePin}
                            onClose={() => setNotesSidebarOpen(false)}
                            allTags={allTags}
                            selectedTag={selectedTag}
                            onSelectTag={setSelectedTag}
                        />
                    </div>
                    <div className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ease-in-out w-[85vw] max-w-sm ${isChatSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <Chat
                            settings={settings}
                            addNotification={addNotification}
                            onClose={toggleChatSidebar}
                            getEditorContext={getEditorContext}
                        />
                    </div>
                </>
            )}

            <SettingsModal
                isOpen={isSettingsModalOpen}
                settings={settings}
                onSave={handleSaveSettings}
                onClose={() => setSettingsModalOpen(false)}
            />

            <PasswordModal
                isOpen={isPasswordModalOpen}
                mode={passwordMode}
                onClose={() => setPasswordModalOpen(false)}
                onConfirm={async (pw) => {
                    const targetId = passwordTargetNoteId ?? activeNoteRef.current?.id ?? null;
                    if (!targetId) return;
                    const note = (activeNoteRef.current && activeNoteRef.current.id === targetId)
                        ? activeNoteRef.current
                        : (await db.getNote(targetId)) as Note;
                    if (!note) return;

                    if (passwordMode === 'unlock') {
                        try {
                            if (!note.encrypted) return;
                            const html = await decryptString(note.encrypted, pw);
                            // Cache password for saving
                            passwordCacheRef.current.set(note.id, pw);
                            // Update active note/editor
                            if (activeNoteRef.current?.id === note.id) {
                                setActiveNote(prev => prev ? { ...prev, content: html } : prev);
                                editorRef.current?.commands.setContent(html, { emitUpdate: false });
                            }
                            setPasswordModalOpen(false);
                        } catch (e) {
                            addNotification(t('notifications.wrongPassword'), 'error');
                        }
                        return;
                    }

                    if (passwordMode === 'set') {
                        // Encrypt current content and save as locked
                        const html = activeNoteRef.current?.content || '';
                        const encrypted = await encryptString(html, pw);
                        const payload = { ...note, isLocked: true, encrypted, content: '' } as Note;
                        await db.saveNote(payload);
                        const all = await db.getAllNotes();
                        setNotes(all);
                        // Reflect locked state in UI and clear editor
                        if (activeNoteRef.current?.id === note.id) {
                            setActiveNote(prev => prev ? { ...prev, isLocked: true, encrypted, content: '' } : prev);
                            editorRef.current?.commands.setContent('', { emitUpdate: false });
                        }
                        addNotification(t('notifications.noteLocked'), 'success');
                        setPasswordModalOpen(false);
                        return;
                    }

                    if (passwordMode === 'remove') {
                        try {
                            if (!note.encrypted) return;
                            const html = await decryptString(note.encrypted, pw);
                            const payload = { ...note, isLocked: false, encrypted: null, content: html } as Note;
                            await db.saveNote(payload);
                            const all = await db.getAllNotes();
                            setNotes(all);
                            if (activeNoteRef.current?.id === note.id) {
                                setActiveNote(prev => prev ? { ...prev, isLocked: false, encrypted: null, content: html } : prev);
                                editorRef.current?.commands.setContent(html, { emitUpdate: false });
                            }
                            // Clear cached password
                            passwordCacheRef.current.delete(note.id);
                            addNotification(t('notifications.lockRemoved'), 'success');
                            setPasswordModalOpen(false);
                        } catch (e) {
                            addNotification(t('notifications.wrongPassword'), 'error');
                        }
                        return;
                    }
                }}
            />

            <MakeBlueprintModal
                isOpen={isMakeBlueprintOpen}
                selectedText={blueprintSelectedText}
                onClose={() => setMakeBlueprintOpen(false)}
                addNotification={addNotification}
            />

            <MarkdownModal
                isOpen={isMarkdownModalOpen}
                html={activeNote?.content || ''}
                onClose={() => setMarkdownModalOpen(false)}
                onApply={(html) => {
                    editorRef.current?.commands.setContent(html, { emitUpdate: true });
                }}
            />

            <HistoryModal
                isOpen={isHistoryModalOpen}
                noteId={activeNote?.id || null}
                currentHtml={activeNote?.content || ''}
                onClose={() => setHistoryModalOpen(false)}
                onRestore={(html) => {
                    editorRef.current?.commands.setContent(html, { emitUpdate: true });
                    setHistoryModalOpen(false);
                }}
            />
            
            <div className="absolute bottom-4 right-4 z-50 space-y-2 w-full max-w-sm">
                {notifications.map(n => (
                    <Notification key={n.id} {...n} onDismiss={() => removeNotification(n.id)} />
                ))}
            </div>
        </div>
    );
};

export default App;