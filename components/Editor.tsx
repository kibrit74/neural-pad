
import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
// Use custom table that supports dynamic class attributes
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
}

const Editor: React.FC<EditorProps> = ({ content, onChange, editorRef, onAiImageMenu }) => {
    const { t } = useTranslations();
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Configure StarterKit options here if needed
            }),
            Placeholder.configure({
                placeholder: t('editor.placeholder'),
            }),
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
        editorProps: {
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (readerEvent) => {
                                    const url = readerEvent.target?.result as string | undefined;
                                    if (typeof url === 'string') {
                                        (editorRef.current as any)?.chain().focus().insertContent({ type: 'image', attrs: { src: url } }).run();
                                    }
                                };
                                reader.readAsDataURL(file);
                                return true;
                            }
                        }
                    }
                }

                return false;
            },
        },
    });

    if (editor) {
        editorRef.current = editor;
    }
    
    // Update editor content when content prop changes (only from external sources)
    useEffect(() => {
        if (editor && content !== undefined && content !== null) {
            const currentContent = editor.getHTML();
            // Only update if content is significantly different (not just formatting)
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
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const url = readerEvent.target?.result;
                    if (url) {
                        // FIX: Property 'setImage' does not exist on type 'ChainedCommands'.
                        // Replaced with `insertContent` which is a more generic way to add nodes.
                        editor.chain().focus().insertContent({ type: 'image', attrs: { src: url as string } }).run();
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }, [editor]);
    
    return (
        <div className="flex flex-col h-full bg-background text-text-primary">
            <FormattingToolbar editor={editor} onImageUpload={handleImageUpload} />
            <div className="relative flex-grow overflow-y-auto" onClick={() => editor?.commands.focus()}>
                 <EditorContent editor={editor} className="prose dark:prose-invert max-w-none px-6 pb-6 pt-2 focus:outline-none h-full" />
            </div>
        </div>
    );
};

export default Editor;
