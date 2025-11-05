import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Settings, ChatMessage, WebSource } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import * as apiService from '../services/geminiService';
import type { EditorContext } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon, CloseIcon, SparkleIcon, SearchIcon, MicIcon } from './icons/Icons';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVoiceRecognitionUnified } from '../hooks/useVoiceRecognitionUnified';
import VoiceInputModal from './VoiceInputModal';

interface ChatProps {
    settings: Settings;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
    onClose: () => void;
    getEditorContext?: () => EditorContext;
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
            const ctx = getEditorContext ? getEditorContext() : undefined;
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
            const ctx = getEditorContext ? getEditorContext() : undefined;
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

    // Voice recognition hook
    const { isRecording, isInitializing, start, stop } = useVoiceRecognitionUnified({
        onResult: (transcript, isFinal) => {
            if (isFinal) {
                setFinalTranscript(prev => (prev ? prev + ' ' : '') + transcript);
            } else {
                setInterimTranscript(transcript);
            }
        },
        onError: (error) => {
            console.error('Voice recognition error:', error);
            let errorMessage = t('voice.error') || 'Ses tanıma hatası';
            if (error === 'network') {
                errorMessage = t('voice.networkError') || 'Ağ hatası. Lütfen internet bağlantınızı kontrol edin.';
            } else if (error === 'not-allowed') {
                errorMessage = t('voice.permissionError') || 'Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarını kontrol edin.';
            } else if (error === 'service-not-allowed') {
                errorMessage = t('voice.serviceNotAllowedError') || 'Ses tanıma hizmetine izin verilmedi. Lütfen tarayıcı ayarlarını kontrol edin.';
            } else if (error === 'bad-grammar') {
                errorMessage = t('voice.badGrammarError') || 'Ses tanıma dilbilgisi hatası. Lütfen tekrar deneyin.';
            } else if ((error as any)?.message === 'not_supported') {
                errorMessage = t('voice.error') || 'Ses tanıma desteklenmiyor. Lütfen farklı bir tarayıcı deneyin.';
            } else if ((error as any)?.message === 'secure_context_required') {
                errorMessage = t('voice.error') || 'Güvenli bağlantı gerekli. Lütfen HTTPS bağlantısı kullanın.';
            }
            addNotification(errorMessage, 'error');
        },
    });

    const handleOpenVoiceModal = () => {
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
                 <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
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