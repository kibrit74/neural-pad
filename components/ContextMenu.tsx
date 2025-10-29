import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { toggleTableClass, sortTable } from '../utils/tableUtils';
import type { Settings, Note } from '../types';
import { WandIcon } from './icons/Icons';
import { Editor } from '@tiptap/react';

function maybeTabularToHTML(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const lines = trimmed.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return null;

    const tableStyle = 'border-collapse:collapse;width:100%';
    const thStyle = 'border:1px solid var(--color-border-strong);padding:6px 8px;background:var(--color-background-secondary);text-align:left;font-weight:700';
    const tdStyle = 'border:1px solid var(--color-border-strong);padding:6px 8px;text-align:left';

    // Markdown table: header | header\n|---|---|\nrow
    if (/\|/.test(lines[0]) && /[-|:]/.test(lines[1])) {
        const sepMatch = /^\s*\|?\s*[-:|\s]+\s*\|?\s*$/.test(lines[1]);
        if (sepMatch) {
            const parseRow = (row: string) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
            const headers = parseRow(lines[0]);
            const rows = lines.slice(2).map(parseRow);
            const headerHtml = `<tr>${headers.map(h => `<th style=\"${thStyle}\">${h}</th>`).join('')}</tr>`;
            const bodyHtml = rows.map(r => `<tr>${r.map(c => `<td style=\"${tdStyle}\">${c}</td>`).join('')}</tr>`).join('');
            return `<table class=\"np-table np-zebra np-sticky-header\" style=\"${tableStyle}\"><caption></caption><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
        }
    }

    // CSV/TSV/pipe detection
    const candidates = ['\t', ';', '|', ','];
    let bestDelim = ',';
    let bestScore = -1;
    for (const d of candidates) {
        const score = lines.slice(0, Math.min(10, lines.length)).reduce((acc, l) => acc + (l.split(d).length - 1), 0);
        if (score > bestScore) { bestScore = score; bestDelim = d; }
    }
    if (bestScore > 0) {
        const split = (s: string) => s.split(bestDelim).map(c => c.trim());
        const rows = lines.map(split);
        const header = rows[0];
        const body = rows.slice(1);
        const headerHtml = `<tr>${header.map(h => `<th style=\"${thStyle}\">${h}</th>`).join('')}</tr>`;
        const bodyHtml = body.map(r => `<tr>${r.map(c => `<td style=\"${tdStyle}\">${c}</td>`).join('')}</tr>`).join('');
        return `<table class=\"np-table np-zebra np-sticky-header\" style=\"${tableStyle}\"><caption></caption><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
    }

    return null;
}

interface ContextMenuProps {
    editor: Editor;
    onClose: () => void;
    settings: Settings;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
    anchorEl: HTMLElement | null;
    type?: 'text' | 'image';
    data?: string; // image src (dataURL)
    activeNote: Note | null;
    onTagsChange: (tags: string[]) => void;
    onForceContentUpdate?: () => void; // Force content update callback
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
    editor, onClose, settings, addNotification, anchorEl, type, data, activeNote, onTagsChange, onForceContentUpdate 
}) => {
    const { t } = useTranslations();
    const menuRef = useRef<HTMLDivElement>(null);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, opacity: 0 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOnAnchor = anchorEl && anchorEl.contains(event.target as Node);
            const isClickInMenu = menuRef.current && menuRef.current.contains(event.target as Node);

            if (isClickOnAnchor) {
                return;
            }

            if (!isClickInMenu) {
                onClose();
            }
        };
        
        const timerId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timerId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, anchorEl]);
    
    useLayoutEffect(() => {
        if (anchorEl && menuRef.current) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight;
            const isMobile = viewWidth < 768;
    
            // Vertical position: Prefer below, but go above if needed.
            let top = anchorRect.bottom + 5;
            if (top + menuRect.height > viewHeight - 10) { // 10px buffer from bottom
                top = anchorRect.top - menuRect.height - 5;
            }
            if (top < 10) { // 10px buffer from top
                top = 10;
            }
    
            // Horizontal position
            let left;
            // For the mobile AI image button, align right edges
            if (isMobile && type === 'image') {
                left = anchorRect.right - menuRect.width;
            } else {
                // For desktop or text selection, align left edges
                left = anchorRect.left;
            }
    
            // Keep it on screen horizontally
            if (left < 10) { // 10px buffer from left
                left = 10;
            }
            if (left + menuRect.width > viewWidth - 10) { // 10px buffer from right
                left = viewWidth - menuRect.width - 10;
            }
    
            setPosition({
                top: top + window.scrollY,
                left: left + window.scrollX,
                opacity: 1,
            });
        } else {
            setPosition(prev => ({ ...prev, opacity: 0 }));
        }
    }, [anchorEl, type]);

    const handleAction = async (promptTemplate: string, actionId?: string) => {
        if (!editor) return;

        setIsLoading(true);
        addNotification(t('notifications.aiThinking'), 'warning');
        
        let fullPrompt = '';
        let imagePayload: { mimeType: string; data: string } | undefined = undefined;
        let insertionPos = editor.state.selection.to;
        let selectedText = '';

        if (type === 'image' && data) {
            const parts = data.split(',');
            if (parts.length < 2) {
                addNotification('Invalid image data', 'error');
                setIsLoading(false);
                onClose();
                return;
            }
            const [meta, base64Data] = parts;
            const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
            imagePayload = { mimeType, data: base64Data };
            fullPrompt = promptTemplate;

            const { state } = editor;
            state.doc.descendants((node, pos) => {
                if (node.type.name === 'image' && node.attrs.src === data) {
                    insertionPos = pos + node.nodeSize;
                    return false; // stop searching
                }
            });

        } else if (type === 'text') {
            const { from, to, empty } = editor.state.selection;
            if (empty) {
                 setIsLoading(false);
                 onClose();
                 return;
            }
            selectedText = editor.state.doc.textBetween(from, to);
            fullPrompt = `${promptTemplate}:\n\n"${selectedText}"\n\n${t('aiPrompts.languageInstruction')}`;
            insertionPos = to;
        } else {
             setIsLoading(false);
             onClose();
             return;
        }
        
        try {
            if (actionId === 'generateTags') {
                const newTags = await generateTagsForNote(selectedText, settings);
                if (newTags.length > 0) {
                    const currentTags = activeNote?.tags || [];
                    const combinedTags = [...new Set([...currentTags, ...newTags])];
                    onTagsChange(combinedTags);
                    addNotification(t('notifications.aiSuccess'), 'success');
                } else {
                    addNotification(t('notifications.noTagsFound'), 'warning');
                }
            } else {
                const result = await generateContent(fullPrompt, settings, imagePayload);
                let innerHtml = result.replace(/\n/g, '<br/>');
                const tableHtml = maybeTabularToHTML(result);
                if (actionId === 'makeTable' && tableHtml) {
                    innerHtml = tableHtml;
                } else if (tableHtml) {
                    innerHtml = tableHtml; // auto-convert if AI returned a table
                }
                const responseHtml = `<br><div class=\"ai-response p-2 my-2 border-l-4 border-primary bg-background text-text-primary\"><strong>${t('aiPrompts.responseTitle')}:</strong><br/>${innerHtml}</div>`;
                editor.chain().focus().insertContentAt(insertionPos, responseHtml).run();
                addNotification(t('notifications.aiSuccess'), 'success');
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
        } finally {
            setIsLoading(false);
            onClose();
        }
    };


    const textMenuItems = [
        { id: 'improve', label: t('contextMenu.improve'), prompt: t('aiPrompts.improveWriting') },
        { id: 'fix', label: t('contextMenu.fix'), prompt: t('aiPrompts.fixSpelling') },
        { id: 'summarize', label: t('contextMenu.summarize'), prompt: t('aiPrompts.summarize') },
        { id: 'generateTags', label: t('contextMenu.generateTags'), prompt: t('aiPrompts.generateTags') },
        { id: 'makeTable', label: t('contextMenu.makeTable'), prompt: 'Convert the selected text into a clear table. Output CSV only without commentary.' },
    ];
    
    const imageMenuItems = [
        { id: 'describe', label: t('contextMenu.describeImage'), prompt: t('aiPrompts.describeImage') },
        { id: 'caption', label: t('contextMenu.suggestCaption'), prompt: t('aiPrompts.suggestCaption') },
    ];

    const menuItems = type === 'image' ? imageMenuItems : textMenuItems;

    // Editor içeriğini ProseMirror DOM'dan senkronize et
    const syncEditorContent = () => {
        if (!editor) return;
        
        // Force editor to update its internal state based on DOM changes
        // This ensures table modifications are properly saved to editor state
        try {
            const transaction = editor.state.tr;
            editor.view.dispatch(transaction);
        } catch (error) {
            console.warn('Failed to sync editor content:', error);
        }
    };

    const getSelectedTable = (): HTMLTableElement | null => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        let node = sel.anchorNode as Node | null;
        while (node && (node as HTMLElement).nodeType === 3) node = (node as any).parentNode;
        while (node && (node as HTMLElement).tagName !== 'TABLE') node = (node as any).parentNode;
        return (node as HTMLTableElement) || null;
    };

    const getCurrentCellIndex = (table: HTMLTableElement): number => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return 0;
        let node = sel.anchorNode as Node | null;
        while (node && (node as HTMLElement).nodeType === 3) node = (node as any).parentNode;
        while (node && (node as HTMLElement).tagName !== 'TD' && (node as HTMLElement).tagName !== 'TH') node = (node as any).parentNode;
        const cell = node as HTMLTableCellElement;
        if (!cell) return 0;
        return (cell as any).cellIndex || 0;
    };

    const sortTableByColumn = (ascending: boolean) => {
        const colIndex = getCurrentCellIndex(getSelectedTable());
        sortTable(editor, colIndex, ascending);
        onClose();
    };

    const addTotalsRow = () => {
        if (!editor.isActive('table')) return;
        (editor.chain().focus() as any).addRowAfter().run();
        onClose();
    };

    const toggleZebra = () => {
        toggleTableClass(editor, 'np-zebra');
        onClose();
    };
    const toggleSticky = () => {
        toggleTableClass(editor, 'np-sticky-header');
        onClose();
    };
    const bordersNone = () => {
        toggleTableClass(editor, 'np-borders-none');
        onClose();
    };
    const bordersAll = () => {
        toggleTableClass(editor, 'np-borders-all');
        onClose();
    };
    const bordersOutside = () => {
        toggleTableClass(editor, 'np-borders-outside');
        onClose();
    };

    const exportCSV = async () => {
        const table = getSelectedTable(); if (!table) return;
        const rows = Array.from(table.rows).map(r => Array.from(r.cells).map(c => '"'+(c.textContent||'').replace(/"/g,'""')+'"').join(','));
        const csv = rows.join('\n');
        await navigator.clipboard.writeText(csv);
        onClose();
    };

    const updateTableInEditor = () => {
        // Force note content update via parent callback
        setTimeout(() => {
            if (onForceContentUpdate) {
                onForceContentUpdate();
            }
        }, 10);
    };
    
    const isInTable = () => !!getSelectedTable();

    const shareSelection = async () => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;
        if (empty) return;

        // Get plain text and HTML of selection
        const text = editor.state.doc.textBetween(from, to);
        let html = text;
        try {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0).cloneRange();
                const container = document.createElement('div');
                container.appendChild(range.cloneContents());
                html = container.innerHTML || text;
            }
        } catch {}

        const title = activeNote?.title || 'Neural Pad Selection';
        const htmlBlob = new Blob([`<!doctype html><meta charset=\"utf-8\"><title>${title}</title>${html}`], { type: 'text/html' });
        const txtBlob = new Blob([text], { type: 'text/plain' });

        try {
            const files = [new File([htmlBlob], 'selection.html', { type: 'text/html' }), new File([txtBlob], 'selection.txt', { type: 'text/plain' })];
            const n = navigator as any;
            if (n.share && n.canShare?.({ files })) {
                await n.share({ files, title });
                addNotification(t('notifications.shareSuccess'), 'success');
                onClose();
                return;
            }
        } catch {}

        try {
            const n = navigator as any;
            if (n.clipboard?.write && (window as any).ClipboardItem) {
                await n.clipboard.write([
                    new (window as any).ClipboardItem({
                        'text/html': htmlBlob,
                        'text/plain': txtBlob,
                    }),
                ]);
                addNotification(t('notifications.shareSuccess'), 'success');
                onClose();
                return;
            }
        } catch {}

        // Fallback: download HTML snippet
        try {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(htmlBlob);
            a.download = 'selection.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            addNotification(t('notifications.shareUnavailable'), 'warning');
        } catch {}
        onClose();
    };

    const shareImage = async (dataUrl: string) => {
        try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const ext = (blob.type.split('/')[1] || 'png').split(';')[0];
            const file = new File([blob], `image.${ext}`, { type: blob.type });
            if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
                await (navigator as any).share({ files: [file], title: 'Shared image' });
                addNotification(t('notifications.shareSuccess'), 'success');
            } else if ((navigator as any).clipboard?.write) {
                await (navigator as any).clipboard.write([new (window as any).ClipboardItem({ [blob.type]: blob })]);
                addNotification(t('notifications.shareUnavailable'), 'warning');
            } else {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'image.' + ext;
                a.click();
                addNotification(t('notifications.shareUnavailable'), 'warning');
            }
        } catch {}
        onClose();
    };
    
    const btnPrimary = "w-full mt-1.5 bg-primary hover:bg-primary-hover text-primary-text text-sm flex items-center justify-center gap-1 px-4 py-2 rounded-md font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div
            ref={menuRef}
            className="absolute bg-background-secondary shadow-lg rounded-md p-2 z-20 border border-border-strong text-text-primary transition-opacity duration-100"
            style={{ 
                top: `${position.top}px`, 
                left: `${position.left}px`,
                opacity: position.opacity
            }}
        >
            {isLoading ? (
                <div className="p-4">{t('chat.thinking')}</div>
            ) : (
                <>
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => handleAction(item.prompt, item.id)} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border flex items-center gap-2">
                            {item.label}
                        </button>
                    ))}
                    {type === 'text' && (
                        <>
                            <hr className="my-1 border-border" />
                            <button onClick={shareSelection} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border flex items-center gap-2">
                                {t('contextMenu.shareSelection')}
                            </button>
                        </>
                    )}

                    {isInTable() && (
                        <>
                            <hr className="my-1 border-border" />
                            <div className="px-2 py-1 text-xs text-text-secondary">{t('contextMenu.table.title')}</div>
                            <button onClick={() => sortTableByColumn(true)} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.sortAZ')}</button>
                            <button onClick={() => sortTableByColumn(false)} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.sortZA')}</button>
                            <button onClick={addTotalsRow} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.totals')}</button>
                            <button onClick={toggleZebra} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.zebra')}</button>
                            <button onClick={toggleSticky} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.sticky')}</button>
                            <div className="px-2 py-1 text-xs text-text-secondary">{t('contextMenu.table.borders')}</div>
                            <button onClick={bordersAll} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.bordersAll')}</button>
                            <button onClick={bordersOutside} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.bordersOutside')}</button>
                            <button onClick={bordersNone} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.bordersNone')}</button>
                            <button onClick={exportCSV} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border">{t('contextMenu.table.copyCsv')}</button>
                        </>
                    )}

                    {type === 'image' && data && (
                        <>
                            <hr className="my-1 border-border" />
                            <button onClick={() => shareImage(data)} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-border flex items-center gap-2">
                                {t('contextMenu.shareImage')}
                            </button>
                        </>
                    )}
                    <hr className="my-1 border-border" />
                    <div className="p-1">
                        <input
                            type="text"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder={t('contextMenu.customPromptPlaceholder')}
                            className="w-full p-1.5 text-sm bg-background rounded border border-border-strong text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button onClick={() => handleAction(customPrompt)} disabled={!customPrompt} className={btnPrimary}>
                            <WandIcon /> {t('contextMenu.submit')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContextMenu;