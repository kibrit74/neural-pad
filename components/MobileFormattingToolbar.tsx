import React from 'react';
import { Editor } from '@tiptap/react';
import { useTranslations } from '../hooks/useTranslations';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListIcon, ListOrderedIcon, UndoIcon, RedoIcon } from './icons/Icons';

interface MobileFormattingToolbarProps {
    editor: Editor | null;
}

const MobileFormattingToolbar: React.FC<MobileFormattingToolbarProps> = ({ editor }) => {
    const { t } = useTranslations();

    if (!editor) return null;

    const ToolbarButton: React.FC<{ onClick?: () => void; title: string; isActive?: boolean; children: React.ReactNode }> = ({
        onClick, title, isActive = false, children
    }) => (
        <button
            onClick={onClick}
            title={title}
            aria-label={title}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded transition-colors ${isActive ? 'bg-primary text-primary-text' : 'hover:bg-border'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/5 backdrop-blur-md overflow-x-auto snap-x snap-mandatory">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                title={t('toolbar.bold')}
                isActive={editor.isActive('bold')}
            >
                <BoldIcon />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title={t('toolbar.italic')}
                isActive={editor.isActive('italic')}
            >
                <ItalicIcon />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title={t('toolbar.underline')}
                isActive={editor.isActive('underline')}
            >
                <UnderlineIcon />
            </ToolbarButton>

            <div className="w-[1px] h-8 bg-border mx-1"></div>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title={t('toolbar.bulletList')}
                isActive={editor.isActive('bulletList')}
            >
                <ListIcon />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title={t('toolbar.orderedList')}
                isActive={editor.isActive('orderedList')}
            >
                <ListOrderedIcon />
            </ToolbarButton>

            <div className="w-[1px] h-8 bg-border mx-1"></div>

            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                title={t('toolbar.undo')}
            >
                <UndoIcon />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                title={t('toolbar.redo')}
            >
                <RedoIcon />
            </ToolbarButton>
        </div>
    );
};

export default MobileFormattingToolbar;
