
import React from 'react';
import { Editor } from '@tiptap/react';
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikeIcon, CodeIcon, ListIcon, ListOrderedIcon, BlockquoteIcon, UndoIcon, RedoIcon, ImageIcon
} from './icons/Icons';

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
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleBold().run()} title="Bold" isActive={editor.isActive('bold')} disabled={!(editor.can() as any).toggleBold()}>
                <BoldIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleItalic().run()} title="Italic" isActive={editor.isActive('italic')} disabled={!(editor.can() as any).toggleItalic()}>
                <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleUnderline().run()} title="Underline" isActive={editor.isActive('underline')} disabled={!(editor.can() as any).toggleUnderline()}>
                <UnderlineIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleStrike().run()} title="Strikethrough" isActive={editor.isActive('strike')} disabled={!(editor.can() as any).toggleStrike()}>
                <StrikeIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleCode().run()} title="Code" isActive={editor.isActive('code')} disabled={!(editor.can() as any).toggleCode()}>
                <CodeIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleBulletList().run()} title="Bullet List" isActive={editor.isActive('bulletList')} disabled={!(editor.can() as any).toggleBulletList()}>
                <ListIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()} title="Numbered List" isActive={editor.isActive('orderedList')} disabled={!(editor.can() as any).toggleOrderedList()}>
                <ListOrderedIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).toggleBlockquote().run()} title="Blockquote" isActive={editor.isActive('blockquote')} disabled={!(editor.can() as any).toggleBlockquote()}>
                <BlockquoteIcon />
            </ToolbarButton>
            <ToolbarButton onClick={onImageUpload} title="Insert Image">
                <ImageIcon />
            </ToolbarButton>
             <div className="mx-2 h-6 border-l border-border"></div>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).undo().run()} title="Undo" disabled={!(editor.can() as any).undo()}>
                <UndoIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => (editor.chain().focus() as any).redo().run()} title="Redo" disabled={!(editor.can() as any).redo()}>
                <RedoIcon />
            </ToolbarButton>
        </div>
    );
};

export default FormattingToolbar;
