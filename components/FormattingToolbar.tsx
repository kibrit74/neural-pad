
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { useTranslations } from '../hooks/useTranslations';
import TurndownService from 'turndown';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import VoiceInputModal from './VoiceInputModal';
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikeIcon, CodeIcon, ListIcon, ListOrderedIcon, BlockquoteIcon, UndoIcon, RedoIcon, ImageIcon, MicIcon, StopIcon, PaperclipIcon
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
}

const FONT_FAMILY_LIST = [
    { name: 'Default', value: '' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Merriweather', value: 'Merriweather' },
];

const FONT_SIZE_LIST = [
    { name: 'Default', value: '' },
    { name: '14px', value: '14px' },
    { name: '16px', value: '16px' },
];

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ editor, onImageUpload }) => {
    const { t } = useTranslations();
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [showModal, setShowModal] = useState(false);

    if (!editor) {
        return null;
    }

    const { isRecording, start, stop } = useVoiceRecognition({
        onResult: (transcript, isFinal) => {
            if (isFinal) {
                setFinalTranscript(prev => prev + transcript);
                setInterimTranscript('');
            } else {
                setInterimTranscript(transcript);
            }
        },
        onError: (error) => {
            console.error('Voice recognition error:', error);
        },
    });

    const handleOpenModal = () => {
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
            disabled={disabled}
            className={`p-2 rounded transition-colors ${isActive ? 'bg-primary text-primary-text' : 'hover:bg-border'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
            editor.chain().focus().unsetMark('textStyle').run();
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
                alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
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
                alert('Dosya okunamadı. Sadece metin dosyaları desteklenmektedir.');
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <>
            <div className="flex items-center gap-1 p-2 border-b border-border-strong bg-background-secondary flex-wrap">
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
                    className="p-1.5 rounded bg-transparent hover:bg-border"
                >
                    {FONT_FAMILY_LIST.map(font => (
                        <option key={font.name} value={font.value}>{font.name}</option>
                    ))}
                </select>
                <select
                    value={currentFontSize}
                    onChange={handleFontSizeChange}
                    className="p-1.5 rounded bg-transparent hover:bg-border"
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
                <ToolbarButton onClick={handleOpenModal} title={t('voice.start')}>
                    <MicIcon />
                </ToolbarButton>
                <div className="mx-2 h-6 border-l border-border"></div>
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title={t('toolbar.undo')}><UndoIcon /></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title={t('toolbar.redo')}><RedoIcon /></ToolbarButton>
            </div>
            {showModal && (
                <VoiceInputModal 
                    interimTranscript={interimTranscript}
                    finalTranscript={finalTranscript}
                    isRecording={isRecording}
                    onToggleRecording={handleToggleRecording}
                    onSubmit={handleSubmitVoice}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default FormattingToolbar;
