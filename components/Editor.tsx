import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor as TiptapEditor, BubbleMenu } from '@tiptap/react';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Code from '@tiptap/extension-code';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { CustomTable } from '../utils/tiptapCustomTable';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

import { useTranslations } from '../hooks/useTranslations';
import FormattingToolbar from './FormattingToolbar';
import { FontSize } from '../utils/tiptapExtensions';
import { CustomImage } from '../utils/tiptapCustomImage';

interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    editorRef: React.MutableRefObject<TiptapEditor | null>;
    onAiImageMenu: (target: HTMLElement, src: string) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
    onVoiceSave?: () => void | Promise<void>;
    settings?: any; // Settings for voice recognition
}

const Editor: React.FC<EditorProps> = ({ content, onChange, editorRef, onAiImageMenu, addNotification, onVoiceSave, settings }) => {
    const { t } = useTranslations();
    const editor = useEditor({
        extensions: [
            // --- Replaces StarterKit ---
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            Strike,
            Underline,
            Blockquote,
            // Inline code mark for toolbar's toggleCode command
            Code,
            CodeBlock,
            HardBreak,
            Heading.configure({ levels: [1, 2, 3] }),
            HorizontalRule,
            ListItem,
            BulletList,
            OrderedList,
            History,
            Dropcursor,
            Gapcursor,
            BubbleMenuExtension.configure({
                pluginKey: 'bubbleMenu',
            }),
            // --- End of StarterKit replacements ---

            Placeholder.configure({
                placeholder: t('editor.placeholder'),
            }),
            // Our custom image extension is now guaranteed to handle image events
            (CustomImage as any).configure({
                inline: false,
                onAiMenuClick: onAiImageMenu,
            }),
            TextStyle,
            FontFamily,
            FontSize,
            CustomTable.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (editor) {
        editorRef.current = editor;
    }

    useEffect(() => {
        if (editor && content !== undefined && content !== null) {
            const currentContent = editor.getHTML();
            const normalizeContent = (html: string) => html.replace(/\s+/g, ' ').trim();
            if (normalizeContent(content) !== normalizeContent(currentContent)) {
                editor.commands.setContent(content, false);
            }
        }
    }, [editor, content]);

    const handleImageUpload = useCallback(() => {
        if (!editor) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Replicate the logic from our CustomImage plugin's handlePaste/handleDrop
                file.arrayBuffer().then(buffer => {
                    (window as any).electron.files.saveImage(new Uint8Array(buffer))
                        .then((url: string | null) => {
                            if (url && editor) {
                                editor.chain().focus().insertContent({ type: 'image', attrs: { src: url } }).run();
                            }
                        });
                });
            }
        };
        input.click();
    }, [editor]);

    const handleCopySelection = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent focus loss
        if (!editor) return;
        const selection = editor.state.selection;
        const text = editor.state.doc.textBetween(selection.from, selection.to, '\n');
        navigator.clipboard.writeText(text).then(() => {
            addNotification(t('notifications.copiedToClipboard') || 'Panoya kopyalandı', 'success');
        });
    }, [editor, addNotification, t]);

    return (
        <div className="flex flex-col h-full bg-background text-text-primary">
            <FormattingToolbar editor={editor} onImageUpload={handleImageUpload} addNotification={addNotification} onVoiceSave={onVoiceSave} settings={settings} />
            <div className="relative flex-grow overflow-y-auto" onClick={() => editor?.commands.focus()}>
                {editor && (
                    <BubbleMenu
                        editor={editor}
                        tippyOptions={{ duration: 100 }}
                        className="bg-background-secondary border border-border shadow-lg rounded-lg p-1 flex gap-1 animate-in fade-in zoom-in duration-200"
                    >
                        <button
                            onMouseDown={handleCopySelection}
                            className="flex items-center justify-center p-2 text-text-primary hover:bg-background rounded-md transition-colors"
                            title={t('share.copy') || 'Kopyala'}
                        >
                            <span className="w-5 h-5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></span>
                        </button>
                    </BubbleMenu>
                )}
                <EditorContent editor={editor} className="prose dark:prose-invert max-w-none px-6 pb-6 pt-2 focus:outline-none h-full" />
            </div>
        </div>
    );
};

export default Editor;