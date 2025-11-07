import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Settings, ChatMessage, WebSource } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import * as apiService from '../services/geminiService';
import type { EditorContext } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon, CloseIcon, SparkleIcon, SearchIcon, MicIcon } from './icons/Icons';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWhisperVoice } from '../hooks/useWhisperVoice';
import VoiceInputModal from './VoiceInputModal';

interface ChatProps {
    settings: Settings;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
    onClose: () => void;
    getEditorContext?: () => EditorContext | Promise<EditorContext>;
    onInsertToEditor?: (content: string) => void;
}

type Session = { id: string; title: string; messages: ChatMessage[] };

const Chat: React.FC<ChatProps> = ({ settings, addNotification, onClose, getEditorContext, onInsertToEditor }) => {
    const { t } = useTranslations();
    const { language } = useLanguage();
    const [sessions, setSessions] = useState<Session[]>([{ id: String(Date.now()), title: 'Chat 1', messages: [] }]);
    const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0].id);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useWebSearch, setUseWebSearch] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Voice recognition state
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [pastedImages, setPastedImages] = useState<{ mimeType: string; data: string }[]>([]);

    // Clear current session when provider changes to start a fresh chat
    useEffect(() => {
        setSessions(prev => prev.map(s => ({ ...s, messages: [] })));
    }, [settings.apiProvider]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const activeSession = sessions.find(s => s.id === activeSessionId)!;

    useEffect(scrollToBottom, [activeSession?.messages]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userInput: ChatMessage = { role: 'user', content: input };
        const currentHistory = [...activeSession.messages, userInput];
        
        // update session with user message
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: currentHistory } : s));
        setInput('');
        setIsLoading(true);

        try {
            // Build context with pasted images
            let ctx = getEditorContext ? await getEditorContext() : { text: '', images: [] };
            
            // Add pasted images from Chat
            if (pastedImages.length > 0) {
                console.log('[Chat] Adding pasted images to context:', pastedImages.length);
                pastedImages.forEach((img, idx) => {
                    console.log(`[Chat] Image ${idx}: MIME=${img.mimeType}, data length=${img.data?.length}`);
                });
                ctx = {
                    ...ctx,
                    images: [...(ctx.images || []), ...pastedImages]
                };
            }
            
            console.log('[Chat] Final context:', { 
                textLength: ctx.text?.length || 0, 
                imagesCount: ctx.images?.length || 0 
            });
            
            const stream = apiService.getChatStream(currentHistory, settings, useWebSearch, ctx, language);
            
            // Clear pasted images after sending
            setPastedImages([]);
            
            let modelResponse: ChatMessage = { role: 'model', content: '', sources: [] };
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, modelResponse] } : s));

            for await (const chunk of stream) {
                setSessions(prev => prev.map(s => {
                    if (s.id !== activeSessionId) return s;
                    const lastMessage = s.messages[s.messages.length - 1];
                    if (lastMessage?.role === 'model') {
                        const updatedContent = lastMessage.content + (chunk.text || '');
                        const newSources = chunk.sources || [];
                        const existingSources = lastMessage.sources || [];
                        const combinedSources = [...existingSources, ...newSources];
                        const uniqueSources = Array.from(new Map(combinedSources.map(item => [item.uri, item])).values());
                        const updatedMessage = { ...lastMessage, content: updatedContent, sources: uniqueSources };
                        return { ...s, messages: [...s.messages.slice(0, -1), updatedMessage] };
                    }
                    return s;
                }));
            }
        } catch (error: any) {
            const provider = settings.apiProvider.charAt(0).toUpperCase() + settings.apiProvider.slice(1);
            let notificationMessage = t('notifications.aiError', { message: error.message });

            if (error.message === 'QUOTA_EXCEEDED') {
                notificationMessage = t('notifications.quotaError', { provider });
            } else if (error.message === 'API_KEY_INVALID') {
                notificationMessage = t('notifications.apiKeyInvalid', { provider });
            }

            addNotification(notificationMessage, 'error');

            setSessions(prev => prev.map(s => {
                if (s.id !== activeSessionId) return s;
                const lastUserIndex = s.messages.map(m => m.role).lastIndexOf('user');
                if (lastUserIndex !== -1) {
                    return { ...s, messages: s.messages.slice(0, lastUserIndex) };
                }
                return s;
            }));
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, addNotification, t, useWebSearch, settings, activeSessionId, sessions, language, getEditorContext, activeSession.messages]);

    // Send helper for voice input (bypasses local input state)
    const handleSendVoice = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userInput: ChatMessage = { role: 'user', content: trimmed };
        const currentHistory = [...activeSession.messages, userInput];

        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: currentHistory } : s));
        setIsLoading(true);

        try {
            const ctx = getEditorContext ? await getEditorContext() : undefined;
            const stream = apiService.getChatStream(currentHistory, settings, useWebSearch, ctx, language);

            let modelResponse: ChatMessage = { role: 'model', content: '', sources: [] };
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, modelResponse] } : s));

            for await (const chunk of stream) {
                setSessions(prev => prev.map(s => {
                    if (s.id !== activeSessionId) return s;
                    const lastMessage = s.messages[s.messages.length - 1];
                    if (lastMessage?.role === 'model') {
                        const updatedContent = lastMessage.content + (chunk.text || '');
                        const newSources = chunk.sources || [];
                        const existingSources = lastMessage.sources || [];
                        const combinedSources = [...existingSources, ...newSources];
                        const uniqueSources = Array.from(new Map(combinedSources.map(item => [item.uri, item])).values());
                        const updatedMessage = { ...lastMessage, content: updatedContent, sources: uniqueSources };
                        return { ...s, messages: [...s.messages.slice(0, -1), updatedMessage] };
                    }
                    return s;
                }));
            }
        } catch (error: any) {
            const provider = settings.apiProvider.charAt(0).toUpperCase() + settings.apiProvider.slice(1);
            let notificationMessage = t('notifications.aiError', { message: error.message });

            if (error.message === 'QUOTA_EXCEEDED') {
                notificationMessage = t('notifications.quotaError', { provider });
            } else if (error.message === 'API_KEY_INVALID') {
                notificationMessage = t('notifications.apiKeyInvalid', { provider });
            }

            addNotification(notificationMessage, 'error');

            setSessions(prev => prev.map(s => {
                if (s.id !== activeSessionId) return s;
                const lastUserIndex = s.messages.map(m => m.role).lastIndexOf('user');
                if (lastUserIndex !== -1) {
                    return { ...s, messages: s.messages.slice(0, lastUserIndex) };
                }
                return s;
            }));
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, addNotification, t, useWebSearch, settings, activeSessionId, sessions, getEditorContext, activeSession.messages, language]);

    // Voice recognition hook - using Gemini/Whisper like notepad
    const { isRecording, isProcessing, start, stop, hasSupport } = useWhisperVoice({
        onResult: (transcript, isFinal) => {
            if (isFinal && transcript.trim()) {
                setFinalTranscript(prev => (prev ? prev + ' ' : '') + transcript);
            }
        },
        onError: (error) => {
            console.error('Voice recognition error:', error);
            const errorMsg = error.message || error;
            addNotification(
                language === 'tr' 
                    ? `Ses tanıma hatası: ${errorMsg}` 
                    : `Voice recognition error: ${errorMsg}`,
                'error'
            );
        },
        settings: settings,
        useGemini: !!(settings?.geminiApiKey) // Use Gemini if available
    });

    const isInitializing = isProcessing;

    const handleOpenVoiceModal = async () => {
        // Start Whisper if needed (only if Gemini not available)
        const isElectron = !!(window as any).electron;
        const hasGeminiKey = !!(settings?.geminiApiKey);
        
        if (!hasGeminiKey && isElectron && (window as any).electron?.whisper) {
            try {
                const modelSize = localStorage.getItem('whisper-model-size') || 'tiny';
                console.log('[Chat Voice] Starting Whisper service, model:', modelSize);
                await (window as any).electron.whisper.start(modelSize);
            } catch (error) {
                console.error('[Chat Voice] Failed to start Whisper:', error);
            }
        } else if (hasGeminiKey) {
            console.log('[Chat Voice] Using Gemini 2.0 Flash for transcription');
        }
        
        setShowVoiceModal(true);
        setFinalTranscript('');
        setInterimTranscript('');
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stop();
        } else {
            start();
        }
    };

    const handleSubmitVoice = (text: string) => {
        // Send the transcribed text to chat
        handleSendVoice(text);
        setFinalTranscript('');
        setInterimTranscript('');
    };

    const handleCloseVoiceModal = () => {
        if (isRecording) stop();
        setShowVoiceModal(false);
        setFinalTranscript('');
        setInterimTranscript('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle paste event for images
    const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;

                // Use file.type for more reliable MIME type
                const mimeType = file.type || item.type || 'image/png';
                console.log('[Chat Paste] File MIME type:', mimeType, 'File size:', file.size);

                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    console.log('[Chat Paste] Base64 length:', base64?.length);
                    setPastedImages(prev => [...prev, { mimeType, data: base64 }]);
                    addNotification(
                        language === 'tr' 
                            ? 'Resim eklendi. Mesajınızı yazıp gönderin.' 
                            : 'Image added. Write your message and send.',
                        'success'
                    );
                };
                reader.readAsDataURL(file);
            }
        }
    }, [addNotification, language]);
    
    const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
        const isUser = message.role === 'user';
        const Icon = isUser ? UserIcon : BotIcon;
        
        const handleInsert = () => {
            if (onInsertToEditor && message.content) {
                onInsertToEditor(message.content);
                addNotification(t('chat.insertedToEditor') || 'Editöre eklendi', 'success');
            }
        };
        
        return (
            <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isUser ? 'bg-primary/20 text-primary' : 'bg-border text-text-secondary'}`}>
                    <Icon />
                </div>
                <div className="flex-grow p-3 rounded-lg bg-background min-w-0 group relative">
                    {onInsertToEditor && message.content && (
                        <button
                            onClick={handleInsert}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-primary text-primary-text rounded text-xs hover:bg-primary-hover"
                            title={t('chat.insertToEditor') || 'Editöre Ekle'}
                        >
                            ↓ {t('chat.insertToEditor') || 'Editöre Ekle'}
                        </button>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary">
                        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                    </div>
                     {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 border-t border-border-strong pt-2">
                            <h4 className="text-xs font-semibold text-text-secondary mb-1.5">{t('chat.sources')}</h4>
                            <div className="flex flex-col gap-1.5">
                                {message.sources.map((source, index) => (
                                    <a
                                        key={index}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline truncate block"
                                        title={source.title}
                                    >
                                        {`[${index + 1}] ${source.title}`}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background-secondary border-l border-border-strong text-text-primary">
            <header className="p-3 border-b border-border-strong flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <SparkleIcon className="text-primary" />
                    <h2 className="text-lg font-bold">{t('chat.title')}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-border">
                    <CloseIcon />
                </button>
            </header>

            {/* Tabs */}
            <div className="px-2 py-1 border-b border-border-strong flex items-center gap-2 overflow-x-auto">
                {sessions.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSessionId(s.id)}
                        className={`px-2 py-1 text-xs rounded border ${s.id === activeSessionId ? 'bg-primary text-primary-text border-primary' : 'bg-background border-border text-text-primary hover:bg-border'}`}
                        title={s.title}
                    >
                        {s.title}
                        <span
                          className="ml-2 text-text-secondary hover:text-error-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessions(prev => prev.filter(x => x.id !== s.id));
                            if (activeSessionId === s.id) {
                              const left = sessions.find(x => x.id !== s.id);
                              setActiveSessionId(left ? left.id : String(Date.now()));
                              if (!left) setSessions([{ id: String(Date.now()), title: 'Chat 1', messages: [] }]);
                            }
                          }}
                        >×</span>
                    </button>
                ))}
                <button
                    onClick={() => {
                        const id = String(Date.now());
                        setSessions(prev => [...prev, { id, title: `Chat ${prev.length + 1}`, messages: [] }]);
                        setActiveSessionId(id);
                    }}
                    className="px-2 py-1 text-xs rounded bg-background border border-border text-text-primary hover:bg-border"
                >
                    +
                </button>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto">
                {activeSession.messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                        <BotIcon />
                        <p className="mt-2">{t('chat.startConversation')}</p>
                    </div>
                )}
                {activeSession.messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (activeSession.messages.length === 0 || activeSession.messages[activeSession.messages.length - 1]?.role !== 'model') && (
                     <div className="flex items-start gap-3 my-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-border text-text-secondary">
                            <BotIcon />
                        </div>
                        <div className="flex-grow p-3 rounded-lg bg-background">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 bg-border rounded-full animate-bounce-dot [animation-delay:-0.3s]"></span>
                                <span className="h-2.5 w-2.5 bg-border rounded-full animate-bounce-dot [animation-delay:-0.15s]"></span>
                                <span className="h-2.5 w-2.5 bg-border rounded-full animate-bounce-dot"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 border-t border-border-strong flex-shrink-0">
                 {/* Show pasted images */}
                 {pastedImages.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {pastedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                                <img 
                                    src={`data:${img.mimeType};base64,${img.data}`} 
                                    alt="Pasted" 
                                    className="w-20 h-20 object-cover rounded border border-border"
                                />
                                <button
                                    onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                 )}
                 <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onPaste={handlePaste}
                        placeholder={t('chat.placeholder')}
                        className="w-full p-2 pr-20 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={1}
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            onClick={handleOpenVoiceModal}
                            title={t('voice.start')}
                            className={`p-1.5 rounded-full transition-colors hover:bg-border`}
                        >
                            <MicIcon width="16" height="16" />
                        </button>
                        {settings.apiProvider === 'gemini' && (
                             <button
                                onClick={() => setUseWebSearch(!useWebSearch)}
                                title={t('chat.toggleWebSearch')}
                                className={`p-1.5 rounded-full transition-colors ${useWebSearch ? 'bg-primary text-primary-text' : 'hover:bg-border'}`}
                            >
                                <SearchIcon width="16" height="16" />
                            </button>
                        )}
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-1.5 bg-primary text-primary-text rounded-full hover:bg-primary-hover disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed"
                            aria-label={t('chat.send')}
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </footer>
            {showVoiceModal && (
                <VoiceInputModal
                    interimTranscript={interimTranscript}
                    finalTranscript={finalTranscript}
                    isRecording={isRecording}
                    isInitializing={isInitializing}
                    onToggleRecording={handleToggleRecording}
                    onSubmit={handleSubmitVoice}
                    onClose={handleCloseVoiceModal}
                />
            )}
        </div>
    );
};

export default Chat;