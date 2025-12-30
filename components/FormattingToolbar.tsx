
import React, { useCallback, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { useTranslations } from '../hooks/useTranslations';
import { useVoiceRecognitionUnified } from '../hooks/useVoiceRecognitionUnified';
import { useWhisperVoice } from '../hooks/useWhisperVoice';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceInputModal from './VoiceInputModal';
import { hasVoiceCommand, removeVoiceCommand } from '../utils/voiceCommandUtils';
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikeIcon, CodeIcon, ListIcon, ListOrderedIcon, BlockquoteIcon, UndoIcon, RedoIcon, ImageIcon, MicIcon, PaperclipIcon
} from './icons/Icons';

const TableIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
);

interface FormattingToolbarProps {
    editor: Editor | null;
    onImageUpload: () => void;
    addNotification?: (message: string, type: 'success' | 'error' | 'warning') => void;
    onVoiceSave?: () => void | Promise<void>;
    settings?: any; // Settings for Gemini API
}

const FONT_FAMILY_LIST = [
    { name: 'Default', value: '' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Calibri', value: 'Calibri' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS' },
    { name: 'Tahoma', value: 'Tahoma' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Nunito', value: 'Nunito' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Inter', value: 'Inter' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro' },
    { name: 'Merriweather', value: 'Merriweather' },
    { name: 'Lora', value: 'Lora' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Raleway', value: 'Raleway' },
    { name: 'Ubuntu', value: 'Ubuntu' },
    { name: 'Fira Sans', value: 'Fira Sans' },
    { name: 'PT Sans', value: 'PT Sans' },
    { name: 'Crimson Text', value: 'Crimson Text' },
];

const FONT_SIZE_LIST = [
    { name: 'Default', value: '' },
    { name: '10pt', value: '10pt' },
    { name: '12pt', value: '12pt' },
    { name: '14pt', value: '14pt' },
    { name: '16pt', value: '16pt' },
    { name: '18pt', value: '18pt' },
    { name: '20pt', value: '20pt' },
    { name: '24pt', value: '24pt' },
    { name: '28pt', value: '28pt' },
    { name: '32pt', value: '32pt' },
    { name: '36pt', value: '36pt' },
    { name: '40pt', value: '40pt' },
    { name: '48pt', value: '48pt' },
    { name: '50pt', value: '50pt' },
];

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ editor, onImageUpload, addNotification, onVoiceSave, settings }) => {
    const { t } = useTranslations();
    const { language } = useLanguage();
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [showModal, setShowModal] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    if (!editor) {
        return null;
    }

    // Check for environment API key instead of user settings
    const hasEnvGeminiKey = !!(import.meta.env.VITE_GEMINI_API_KEY);
    const isElectron = !!(window as any).electron;

    const debouncedSave = useCallback(async () => {
        // Clear any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounce save by 1 second
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await onVoiceSave?.();
                if (addNotification) {
                    addNotification(
                        language === 'tr'
                            ? 'Not sesli komutla kaydedildi!'
                            : 'Note saved with voice command!',
                        'success'
                    );
                }
            } catch (e: any) {
                if (addNotification) {
                    addNotification(
                        language === 'tr'
                            ? 'Not kaydedilemedi.'
                            : 'Failed to save note.',
                        'error'
                    );
                }
            }
        }, 1000);
    }, [onVoiceSave, addNotification, language]);

    const handleTranscript = useCallback(async (finalText: string) => {
        if (!editor || !finalText.trim()) return;

        const lang = language as 'tr' | 'en';
        const commandDetected = hasVoiceCommand(finalText, lang);

        if (commandDetected) {
            // Remove voice command from text
            const noteText = removeVoiceCommand(finalText, lang);

            if (noteText.trim()) {
                editor.chain().focus().insertContent(noteText).run();
            }

            // Use debounced save
            await debouncedSave();

            // Clear transcripts after save
            setFinalTranscript('');
            setInterimTranscript('');
            return;
        }

        // No command detected: append to transcript state (hook sends only new parts)
        // Text will be inserted when user clicks submit in modal
        setFinalTranscript(prev => (prev ? prev + ' ' : '') + finalText);
        setInterimTranscript('');
    }, [editor, debouncedSave, language]);

    const whisperVoice = useWhisperVoice({
        onResult: (transcript) => {
            handleTranscript(transcript);
        },
        onError: (error) => {
            console.error('Audio transcription error:', error);
            if (addNotification) {
                const errorMsg = error.message || error;
                addNotification(
                    language === 'tr'
                        ? `Ses tanıma hatası: ${errorMsg}`
                        : `Voice recognition error: ${errorMsg}`,
                    'error'
                );
            }
        },
        settings: settings,
        useGemini: hasEnvGeminiKey // Use Gemini 2.0 Flash if API key available
    });

    const webSpeechVoice = useVoiceRecognitionUnified({
        onResult: (transcript, isFinal) => {
            if (isFinal) {
                handleTranscript(transcript);
            } else {
                setInterimTranscript(transcript);
            }
        },
        lang: language as 'tr' | 'en',
        onError: (error) => {
            console.error('Voice recognition error:', error);
            // Show a notification to the user if available
            if (typeof addNotification === 'function') {
                // Provide more specific error messages with fallback suggestions
                let errorMessage = t('voice.error') || 'Ses tanıma hatası';
                let notificationType: 'success' | 'error' | 'warning' = 'error';

                if (error === 'network' || error === 'network_fallback') {
                    errorMessage = t('voice.networkError') || 'İnternet bağlantısı gerekli. Offline ses tanıma aktif.';
                    notificationType = 'warning';
                } else if (error === 'not-allowed') {
                    errorMessage = t('voice.permissionError') || 'Mikrofon izni gerekli. Tarayıcı ayarlarından mikrofon erişimini açın.';
                } else if (error === 'service-not-allowed' || error === 'service_fallback') {
                    errorMessage = t('voice.serviceNotAllowedError') || 'Ses tanıma servisi kullanılamıyor. Offline moda geçiliyor.';
                    notificationType = 'warning';
                } else if (error === 'bad-grammar') {
                    errorMessage = t('voice.badGrammarError') || 'Ses tanıma dilbilgisi hatası. Lütfen tekrar deneyin.';
                } else if (error === 'language-not-supported') {
                    errorMessage = t('voice.languageNotSupportedError') || 'Desteklenmeyen dil. Lütfen farklı bir dil seçin.';
                } else if (error.message === 'not_supported') {
                    errorMessage = t('voice.error') || 'Ses tanıma desteklenmiyor. Lütfen farklı bir tarayıcı deneyin.';
                } else if (error.message === 'secure_context_required') {
                    errorMessage = t('voice.error') || 'Güvenli bağlantı gerekli. Lütfen HTTPS bağlantısı kullanın.';
                }
                addNotification(errorMessage, notificationType);
            }
        },
    });

    // Select voice recognition based on environment
    // Web: Always use Web Speech API for better compatibility
    // Electron: Use Whisper if available, otherwise Web Speech API
    const voiceService = isElectron ? whisperVoice : webSpeechVoice;
    const { isRecording, start, stop, hasSupport } = voiceService;
    const isInitializing = isElectron ? (whisperVoice as any).isProcessing : (webSpeechVoice as any).isInitializing;

    const handleOpenModal = async () => {
        // Only start Whisper if in Electron and Gemini is not available
        if (!hasEnvGeminiKey && isElectron && (window as any).electron?.whisper) {
            try {
                const modelSize = localStorage.getItem('whisper-model-size') || 'tiny';
                console.log('[Voice] Starting Whisper service (Gemini not available), model:', modelSize);
                await (window as any).electron.whisper.start(modelSize);
            } catch (error) {
                console.error('[Voice] Failed to start Whisper:', error);
                if (addNotification) {
                    addNotification(
                        language === 'tr'
                            ? 'Whisper servisi başlatılamadı. Python yüklü mü?'
                            : 'Failed to start Whisper service. Is Python installed?',
                        'error'
                    );
                }
            }
        } else if (hasEnvGeminiKey) {
            console.log('[Voice] Using Gemini 2.0 Flash for transcription');
        } else {
            console.log('[Voice] Using Web Speech API for transcription');
        }

        setShowModal(true);
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
        // Manual insert from modal submit
        editor.chain().focus().insertContent(text).run();
        setFinalTranscript('');
        setInterimTranscript('');
    };

    const handleCloseModal = () => {
        if (isRecording) stop();
        setShowModal(false);
        setFinalTranscript('');
        setInterimTranscript('');

    };

    const ToolbarButton: React.FC<{ onClick?: () => void; title: string; isActive?: boolean; children: React.ReactNode, disabled?: boolean }> = ({ onClick, title, isActive = false, children, disabled = false }) => (
        <button
            onClick={onClick}
            title={title}
            aria-label={title}
            disabled={disabled}
            className={`p-1.5 rounded transition-colors ${isActive ? 'bg-primary text-primary-text' : 'hover:bg-border'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );

    const currentFont = editor.getAttributes('textStyle').fontFamily || '';
    const currentFontSize = editor.getAttributes('textStyle').fontSize || '';

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
        } else {
            // Only reset fontSize to default, preserve other textStyle attributes
            editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
        }
    };

    const attachFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.json,.md,.html,.css,.js,.ts,.tsx,.jsx,.xml,.csv';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            // Dosya boyut kontrolü (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                if (typeof addNotification === 'function') {
                    addNotification('Dosya boyutu 10MB\'dan küçük olmalıdır.', 'warning');
                } else {
                    alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
                }
                return;
            }

            // Dosya içeriğini oku
            const reader = new FileReader();
            reader.onload = () => {
                const content = reader.result as string;
                const fileName = file.name;

                // Dosya adı ve içeriğini ekle
                const html = `<h3>📄 ${fileName}</h3><pre><code>${content}</code></pre><p></p>`;
                editor.chain().focus().insertContent(html).run();
            };
            reader.onerror = () => {
                if (typeof addNotification === 'function') {
                    addNotification('Dosya okunamadı. Sadece metin dosyaları desteklenmektedir.', 'error');
                } else {
                    alert('Dosya okunamadı. Sadece metin dosyaları desteklenmektedir.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <>
            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/5 backdrop-blur-md flex-wrap">
                <select
                    value={currentFont}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                            (editor.chain().focus() as any).setFontFamily(value).run();
                        } else {
                            (editor.chain().focus() as any).unsetFontFamily().run();
                        }
                    }}
                    className="p-1 text-sm rounded bg-transparent hover:bg-border"
                >
                    {FONT_FAMILY_LIST.map(font => (
                        <option key={font.name} value={font.value}>{font.name}</option>
                    ))}
                </select>
                <select
                    value={currentFontSize}
                    onChange={handleFontSizeChange}
                    className="p-1 text-sm rounded bg-transparent hover:bg-border"
                >
                    {FONT_SIZE_LIST.map(size => (
                        <option key={size.name} value={size.value}>{size.name}</option>
                    ))}
                </select>
                <div className="mx-2 h-6 border-l border-border"></div>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} title={t('toolbar.bold')} isActive={editor.isActive('bold')}><BoldIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} title={t('toolbar.italic')} isActive={editor.isActive('italic')}><ItalicIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} title={t('toolbar.underline')} isActive={editor.isActive('underline')}><UnderlineIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} title={t('toolbar.strike')} isActive={editor.isActive('strike')}><StrikeIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} title={t('toolbar.code')} isActive={editor.isActive('code')}><CodeIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} title={t('toolbar.bulletList')} isActive={editor.isActive('bulletList')}><ListIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} title={t('toolbar.orderedList')} isActive={editor.isActive('orderedList')}><ListOrderedIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} title={t('toolbar.blockquote')} isActive={editor.isActive('blockquote')}><BlockquoteIcon /></ToolbarButton>
                <ToolbarButton onClick={onImageUpload} title={t('toolbar.insertImage')}><ImageIcon /></ToolbarButton>
                <ToolbarButton onClick={attachFile} title={t('toolbar.attachFile')}><PaperclipIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title={t('toolbar.insertTable')} disabled={editor.isActive('table')}><TableIcon /></ToolbarButton>
                {hasSupport && (
                    <ToolbarButton
                        onClick={handleOpenModal}
                        title={t('voice.start')}
                    >
                        <MicIcon />
                    </ToolbarButton>
                )}
                <div className="mx-2 h-6 border-l border-border"></div>
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title={t('toolbar.undo')}><UndoIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title={t('toolbar.redo')}><RedoIcon /></ToolbarButton>
            </div>
            {showModal && (
                <VoiceInputModal
                    interimTranscript={interimTranscript}
                    finalTranscript={finalTranscript}
                    isRecording={isRecording}
                    isInitializing={isInitializing}
                    onToggleRecording={handleToggleRecording}
                    onSubmit={handleSubmitVoice}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default FormattingToolbar;
