
import React, { useCallback } from 'react';
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';

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
                image: false, // Disable the default image extension to ensure CustomImage is used.
                underline: false, // Disable underline from StarterKit since we're importing it separately
            }),
            Underline,
            Placeholder.configure({
                placeholder: t('editor.placeholder'),
            }),
            CustomImage.configure({
                inline: false,
                onAiMenuClick: onAiImageMenu,
            }),
            TextStyle,
            FontFamily,
            FontSize,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            handlePaste: (view, event) => {
                // FIX: Refactor loop to use indexed access on DataTransferItemList.
                // This avoids using Array.from which was causing type inference issues,
                // leading to `item` being of type `unknown`.
                const items = event.clipboardData?.items;
                if (!items) {
                    return false;
                }
                const { schema } = view.state;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (readerEvent) => {
                                const url = readerEvent.target?.result;
                                if (typeof url === 'string') {
                                    const node = schema.nodes.image.create({ src: url });
                                    const transaction = view.state.tr.replaceSelectionWith(node);
                                    view.dispatch(transaction);
                                }
                            };
                            reader.readAsDataURL(file);
                            return true; // We've handled the paste event
                        }
                    }
                }

                return false; // Let Tiptap handle the rest
            },
        },
    });

    if (editor) {
        editorRef.current = editor;
    }

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
