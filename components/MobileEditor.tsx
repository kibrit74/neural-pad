import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Blockquote from '@tiptap/extension-blockquote';
import Code from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { CustomTable } from '../utils/tiptapCustomTable';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { FontSize } from '../utils/tiptapExtensions';
import { CustomImage } from '../utils/tiptapCustomImage';
import { useTranslations } from '../hooks/useTranslations';
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikeIcon, CodeIcon,
    ListIcon, ListOrderedIcon, BlockquoteIcon, UndoIcon, RedoIcon,
    ImageIcon
} from './icons/Icons';

const TableIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
);

interface MobileEditorProps {
    content: string;
    onChange: (html: string) => void;
    editorRef: React.MutableRefObject<TiptapEditor | null>;
    onAiImageMenu: (target: HTMLElement, src: string) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
    onVoiceSave?: () => void | Promise<void>;
    settings?: any;
}

const MobileEditor: React.FC<MobileEditorProps> = ({
    content,
    onChange,
    editorRef,
    onAiImageMenu,
    addNotification,
    onVoiceSave,
    settings
}) => {
    const { t } = useTranslations();
    const [showToolbar, setShowToolbar] = useState(true);

    const handleImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                if (editorRef.current) {
                    editorRef.current.chain().focus().setImage({ src: url }).run();
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }, [editorRef]);

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            Strike,
            Underline,
            Code,
            Blockquote,
            Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
            BulletList,
            OrderedList,
            ListItem,
            History,
            TextStyle,
            FontFamily,
            FontSize,
            CustomTable.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            CustomImage.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: { class: 'custom-image' },
            }),
            Placeholder.configure({
                placeholder: t('editor.placeholder') || 'Yazmaya başlayın...',
            }),
        ],
        content,
        editorProps: {
            attributes: { class: 'mobile-editor-content' },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    React.useEffect(() => {
        if (editor) {
            editorRef.current = editor;
        }
    }, [editor, editorRef]);

    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    const ToolButton: React.FC<{
        onClick: () => void;
        active?: boolean;
        children: React.ReactNode;
        title: string;
    }> = ({ onClick, active, children, title }) => (
        <button
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center w-8 h-8 rounded transition-all ${active
                ? 'bg-primary text-primary-text'
                : 'bg-white/5 hover:bg-white/10'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col h-full w-full max-w-full bg-transparent">
            {/* Compact Toolbar - Always Visible */}
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border/20 p-1">
                <div className="flex gap-1 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        title="Bold"
                    >
                        <BoldIcon />
                    </ToolButton>

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        title="Italic"
                    >
                        <ItalicIcon />
                    </ToolButton>

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive('underline')}
                        title="Underline"
                    >
                        <UnderlineIcon />
                    </ToolButton>

                    <div className="w-[1px] bg-border/30 mx-1"></div>

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <ListIcon />
                    </ToolButton>

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrderedIcon />
                    </ToolButton>

                    <div className="w-[1px] bg-border/30 mx-1"></div>

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <span className="text-lg font-bold">H1</span>
                    </ToolButton>

                    <ToolButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <span className="text-base font-bold">H2</span>
                    </ToolButton>

                    <div className="w-[1px] bg-border/30 mx-1"></div>

                    <ToolButton
                        onClick={handleImageUpload}
                        title="Insert Image"
                    >
                        <ImageIcon />
                    </ToolButton>

                    <ToolButton
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert Table"
                    >
                        <TableIcon />
                    </ToolButton>

                    <div className="w-[1px] bg-border/30 mx-1"></div>

                    <ToolButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="Undo"
                    >
                        <UndoIcon />
                    </ToolButton>

                    <ToolButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="Redo"
                    >
                        <RedoIcon />
                    </ToolButton>
                </div>
            </div>

            {/* Editor Content */}
            <div
                className="flex-grow overflow-y-auto w-full max-w-full"
                onClick={() => editor?.commands.focus()}
            >
                <EditorContent
                    editor={editor}
                    className="mobile-editor w-full max-w-full px-4 py-4 focus:outline-none h-full text-base leading-relaxed"
                />
            </div>
        </div>
    );
};

export default MobileEditor;
