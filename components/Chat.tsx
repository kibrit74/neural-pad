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
            // Get editor context
            let ctx = getEditorContext ? await getEditorContext() : { text: '', images: [] };

            // LOCAL DATA EXTRACTION - Check if user wants to find specific data
            const lowerInput = input.toLowerCase();

            // FIRST: Check for custom pattern indicators - these should NOT match standard types
            const customPatternIndicators = [
                'dosya', 'esas', 'mahkeme', 'karar', 'dava', 'hasta',
                'dosya no', 'esas no', 'karar no', 'dava no', 'hasta adı',
                'müvekkil', 'protokol', 'sicil', 'patent', 'marka',
                'özel kalıp', 'özel tarama', 'dosya numarası', 'dosya numaraları'
            ];
            const hasCustomIndicator = customPatternIndicators.some(kw => lowerInput.includes(kw));

            const dataKeywords = [
                { keywords: ['mail', 'email', 'e-posta', 'eposta'], type: 'emails', label: 'E-posta adresleri' },
                // NOTE: 'numara' removed to prevent false matches like "dosya numaraları" -> phones
                { keywords: ['telefon', 'tel', 'gsm', 'cep', 'telefon numara', 'telefon no'], type: 'phones', label: 'Telefon numaraları' },
                { keywords: ['tarih', 'duruşma', 'toplantı'], type: 'dates', label: 'Tarihler' },
                { keywords: ['adres', 'konum', 'mahalle', 'sokak'], type: 'addresses', label: 'Adresler' },
                { keywords: ['iban', 'hesap'], type: 'ibans', label: 'IBAN\'lar' },
                { keywords: ['tc', 'kimlik', 'tckn'], type: 'tckn', label: 'TC Kimlik numaraları' },
                { keywords: ['fiyat', 'tutar', 'ücret', 'tl'], type: 'prices', label: 'Tutarlar' }
            ];
            const actionKeywords = ['bul', 'listele', 'göster', 'çıkar', 'ara', 'getir'];
            const hasActionKeyword = actionKeywords.some(kw => lowerInput.includes(kw));

            // SMART CALENDAR: "X tarihini takvime ekle" type requests
            const wantsCalendar = lowerInput.includes('takvime ekle') || lowerInput.includes('takvime kaydet');
            if (wantsCalendar && ctx.text) {
                try {
                    // Use AI to find the specific date the user is asking about
                    const { GoogleGenAI, Type } = await import('@google/genai');
                    const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });

                    const calendarPrompt = `
                    Kullanıcı şunu istiyor: "${input}"
                    
                    Belgeden bu isteğe uygun tarihi ve açıklamasını bul.
                    
                    Belge:
                    """
                    ${ctx.text.slice(0, 8000)}
                    """
                    
                    JSON olarak yanıtla:
                    {
                      "found": true/false,
                      "date": "GG.AA.YYYY formatında tarih",
                      "title": "Takvim etkinliği başlığı (kısa ve açıklayıcı)",
                      "details": "Ek detaylar (bağlam)"
                    }
                    
                    Eğer tarih bulunamazsa found: false olsun.
                    `;

                    const result = await ai.models.generateContent({
                        model: settings.model || 'gemini-2.0-flash',
                        contents: { role: 'user', parts: [{ text: calendarPrompt }] },
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    found: { type: Type.BOOLEAN },
                                    date: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    details: { type: Type.STRING }
                                }
                            },
                            temperature: 0.1
                        }
                    });

                    const calendarData = JSON.parse(result.text || '{}');

                    if (calendarData.found && calendarData.date) {
                        // Convert DD.MM.YYYY to YYYYMMDD
                        const dateParts = calendarData.date.split(/[.\/-]/);
                        if (dateParts.length === 3) {
                            const [day, month, year] = dateParts;
                            const isoDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
                            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${isoDate}/${isoDate}&details=${encodeURIComponent(calendarData.details || '')}`;

                            // Open calendar
                            const { openExternalUrl } = await import('../utils/openExternal');
                            await openExternalUrl(calendarUrl);

                            const responseText = `✅ **Takvime eklendi!**\n\n📅 **Tarih:** ${calendarData.date}\n📝 **Başlık:** ${calendarData.title}\n\nGoogle Takvim açıldı, etkinliği kaydetmeyi unutmayın.`;
                            const modelResponse: ChatMessage = { role: 'model', content: responseText };
                            setSessions(prev => prev.map(s =>
                                s.id === activeSessionId
                                    ? { ...s, messages: [...s.messages, modelResponse] }
                                    : s
                            ));
                        }
                    } else {
                        const responseText = `❌ Belgede "${input.replace(/takvime ekle|takvime kaydet/gi, '').trim()}" ile ilgili bir tarih bulunamadı.`;
                        const modelResponse: ChatMessage = { role: 'model', content: responseText };
                        setSessions(prev => prev.map(s =>
                            s.id === activeSessionId
                                ? { ...s, messages: [...s.messages, modelResponse] }
                                : s
                        ));
                    }
                    setIsLoading(false);
                    return;
                } catch (error: any) {
                    console.error('[Chat] Smart calendar error:', error);
                    addNotification('Takvim işlemi başarısız: ' + error.message, 'error');
                }
            }

            // SMART EMAIL: "X'e email gönder" type requests
            const wantsEmail = lowerInput.includes('mail gönder') || lowerInput.includes('e-posta gönder') || lowerInput.includes('mail at');
            if (wantsEmail && ctx.text) {
                try {
                    const { GoogleGenAI, Type } = await import('@google/genai');
                    const ai = new GoogleGenAI({ apiKey: settings.geminiApiKey });

                    const emailPrompt = `
                    Kullanıcı şunu istiyor: "${input}"
                    
                    Belgeden bu isteğe uygun email adresini bul.
                    
                    Belge:
                    """
                    ${ctx.text.slice(0, 8000)}
                    """
                    
                    JSON olarak yanıtla:
                    {
                      "found": true/false,
                      "email": "email adresi",
                      "recipient": "alıcı ismi (varsa)",
                      "subject": "önerilen konu başlığı"
                    }
                    `;

                    const result = await ai.models.generateContent({
                        model: settings.model || 'gemini-2.0-flash',
                        contents: { role: 'user', parts: [{ text: emailPrompt }] },
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    found: { type: Type.BOOLEAN },
                                    email: { type: Type.STRING },
                                    recipient: { type: Type.STRING },
                                    subject: { type: Type.STRING }
                                }
                            },
                            temperature: 0.1
                        }
                    });

                    const emailData = JSON.parse(result.text || '{}');

                    if (emailData.found && emailData.email) {
                        const mailtoUrl = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject || '')}`;
                        const { openExternalUrl } = await import('../utils/openExternal');
                        await openExternalUrl(mailtoUrl);

                        const responseText = `✅ **Email hazır!**\n\n📧 **Alıcı:** ${emailData.recipient || emailData.email}\n📬 **Email:** ${emailData.email}\n📝 **Konu:** ${emailData.subject || '(boş)'}\n\nMail uygulamanız açıldı.`;
                        const modelResponse: ChatMessage = { role: 'model', content: responseText };
                        setSessions(prev => prev.map(s =>
                            s.id === activeSessionId ? { ...s, messages: [...s.messages, modelResponse] } : s
                        ));
                    } else {
                        const responseText = `❌ Belgede ilgili email adresi bulunamadı.`;
                        const modelResponse: ChatMessage = { role: 'model', content: responseText };
                        setSessions(prev => prev.map(s =>
                            s.id === activeSessionId ? { ...s, messages: [...s.messages, modelResponse] } : s
                        ));
                    }
                    setIsLoading(false);
                    return;
                } catch (error: any) {
                    console.error('[Chat] Smart email error:', error);
                }
            }

            // SMART EXPORT: "excel olarak indir" or "csv indir" type requests
            const wantsExport = lowerInput.includes('excel') || lowerInput.includes('csv') || lowerInput.includes('indir');
            const wantsExportAction = wantsExport && (lowerInput.includes('indir') || lowerInput.includes('aktar') || lowerInput.includes('kaydet'));
            if (wantsExportAction && ctx.text) {
                try {
                    const { extractDataWithAI } = await import('../utils/aiDataExtractor');
                    const allData = await extractDataWithAI(ctx.text, settings);

                    // Collect all data
                    const allItems: { category: string; value: string; context: string }[] = [];
                    const categories = ['phones', 'emails', 'dates', 'addresses', 'ibans', 'tckn', 'prices', 'urls', 'custom'];
                    const categoryLabels: Record<string, string> = {
                        phones: 'Telefon', emails: 'E-posta', dates: 'Tarih', addresses: 'Adres',
                        ibans: 'IBAN', tckn: 'TCKN', prices: 'Tutar', urls: 'URL', custom: 'Özel'
                    };

                    for (const cat of categories) {
                        const items = (allData as any)[cat] || [];
                        items.forEach((item: any) => {
                            allItems.push({
                                category: categoryLabels[cat] || cat,
                                value: item.value,
                                context: item.context || ''
                            });
                        });
                    }

                    if (allItems.length === 0) {
                        const responseText = `❌ Belgede dışa aktarılacak veri bulunamadı.`;
                        const modelResponse: ChatMessage = { role: 'model', content: responseText };
                        setSessions(prev => prev.map(s =>
                            s.id === activeSessionId ? { ...s, messages: [...s.messages, modelResponse] } : s
                        ));
                        setIsLoading(false);
                        return;
                    }

                    // Generate CSV
                    const csvContent = 'Kategori,Değer,Bağlam\n' + allItems.map(item =>
                        `"${item.category}","${item.value.replace(/"/g, '""')}","${item.context.replace(/"/g, '""')}"`
                    ).join('\n');

                    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `veriler_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    const responseText = `✅ **Veriler indirildi!**\n\n📊 **Toplam:** ${allItems.length} veri\n📁 **Dosya:** veriler_${new Date().toLocaleDateString('tr-TR')}.csv\n\nExcel'de açmak için dosyayı çift tıklayın.`;
                    const modelResponse: ChatMessage = { role: 'model', content: responseText };
                    setSessions(prev => prev.map(s =>
                        s.id === activeSessionId ? { ...s, messages: [...s.messages, modelResponse] } : s
                    ));
                    setIsLoading(false);
                    return;
                } catch (error: any) {
                    console.error('[Chat] Smart export error:', error);
                }
            }

            if (hasActionKeyword && ctx.text) {
                // If custom indicator found, extract custom patterns
                if (hasCustomIndicator) {
                    try {
                        const { extractDataWithAI } = await import('../utils/aiDataExtractor');
                        const allData = await extractDataWithAI(ctx.text, settings);
                        const items = (allData as any).custom || [];

                        let responseText = '';
                        if (items.length === 0) {
                            responseText = `Bu belgede özel kalıp verileri bulunamadı. Ayarlar > Özel Kalıplar bölümünden kalıp tanımladığınızdan emin olun.`;
                        } else {
                            const itemsHtml = items.map((item: any) => {
                                const val = item.value;
                                const encodedVal = encodeURIComponent(val);
                                return `• ${val} [📋](#action-copy=${encodedVal})`;
                            }).join('\n');
                            responseText = `**Özel Kalıp Verileri (${items.length}):**\n${itemsHtml}`;
                        }

                        const modelResponse: ChatMessage = { role: 'model', content: responseText };
                        setSessions(prev => prev.map(s =>
                            s.id === activeSessionId
                                ? { ...s, messages: [...s.messages, modelResponse] }
                                : s
                        ));
                        setIsLoading(false);
                        return;
                    } catch (error: any) {
                        console.error('[Chat] Custom pattern extraction error:', error);
                    }
                }

                // Check which data type is requested
                for (const { keywords, type, label } of dataKeywords) {
                    if (keywords.some(kw => lowerInput.includes(kw))) {
                        try {
                            // Use AI extraction like Data Hunter's Akıllı Tarama
                            const { extractDataWithAI } = await import('../utils/aiDataExtractor');
                            const allData = await extractDataWithAI(ctx.text, settings);
                            const items = (allData as any)[type] || [];


                            let responseText = '';
                            if (items.length === 0) {
                                responseText = `Bu belgede ${label.toLowerCase()} bulunamadı.`;
                            } else {
                                // Build response with action buttons
                                const itemsHtml = items.map((item: any) => {
                                    const val = item.value;
                                    const ctx = item.context || '';
                                    const encodedVal = encodeURIComponent(val);
                                    const encodedCtx = encodeURIComponent(ctx);

                                    let actions = '';
                                    if (type === 'emails') {
                                        actions = `[📧](mailto:${val}) [📋](#action-copy=${encodedVal})`;
                                    } else if (type === 'phones') {
                                        const cleanPhone = val.replace(/\s/g, '');
                                        actions = `[📞](tel:${cleanPhone}) [📋](#action-copy=${encodedVal})`;
                                    } else if (type === 'addresses') {
                                        actions = `[🗺️](https://maps.google.com/?q=${encodedVal}) [📋](#action-copy=${encodedVal})`;
                                    } else if (type === 'dates') {
                                        // Add calendar action for dates with context
                                        actions = `[📅](#action-calendar=${encodedVal}__${encodedCtx}) [📋](#action-copy=${encodedVal})`;
                                    } else {
                                        actions = `[📋](#action-copy=${encodedVal})`;
                                    }

                                    // Show context for dates and other items
                                    if (type === 'dates' && ctx) {
                                        const shortCtx = ctx.length > 60 ? ctx.substring(0, 60) + '...' : ctx;
                                        return `• **${val}** ${actions}\n  _${shortCtx}_`;
                                    }
                                    return `• ${val} ${actions}`;
                                }).join('\n');

                                responseText = `**${label} (${items.length}):**\n${itemsHtml}`;
                            }

                            const modelResponse: ChatMessage = { role: 'model', content: responseText };
                            setSessions(prev => prev.map(s =>
                                s.id === activeSessionId
                                    ? { ...s, messages: [...s.messages, modelResponse] }
                                    : s
                            ));
                        } catch (error: any) {
                            console.error('[Chat] AI Extraction error:', error);
                            const errorResponse: ChatMessage = { role: 'model', content: `Veri çıkarma hatası: ${error.message}` };
                            setSessions(prev => prev.map(s =>
                                s.id === activeSessionId
                                    ? { ...s, messages: [...s.messages, errorResponse] }
                                    : s
                            ));
                        }
                        setIsLoading(false);
                        return; // Exit early - data extraction handled
                    }
                }
            }

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

            // Normal Gemini call for non-data-extraction queries
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
    }, [input, isLoading, addNotification, t, useWebSearch, settings, activeSessionId, sessions, language, getEditorContext, activeSession.messages, pastedImages]);

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

    // Voice recognition hook - using Web Speech API for web, Electron IPC for electron
    const { isRecording, isInitializing, start, stop, hasSupport } = useVoiceRecognitionUnified({
        onResult: (transcript, isFinal) => {
            if (isFinal && transcript.trim()) {
                // Append new final transcript (hook now sends only new parts)
                setFinalTranscript(prev => (prev ? prev + ' ' : '') + transcript);
                setInterimTranscript(''); // Clear interim when final arrives
            } else if (!isFinal) {
                setInterimTranscript(transcript);
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
        lang: language as 'tr' | 'en'
    });

    const handleOpenVoiceModal = () => {
        console.log('[Chat Voice] Using Web Speech API for transcription');
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
                <div className={`flex-grow p-3 rounded-lg min-w-0 group relative ${isUser ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/5'}`}>
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
                        <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ href, children }) => {
                                    // Debug logging
                                    console.log('[Chat Markdown] Link href:', href, 'children:', children);

                                    if (!href) {
                                        return <span>{children}</span>;
                                    }

                                    if (href.startsWith('#action-copy=')) {
                                        const value = decodeURIComponent(href.replace('#action-copy=', ''));
                                        return (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(value);
                                                    addNotification('Kopyalandı!', 'success');
                                                }}
                                                className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors cursor-pointer"
                                                title="Kopyala"
                                            >
                                                {children}
                                            </button>
                                        );
                                    }
                                    if (href?.startsWith('mailto:') || href?.startsWith('tel:')) {
                                        return (
                                            <a
                                                href={href}
                                                className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
                                                title={href.startsWith('mailto:') ? 'E-posta Gönder' : 'Ara'}
                                            >
                                                {children}
                                            </a>
                                        );
                                    }
                                    if (href?.includes('maps.google.com')) {
                                        return (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
                                                title="Haritada Göster"
                                            >
                                                {children}
                                            </a>
                                        );
                                    }
                                    if (href?.startsWith('#action-calendar=')) {
                                        // Parse #action-calendar=DATE__CONTEXT format
                                        const data = href.replace('#action-calendar=', '');
                                        const parts = data.split('__');
                                        const dateStr = decodeURIComponent(parts[0] || '');
                                        const context = decodeURIComponent(parts[1] || '');

                                        const handleCalendar = async () => {
                                            // Convert DD.MM.YYYY to YYYYMMDD
                                            const dateParts = dateStr.split(/[.\/-]/);
                                            if (dateParts.length === 3) {
                                                const [day, month, year] = dateParts;
                                                const isoDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;

                                                // Clean context for event title
                                                const cleanContext = context.replace(/^\.{3}|\.{3}$/g, '').trim();
                                                const eventTitle = cleanContext || `Etkinlik - ${dateStr}`;
                                                const eventDetails = `📅 Tarih: ${dateStr}\n\n${context}`;

                                                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${isoDate}/${isoDate}&details=${encodeURIComponent(eventDetails)}`;

                                                // Open calendar
                                                const { openExternalUrl } = await import('../utils/openExternal');
                                                openExternalUrl(calendarUrl);
                                                addNotification('Takvim açıldı!', 'success');
                                            }
                                        };

                                        return (
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    await handleCalendar();
                                                }}
                                                className="inline-flex items-center justify-center w-6 h-6 ml-1 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded transition-colors cursor-pointer"
                                                title="Takvime Ekle"
                                            >
                                                {children}
                                            </button>
                                        );
                                    }
                                    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>;
                                }
                            }}
                        >
                            {message.content}
                        </Markdown>
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
        <div className="flex flex-col h-full w-96 max-w-md flex-shrink-0 bg-background/80 backdrop-blur-2xl border-l border-border/20 text-text-primary">
            <header className="p-4 border-b border-border/10 flex items-center justify-between flex-shrink-0 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <SparkleIcon className="text-primary" />
                    <h2 className="text-lg font-bold">{t('chat.title')}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-border">
                    <CloseIcon />
                </button>
            </header>

            {/* Tabs */}
            <div className="px-2 py-2 border-b border-border/10 flex items-center gap-2 overflow-x-auto bg-black/5">
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
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                            <BotIcon />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Merhaba! Ben AI Asistanınız 👋</h3>
                        <p className="text-sm text-text-secondary mb-4 max-w-md">
                            Notlarınızla ilgili sorular sorabilir veya aşağıdaki komutları kullanabilirsiniz:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs max-w-md">
                            <div className="bg-background border border-border rounded-lg p-2 text-left hover:border-primary/50 transition-colors">
                                <span className="text-lg">📅</span>
                                <p className="font-medium text-text-primary">"Tarihleri bul"</p>
                                <p className="text-text-secondary">Takvime ekle</p>
                            </div>
                            <div className="bg-background border border-border rounded-lg p-2 text-left hover:border-primary/50 transition-colors">
                                <span className="text-lg">📞</span>
                                <p className="font-medium text-text-primary">"Telefonları listele"</p>
                                <p className="text-text-secondary">Hızlı arama</p>
                            </div>
                            <div className="bg-background border border-border rounded-lg p-2 text-left hover:border-primary/50 transition-colors">
                                <span className="text-lg">📧</span>
                                <p className="font-medium text-text-primary">"E-postaları bul"</p>
                                <p className="text-text-secondary">Mail gönder</p>
                            </div>
                            <div className="bg-background border border-border rounded-lg p-2 text-left hover:border-primary/50 transition-colors">
                                <span className="text-lg">📍</span>
                                <p className="font-medium text-text-primary">"Adresleri göster"</p>
                                <p className="text-text-secondary">Haritada aç</p>
                            </div>
                            <div className="bg-background border border-border rounded-lg p-2 text-left hover:border-primary/50 transition-colors col-span-2">
                                <span className="text-lg">📊</span>
                                <p className="font-medium text-text-primary">"Tüm verileri Excel'e aktar"</p>
                                <p className="text-text-secondary">Tek tıkla indirme</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-secondary mt-4 italic">
                            💡 Web araması açıkken güncel bilgilere de erişebilirsiniz
                        </p>
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

            <footer className="p-4 border-t border-border/10 flex-shrink-0 bg-background/50 backdrop-blur-lg">
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
                        onChange={(e) => {
                            setInput(e.target.value);
                            // Auto-resize textarea
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyPress={handleKeyPress}
                        onPaste={handlePaste}
                        placeholder={t('chat.placeholder')}
                        className="w-full p-2 pr-20 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto"
                        style={{ minHeight: '40px', maxHeight: '120px' }}
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