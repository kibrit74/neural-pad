
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useTranslations } from '../hooks/useTranslations';
import TurndownService from 'turndown';
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
    { name: 'Source Code Pro', value: 'Source Code Pro' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Slabo 27px', value: 'Slabo 27px' },
    { name: 'Raleway', value: 'Raleway' },
    { name: 'PT Sans', value: 'PT Sans' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Ubuntu', value: 'Ubuntu' },
    { name: 'Lora', value: 'Lora' },
    { name: 'Nunito', value: 'Nunito' },
    { name: 'Arvo', value: 'Arvo' },
];

const FONT_SIZE_LIST = [
    { name: 'Default', value: '' },
    { name: '12px', value: '12px' },
    { name: '14px', value: '14px' },
    { name: '16px', value: '16px' },
    { name: '18px', value: '18px' },
    { name: '24px', value: '24px' },
    { name: '30px', value: '30px' },
    { name: '36px', value: '36px' },
];

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ editor, onImageUpload }) => {
    const { t } = useTranslations();
    if (!editor) {
        return null;
    }

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

    // Voice input
    const recognitionRef = useRef<any>(null);
    const [recording, setRecording] = useState(false);
    const [canRecord, setCanRecord] = useState(false);

    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const isAvailable = !!SR;
        setCanRecord(isAvailable);
        
        // Log availability for debugging
        const isElectron = (window as any)?.electron?.isElectron;
        console.log('Speech Recognition:', {
            available: isAvailable,
            isElectron,
            SpeechRecognition: !!(window as any).SpeechRecognition,
            webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition
        });
        
        return () => {
            try { recognitionRef.current?.stop?.(); } catch {}
        };
    }, []);

    const startRecording = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
            console.error('Speech Recognition API not available');
            return;
        }
        
        console.log('Starting speech recognition...');
        const rec = new SR();
        rec.lang = document.documentElement.lang || navigator.language || 'en-US';
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (e: any) => {
            let finalText = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const res = e.results[i];
                if (res.isFinal) finalText += res[0].transcript + ' ';
            }
            if (finalText) {
                console.log('Recognized text:', finalText);
                editor.chain().focus().insertContent(finalText).run();
            }
        };
        
        rec.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error, event);
            setRecording(false);
        };
        
        rec.onend = () => {
            console.log('Speech recognition ended');
            setRecording(false);
        };
        
        rec.onstart = () => {
            console.log('Speech recognition started successfully');
        };
        
        try {
            rec.start();
            recognitionRef.current = rec;
            setRecording(true);
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            setRecording(false);
        }
    };

    const stopRecording = () => {
        try { recognitionRef.current?.stop?.(); } catch {}
        setRecording(false);
    };
    
    const currentFont = editor.getAttributes('textStyle').fontFamily || '';
    const currentFontSize = editor.getAttributes('textStyle').fontSize || '';

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const { fontSize, ...restAttributes } = editor.getAttributes('textStyle');

        if (value) {
            editor.chain().focus().setMark('textStyle', { ...restAttributes, fontSize: value }).run();
        } else {
            if (Object.keys(restAttributes).length > 0) {
                editor.chain().focus().setMark('textStyle', restAttributes).run();
            } else {
                editor.chain().focus().unsetMark('textStyle').run();
            }
        }
    };

    const copyAsHTML = async () => {
        const html = editor.getHTML();
        await navigator.clipboard.writeText(html);
    };

    const copyAsMarkdown = async () => {
        const td = new TurndownService();
        const md = td.turndown(editor.getHTML());
        await navigator.clipboard.writeText(md);
    };

    const attachFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = String(reader.result);
                if (file.type.startsWith('image/')) {
                    (editor.chain().focus() as any).insertContent({ type: 'image', attrs: { src: dataUrl } }).run();
                } else {
                    const name = file.name;
                    (editor.chain().focus() as any).insertContent(`<a href="${dataUrl}" download="${name}">${name}</a>`).run();
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    return (
        <div className="flex items-center gap-1 p-2 border-b border-border-strong bg-background-secondary flex-wrap">
            <select
                value={currentFont}
                onChange={(e) => {
                    const value = e.target.value;
                    if(value) {
                        // FIX: Cast to any to bypass TypeScript error for missing command.
                        (editor.chain().focus() as any).setFontFamily(value).run();
                    } else {
                        // FIX: Cast to any to bypass TypeScript error for missing command.
                        (editor.chain().focus() as any).unsetFontFamily().run();
                    }
                }}
                className="p-1.5 rounded bg-transparent hover:bg-border transition-colors focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                style={{ fontFamily: currentFont || 'inherit' }}
                aria-label="Font Family"
            >
                {FONT_FAMILY_LIST.map(font => (
                    <option key={font.name} value={font.value} style={{ fontFamily: font.value || 'inherit' }}>
                        {font.name}
                    </option>
                ))}
            </select>
            <select
                value={currentFontSize}
                onChange={handleFontSizeChange}
                className="p-1.5 rounded bg-transparent hover:bg-border transition-colors focus:outline-none focus:ring-1 focus:ring-primary text-text-primary"
                aria-label="Font Size"
            >
                {FONT_SIZE_LIST.map(size => (
                    <option key={size.name} value={size.value}>
                        {size.name}
                    </option>
                ))}
            </select>

            <div className="mx-2 h-6 border-l border-border"></div>
            {/* FIX: Cast to any to bypass TypeScript error for missing commands. */}
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleBold().run()} title={t('toolbar.bold')} isActive={editor.isActive('bold')} disabled={!(editor.can() as any).toggleBold()}>
                <BoldIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleItalic().run()} title={t('toolbar.italic')} isActive={editor.isActive('italic')} disabled={!(editor.can() as any).toggleItalic()}>
                <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleUnderline().run()} title={t('toolbar.underline')} isActive={editor.isActive('underline')} disabled={!(editor.can() as any).toggleUnderline()}>
                <UnderlineIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleStrike().run()} title={t('toolbar.strike')} isActive={editor.isActive('strike')} disabled={!(editor.can() as any).toggleStrike()}>
                <StrikeIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleCode().run()} title={t('toolbar.code')} isActive={editor.isActive('code')} disabled={!(editor.can() as any).toggleCode()}>
                <CodeIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleBulletList().run()} title={t('toolbar.bulletList')} isActive={editor.isActive('bulletList')} disabled={!(editor.can() as any).toggleBulletList()}>
                <ListIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()} title={t('toolbar.orderedList')} isActive={editor.isActive('orderedList')} disabled={!(editor.can() as any).toggleOrderedList()}>
                <ListOrderedIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleBlockquote().run()} title={t('toolbar.blockquote')} isActive={editor.isActive('blockquote')} disabled={!(editor.can() as any).toggleBlockquote()}>
                <BlockquoteIcon />
            </ToolbarButton>
            <ToolbarButton onClick={onImageUpload} title={t('toolbar.insertImage')}>
                <ImageIcon />
            </ToolbarButton>
            <ToolbarButton onClick={attachFile} title={t('toolbar.attachFile')}>
                <PaperclipIcon />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                title={t('toolbar.insertTable')}
            >
                <TableIcon />
            </ToolbarButton>
            <ToolbarButton
                onClick={recording ? stopRecording : startRecording}
                title={recording ? t('voice.stop') : t('voice.start')}
                disabled={!canRecord}
                isActive={recording}
            >
                {recording ? <StopIcon /> : <MicIcon />}
            </ToolbarButton>
             <div className="mx-2 h-6 border-l border-border"></div>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).undo().run()} title={t('toolbar.undo')} disabled={!(editor.can() as any).undo()}>
                <UndoIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).redo().run()} title={t('toolbar.redo')} disabled={!(editor.can() as any).redo()}>
                <RedoIcon />
            </ToolbarButton>
        </div>
    );
};

export default FormattingToolbar;
