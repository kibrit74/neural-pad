
import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Editor as TiptapEditor } from '@tiptap/react';

import Header from './components/Header';
import Editor from './components/Editor';
import NotesSidebar from './components/NotesSidebar';
import ContextMenu from './components/ContextMenu';
import SettingsModal from './components/SettingsModal';
import Notification from './components/Notification';
import ResizableHandle from './components/ResizableHandle';
import TagInput from './components/TagInput';
// Lazy-loaded heavy components
const Chat = React.lazy(() => import('./components/Chat'));
const WelcomeModal = React.lazy(() => import('./components/WelcomeModal'));
const HelpModal = React.lazy(() => import('./components/HelpModal'));
const MarkdownModal = React.lazy(() => import('./components/MarkdownModal'));
const HistoryModal = React.lazy(() => import('./components/HistoryModal'));
const SaveAsModal = React.lazy(() => import('./components/SaveAsModal'));
import PasswordModal, { PasswordMode } from './components/PasswordModal';
import ShareModal from './components/ShareModal';
import ReminderModal from './components/ReminderModal';
import ReminderAlertModal from './components/ReminderAlertModal';
import DataHunterSidebar from './components/DataHunterSidebar';
import CustomPatternManager from './components/CustomPatternManager';
import QuickActionsBar from './components/QuickActionsBar';
import SyncModal from './components/SyncModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import ProfileDashboard from './components/ProfileDashboard';
import { authService, type AuthUser } from './services/authService';
// TagInput is small, keep it eager

import type { Settings, NotificationType, Note } from './types';
import { useTranslations } from './hooks/useTranslations';
import * as db from './services/database';
import { CloseIcon } from './components/icons/Icons';
import { encryptString, decryptString } from './utils/crypto';
import { debounce } from './utils/debounce';

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
    const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        anchorEl: HTMLElement | null;
        type?: 'text' | 'image';
        data?: string;
    }>({ anchorEl: null });
    const [chatWidth, setChatWidth] = useState(384); // 24rem
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMarkdownModalOpen, setMarkdownModalOpen] = useState(false);
    const [isSaveAsModalOpen, setSaveAsModalOpen] = useState(false);
    const [isDataHunterOpen, setDataHunterOpen] = useState(false);
    const [isPatternManagerOpen, setPatternManagerOpen] = useState(false);
    const [isSyncModalOpen, setSyncModalOpen] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isProfileDashboardOpen, setProfileDashboardOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

    // Password / lock state
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordMode, setPasswordMode] = useState<PasswordMode>('set');
    const [passwordTargetNoteId, setPasswordTargetNoteId] = useState<number | null>(null);
    const passwordCacheRef = useRef<Map<number, string>>(new Map());

    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isReminderModalOpen, setReminderModalOpen] = useState(false);
    const [shareContent, setShareContent] = useState(''); // For context menu selection share
    const [reminderAlert, setReminderAlert] = useState<{ noteId: number; noteTitle: string } | null>(null);
    const triggeredRemindersRef = useRef<Set<number>>(new Set()); // Track already triggered reminders
    const [reminderSelectionText, setReminderSelectionText] = useState('');
    const userNavigatedToLandingRef = useRef(false); // Track if user intentionally navigated to landing

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reminder check interval (every 30 seconds)
    useEffect(() => {
        const checkReminders = () => {
            console.log('[Reminder Check] Running check, notes count:', notes.length);
            const now = new Date();
            for (const note of notes) {
                if (note.reminder) {
                    const reminderTime = new Date(note.reminder);
                    const isTriggered = triggeredRemindersRef.current.has(note.id);
                    console.log('[Reminder Check] Note:', note.title, 'Reminder:', reminderTime, 'Now:', now, 'Is due:', reminderTime <= now, 'Already triggered:', isTriggered);

                    if (!isTriggered && reminderTime <= now) {
                        // Trigger reminder
                        console.log('[Reminder Check] TRIGGERING REMINDER for:', note.title);
                        triggeredRemindersRef.current.add(note.id);
                        setReminderAlert({ noteId: note.id, noteTitle: note.title || 'Başlıksız Not' });

                        // Also show Electron notification if available
                        if ((window as any).electron?.showNotification) {
                            (window as any).electron.showNotification({
                                title: '⏰ Hatırlatıcı',
                                body: note.title || 'Başlıksız Not',
                            });
                        }
                        break; // Show one at a time
                    }
                }
            }
        };

        // Check immediately and then every 30 seconds
        checkReminders();
        const intervalId = setInterval(checkReminders, 30000);
        return () => clearInterval(intervalId);
    }, [notes]);

    const notificationIdRef = useRef(0);

    const addNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        const id = ++notificationIdRef.current;
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
        if (!noteToSave) return null;

        // Skip saving empty notes
        if (!noteToSave.title && !noteToSave.content) {
            if (!quiet) console.log('⏭️ Skipping save for empty note');
            return null;
        }

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
            if (activeNoteRef.current && updatedNoteInList) {
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
            // Ignore "Cannot save empty note" errors in quiet mode
            if (error.message === 'Cannot save empty note' && quiet) {
                return null;
            }
            if (!quiet) {
                addNotification(t('notifications.saveError', { message: error.message }), 'error');
            }
            console.error('Save failed:', error.message);
            return null;
        }
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
                editorRef.current?.commands.setContent('', false);
                setPasswordTargetNoteId(note.id);
                setPasswordMode('unlock');
                setPasswordModalOpen(true);
            } else {
                // By passing `emitUpdate: false`, we prevent `onUpdate` from firing unnecessarily,
                // which avoids a potential race condition and improves stability.
                editorRef.current?.commands.setContent(note.content, false);
            }
        }
    }, [handleSaveNow]);

    const handleNewNote = useCallback(async () => {
        console.log('handleNewNote called');
        if (activeNoteRef.current) {
            console.log('Saving current note before creating new one');
            await handleSaveNow(true);
        }

        // Create empty note in DB immediately to get real ID
        const newNoteData: Omit<Note, 'id'> = {
            title: '',
            content: '<p></p>', // Minimal content to pass validation
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            console.log('Creating new note in DB...');
            const newId = await db.saveNote(newNoteData);
            console.log('New note created with ID:', newId);
            const allNotes = await db.getAllNotes();
            console.log('All notes after creation:', allNotes.length);
            setNotes(allNotes);
            console.log('Selecting new note...');
            await handleSelectNote(newId, true);
            console.log('New note selected, activeNote should be set');
            titleInputRef.current?.focus();
        } catch (error: any) {
            console.error('handleNewNote error:', error);
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
                // Web versiyonunda welcome göster ama uygulamayı da yükle
                console.log('Running in Web - showing welcome screen, initializing app');
                setShowWelcome(true);
                // Remove early return - web app needs to initialize too!
            }

            const saved = localStorage.getItem('gemini-writer-settings');
            if (saved) {
                setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
            }
            try {
                console.log('Loading notes from database...');
                const allNotes = await db.getAllNotes();
                console.log('Loaded notes:', allNotes.length);
                setNotes(allNotes);
                if (allNotes.length > 0) {
                    console.log('Selecting first note:', allNotes[0].id);
                    await handleSelectNote(allNotes[0].id, true);
                    console.log('First note selected');
                } else {
                    console.log('No notes found, creating new note...');
                    await handleNewNote();
                    console.log('New note created');
                }
            } catch (error: any) {
                console.error('Load initial data error:', error);
                addNotification(t('notifications.loadError', { message: error.message }), 'error');
            }
        };

        loadInitialData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auth state listener (Web only)
    useEffect(() => {
        // Only run auth in web mode (not Electron)
        const isElectron = (window as any)?.electron?.isElectron === true;
        if (isElectron) return;

        const unsubscribe = authService.onAuthStateChange((user) => {
            setCurrentUser(user);

            // If user logs out, show welcome/auth
            if (!user && showWelcome === false) {
                setShowWelcome(true);
            }

            // If user logs in and welcome is showing, hide it
            // BUT only if user didn't intentionally navigate to landing page
            if (user && showWelcome === true && !userNavigatedToLandingRef.current) {
                setShowWelcome(false);
            }
        });

        return () => unsubscribe();
    }, [showWelcome]);

    const handleEnterApp = () => {
        const isElectron = (window as any)?.electron?.isElectron === true;

        // Reset the intentional navigation flag
        userNavigatedToLandingRef.current = false;

        // Allow both web and Electron users to enter the app
        setShowWelcome(false);

        // Only save to localStorage in Electron (web uses session storage or auth state)
        if (isElectron) {
            localStorage.setItem('hasSeenWelcomeScreen', 'true');
        }
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

    // Auto-save debounced function
    const autoSaveRef = useRef<ReturnType<typeof debounce> | null>(null);

    useEffect(() => {
        // Create debounced save function (1 second delay)
        autoSaveRef.current = debounce(async (note: Note) => {
            try {
                console.log('[Auto-save] Saving note:', note.id, note.title);
                await db.saveNote(note);
                console.log('[Auto-save] Note saved successfully');
            } catch (error) {
                console.error('[Auto-save] Error:', error);
                addNotification(t('notifications.saveError') || 'Kaydetme hatası', 'error');
            }
        }, 1000);

        return () => {
            // Cleanup on unmount
            if (autoSaveRef.current) {
                // Final save before unmount if needed
            }
        };
    }, []);

    // Trigger auto-save when activeNote changes
    useEffect(() => {
        if (activeNote && activeNote.id) {
            autoSaveRef.current?.(activeNote);
        }
    }, [activeNote]);

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
        anchor.style.left = `${event.clientX} px`;
        anchor.style.top = `${event.clientY} px`;

        setContextMenu({ anchorEl: anchor, type: menuType, data: menuData });
    };

    const closeContextMenu = () => {
        setContextMenu({ anchorEl: null });
    };

    const handleAiImageMenu = (target: HTMLElement, src: string) => {
        setContextMenu({ anchorEl: target, type: 'image', data: src });
    };


    // UI Toggles
    const toggleNotesSidebar = () => setNotesSidebarOpen(!isNotesSidebarOpen);
    const toggleChatSidebar = () => setChatSidebarOpen(!isChatSidebarOpen);
    const toggleDataHunter = () => setDataHunterOpen(!isDataHunterOpen);

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

    const getEditorContext = useCallback(async () => {
        const html = activeNoteRef.current?.content || '';
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = (div.textContent || div.innerText || '').trim();
        const imgs = Array.from(div.querySelectorAll('img')) as HTMLImageElement[];

        const images: { mimeType: string; data: string }[] = [];

        for (const img of imgs) {
            const src = img.src || '';

            if (src.startsWith('data:')) {
                // Data URL - extract base64
                const [meta, data] = src.split(',');
                const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/png';
                images.push({ mimeType, data });
            } else if (src.startsWith('file://')) {
                // File URL - convert to base64
                try {
                    const response = await fetch(src);
                    const blob = await response.blob();
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const result = reader.result as string;
                            const data = result.split(',')[1];
                            resolve(data);
                        };
                        reader.readAsDataURL(blob);
                    });
                    images.push({ mimeType: blob.type || 'image/png', data: base64 });
                } catch (error) {
                    console.error('[getEditorContext] Failed to load image:', src, error);
                }
            }
        }

        return { text, images };
    }, []);

    const handleInsertToEditor = useCallback((content: string) => {
        if (!editorRef.current) return;

        // Convert markdown to HTML if needed
        const htmlContent = content.replace(/\n/g, '<br>');

        // Insert at the end of the document
        editorRef.current.chain().focus().insertContent(`< p > ${htmlContent}</p > `).run();
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

    // Loading state - show nothing until we determine if welcome should be shown
    if (showWelcome === null) {
        return (
            <div className="flex h-screen w-screen bg-background text-text-primary items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (showWelcome) {
        return (
            <Suspense fallback={
                <div className="flex h-screen w-screen bg-background text-text-primary items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">{t('common.loading')}</p>
                    </div>
                </div>
            }>
                <WelcomeModal
                    isOpen={showWelcome}
                    onClose={handleEnterApp}
                    onAuthClick={() => {
                        console.log('[App] onAuthClick called, opening AuthModal');
                        setAuthModalOpen(true);
                    }}
                    currentUser={currentUser}
                />

                {/* Auth modals need to be here too, not just below */}
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    onSuccess={() => {
                        // Auth successful, load user data
                        setShowWelcome(false);
                    }}
                    addNotification={addNotification}
                />

                {isProfileModalOpen && currentUser && (
                    <ProfileModal
                        user={currentUser}
                        onClose={() => setProfileModalOpen(false)}
                        addNotification={addNotification}
                    />
                )}
            </Suspense>
        );
    }

    const handlePasswordUnlock = async () => {
        setPasswordModalOpen(false);
    };

    const handleDismissReminder = async (noteId: number) => {
        try {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                const updatedNote = { ...note, reminder: null };
                const newNotes = notes.map(n => n.id === noteId ? updatedNote : n);
                setNotes(newNotes);

                if (activeNote && activeNote.id === noteId) {
                    setActiveNote(updatedNote);
                    activeNoteRef.current = updatedNote;
                }

                await db.saveNote(updatedNote);
            }
        } catch (error) {
            console.error('Failed to dismiss reminder:', error);
            addNotification('Hatırlatıcı temizlenemedi', 'error');
        }
    };

    const handleDownload = () => {
        if (!activeNote) return;
        try {
            const safeTitle = (activeNote.title || 'note').replace(/[^a-z0-9-_]+/gi, '_');
            const html = activeNote.content || '';

            // Simple HTML to text conversion
            const div = document.createElement('div');
            div.innerHTML = html;
            const text = div.textContent || div.innerText || '';

            // Download as TXT
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeTitle}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            addNotification(t('notifications.downloadSuccess') || 'İndirildi', 'success');
        } catch (err: any) {
            addNotification('Download failed: ' + err.message, 'error');
        }
    };

    const handleCopyAll = async () => {
        if (!activeNote?.content) return;
        try {
            // Create a temp element to strip HTML
            const div = document.createElement('div');
            div.innerHTML = activeNote.content;
            const text = div.textContent || div.innerText || '';

            await navigator.clipboard.writeText(text);
            addNotification(t('notifications.copied') || 'Kopyalandı', 'success');
        } catch (e) {
            addNotification('Kopyalama başarısız', 'error');
        }
    };

    return (
        <div className="flex h-screen w-screen bg-gradient-to-br from-background via-background-secondary to-[#000000] text-text-primary overflow-hidden font-sans">
            <Suspense fallback={null}>
                <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
            </Suspense>

            {!isMobile && isNotesSidebarOpen && (
                <div className="w-[280px] flex-shrink-0 h-full">
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
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                    />
                </div>
            )}

            <main className="flex-grow flex flex-col h-full relative">
                <Header
                    onToggleNotesSidebar={toggleNotesSidebar}
                    onToggleChatSidebar={toggleChatSidebar}
                    isChatOpen={isChatSidebarOpen}
                    onSave={() => {
                        console.log('Save clicked, activeNote:', activeNote);
                        handleSaveNow(false);
                    }}
                    onSaveAs={() => setSaveAsModalOpen(true)}
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
                    onDownload={handleDownload}
                    onOpenLandingPage={() => {
                        localStorage.removeItem('hasSeenWelcome');
                        userNavigatedToLandingRef.current = true; // Mark as intentional navigation
                        setShowWelcome(true);
                    }}
                    onShare={() => {
                        setShareContent(''); // Reset to use full note content
                        setShareModalOpen(true);
                    }}
                    onSync={(window as any).electron ? () => setSyncModalOpen(true) : undefined}
                    onReminder={() => setReminderModalOpen(true)}
                    onToggleDataHunter={toggleDataHunter}
                    isDataHunterOpen={isDataHunterOpen}
                    isLocked={activeNote?.isLocked || false}
                    onProfile={() => {
                        console.log('Profile button clicked, setting dashboard open');
                        setProfileDashboardOpen(true);
                    }}
                    currentUser={currentUser}
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
                    {activeNote && (
                        <TagInput
                            tags={activeNote.tags || []}
                            allTags={allTags}
                            onChange={handleTagsChange}
                        />
                    )}
                </div>
                <div className="flex-grow overflow-hidden relative" onContextMenu={handleContextMenu}>
                    <div className="absolute right-4 top-4 z-10 flex gap-2">
                        <button onClick={() => setMarkdownModalOpen(true)} className="px-2 py-1 text-xs rounded bg-background border border-border text-text-primary hover:bg-border">{t('common.markdown')}</button>
                    </div>
                    <Editor
                        content={activeNote?.content || ''}
                        onChange={handleEditorChange}
                        editorRef={editorRef}
                        onAiImageMenu={handleAiImageMenu}
                        addNotification={addNotification}
                        onVoiceSave={async () => { await handleSaveNow(true); }}
                        settings={settings}
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
                            onForceContentUpdate={() => {
                                // Force update note content from editor
                                if (editorRef.current && activeNote) {
                                    const currentContent = editorRef.current.getHTML();
                                    setActiveNote(prev => prev ? { ...prev, content: currentContent } : null);
                                }
                            }}
                            onShareSelection={(text) => {
                                setShareContent(text || activeNote?.content || '');
                                setShareModalOpen(true);
                            }}
                            onReminderSelection={(text) => {
                                setReminderSelectionText(text);
                                setReminderModalOpen(true);
                            }}
                        />
                    )}
                </div>
                {!isMobile && (
                    <QuickActionsBar
                        onCopyAll={handleCopyAll}
                        onExport={handleDownload}
                        onShare={() => {
                            setShareContent('');
                            setShareModalOpen(true);
                        }}
                        onSettings={() => setSettingsModalOpen(true)}
                    />
                )}
            </main>

            {!isMobile && isChatSidebarOpen && (
                <>
                    <ResizableHandle direction="horizontal" onResize={handleChatResize} />
                    <aside style={{ width: `${chatWidth} px` }} className="flex-shrink-0 h-full">
                        <Suspense fallback={<div className="p-4 text-text-secondary">{t('common.loading')}</div>}>
                            <Chat
                                settings={settings}
                                addNotification={addNotification}
                                onClose={toggleChatSidebar}
                                getEditorContext={getEditorContext}
                                onInsertToEditor={handleInsertToEditor}
                            />
                        </Suspense>
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
                    <div className={`fixed top - 0 left - 0 h - full z - 40 transition - transform duration - 300 ease -in -out w - [85vw] max - w - sm ${isNotesSidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}>
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
                    <div className={`fixed top - 0 right - 0 h - full z - 40 transition - transform duration - 300 ease -in -out w - [85vw] max - w - sm ${isChatSidebarOpen ? 'translate-x-0' : 'translate-x-full'} `}>
                        <Suspense fallback={<div className="p-4 text-text-secondary">{t('common.loading')}</div>}>
                            <Chat
                                settings={settings}
                                addNotification={addNotification}
                                onClose={toggleChatSidebar}
                                getEditorContext={getEditorContext}
                                onInsertToEditor={handleInsertToEditor}
                            />
                        </Suspense>
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
                                editorRef.current?.commands.setContent(html, false);
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
                            editorRef.current?.commands.setContent('', false);
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
                                editorRef.current?.commands.setContent(html, false);
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


            <Suspense fallback={null}>
                <MarkdownModal
                    isOpen={isMarkdownModalOpen}
                    html={activeNote?.content || ''}
                    onClose={() => setMarkdownModalOpen(false)}
                    onApply={(html) => {
                        editorRef.current?.commands.setContent(html, true);
                    }}
                />
            </Suspense>

            <Suspense fallback={null}>
                <HistoryModal
                    isOpen={isHistoryModalOpen}
                    noteId={activeNote?.id || null}
                    currentHtml={activeNote?.content || ''}
                    onClose={() => setHistoryModalOpen(false)}
                    onRestore={(html) => {
                        editorRef.current?.commands.setContent(html, true);
                        setHistoryModalOpen(false);
                    }}
                />
            </Suspense>

            <Suspense fallback={null}>
                <SaveAsModal
                    isOpen={isSaveAsModalOpen}
                    onClose={() => setSaveAsModalOpen(false)}
                    note={activeNote}
                    addNotification={addNotification}
                />
            </Suspense>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => {
                    setShareModalOpen(false);
                    setShareContent(''); // Clear selection share content
                }}
                title={activeNote?.title || ''}
                content={shareContent}
                fullContent={activeNote?.content || ''}
                addNotification={addNotification}
            />

            <ReminderModal
                isOpen={isReminderModalOpen}
                onClose={() => {
                    setReminderModalOpen(false);
                    setReminderSelectionText('');
                }}
                noteTitle={reminderSelectionText || activeNote?.title || ''}
                eventTitle={activeNote?.title || ''}
                eventDetails={reminderSelectionText || activeNote?.title || ''}
                currentReminder={activeNote?.reminder}
                onSave={async (reminder) => {
                    if (!activeNote) return;
                    console.log('[App] Saving reminder to note:', activeNote.title, 'Reminder:', reminder);
                    const updatedNote = { ...activeNote, reminder };
                    setActiveNote(updatedNote);
                    await db.saveNote(updatedNote);
                    console.log('[App] Reminder saved to DB, reloading notes...');
                    const allNotes = await db.getAllNotes();
                    setNotes(allNotes);
                    console.log('[App] Notes reloaded, first note with reminder:', allNotes.find(n => n.reminder));
                }}
                addNotification={addNotification}
            />

            <ReminderAlertModal
                isOpen={!!reminderAlert}
                onClose={() => setReminderAlert(null)}
                noteTitle={reminderAlert?.noteTitle || ''}
                noteId={reminderAlert?.noteId || 0}
                onGoToNote={(noteId) => {
                    const note = notes.find(n => n.id === noteId);
                    if (note) {
                        handleSelectNote(note.id);
                    }
                    setReminderAlert(null);
                }}
                onDismiss={handleDismissReminder}
            />

            <DataHunterSidebar
                isOpen={isDataHunterOpen}
                onClose={() => setDataHunterOpen(false)}
                noteContent={activeNote?.content || ''}
                noteTitle={activeNote?.title || ''}
                customPatterns={settings.customPatterns || []}
                onOpenPatternManager={() => setPatternManagerOpen(true)}
                settings={settings}
            />

            <CustomPatternManager
                isOpen={isPatternManagerOpen}
                onClose={() => setPatternManagerOpen(false)}
                patterns={settings.customPatterns || []}
                onPatternsChange={(patterns) => {
                    const newSettings = { ...settings, customPatterns: patterns };
                    setSettings(newSettings);
                    localStorage.setItem('gemini-writer-settings', JSON.stringify(newSettings));
                }}
            />

            <SyncModal
                isOpen={isSyncModalOpen}
                onClose={() => setSyncModalOpen(false)}
                addNotification={addNotification}
            />

            {isProfileModalOpen && currentUser && (
                <ProfileModal
                    user={currentUser}
                    onClose={() => setProfileModalOpen(false)}
                    addNotification={addNotification}
                />
            )}

            {isProfileDashboardOpen && currentUser && (
                <ProfileDashboard
                    user={currentUser}
                    settings={settings}
                    onSettingsChange={(newSettings: Settings) => {
                        setSettings(newSettings);
                        localStorage.setItem('gemini-writer-settings', JSON.stringify(newSettings));
                    }}
                    onClose={() => setProfileDashboardOpen(false)}
                />
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={() => {
                    // Auth successful, load user data
                    setShowWelcome(false);
                }}
                addNotification={addNotification}
            />



            <div className="absolute bottom-4 right-4 z-50 space-y-2 w-full max-w-sm" role="region" aria-live="polite" aria-relevant="additions" aria-atomic="false">
                {notifications.map(n => (
                    <Notification key={n.id} {...n} onDismiss={() => removeNotification(n.id)} />
                ))}
            </div>
        </div>
    );
};

export default App;
