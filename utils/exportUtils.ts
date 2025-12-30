import { jsPDF } from 'jspdf';
import TurndownService from 'turndown';
import html2canvas from 'html2canvas';
import type { Note } from '../types';

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export type ExportFormat = 'txt' | 'html' | 'md' | 'pdf' | 'json' | 'docx';

/**
 * Decode HTML entities properly
 */
const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

/**
 * HTML to Plain Text conversion with proper cleaning
 * Simple and reliable approach using textContent
 */
export const htmlToPlainText = (html: string): string => {
    if (!html || html.trim() === '') return '';

    try {
        // Create a temporary container
        const container = document.createElement('div');

        // First decode HTML entities, then set innerHTML
        container.innerHTML = decodeHtmlEntities(html);

        // Remove script and style elements completely
        const scripts = container.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());

        // Replace block-level elements with newlines before getting text
        // This preserves paragraph structure
        container.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre, hr').forEach(el => {
            // Insert a newline before the element
            const br = document.createTextNode('\n');
            el.parentNode?.insertBefore(br, el);
        });

        // Replace <br> tags with newlines
        container.querySelectorAll('br').forEach(br => {
            br.replaceWith('\n');
        });

        // Replace images with placeholder text
        container.querySelectorAll('img').forEach(img => {
            const alt = img.getAttribute('alt') || 'Image';
            img.replaceWith(`[${alt}]`);
        });

        // Replace links with their text and URL
        container.querySelectorAll('a').forEach(link => {
            const text = link.textContent || '';
            const href = link.getAttribute('href') || '';
            if (text.trim() && href) {
                link.replaceWith(`${text.trim()} (${href})`);
            } else if (text.trim()) {
                link.replaceWith(text.trim());
            } else {
                link.replaceWith('');
            }
        });

        // Replace tables with formatted text
        container.querySelectorAll('table').forEach(table => {
            const rows: string[] = [];
            table.querySelectorAll('tr').forEach(tr => {
                const cells: string[] = [];
                tr.querySelectorAll('th, td').forEach(cell => {
                    cells.push((cell.textContent || '').trim());
                });
                if (cells.length > 0) {
                    rows.push(cells.join(' | '));
                }
            });
            if (rows.length > 0) {
                table.replaceWith('\n' + rows.join('\n') + '\n');
            } else {
                table.replaceWith('');
            }
        });

        // Get text content (this automatically handles all HTML entities)
        let text = container.textContent || container.innerText || '';

        // If textContent is empty, try innerText
        if (!text.trim()) {
            text = container.innerText || '';
        }

        // Clean up whitespace
        // Replace multiple spaces with single space
        text = text.replace(/[ \t]+/g, ' ');
        // Replace multiple newlines with double newline
        text = text.replace(/\n{3,}/g, '\n\n');
        // Remove spaces before/after newlines
        text = text.replace(/[ \t]+\n/g, '\n');
        text = text.replace(/\n[ \t]+/g, '\n');

        // Final decode of HTML entities (in case some were missed)
        text = decodeHtmlEntities(text);

        // Trim whitespace
        text = text.trim();

        return text;
    } catch (error) {
        console.error('Error converting HTML to plain text:', error);
        // Ultimate fallback: decode entities and extract text
        try {
            const div = document.createElement('div');
            div.innerHTML = decodeHtmlEntities(html);
            let text = div.textContent || div.innerText || '';
            text = decodeHtmlEntities(text);
            return text.trim();
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            // Last resort: return empty string or original if it's already plain text
            return html.replace(/<[^>]*>/g, '').trim();
        }
    }
};

/**
 * HTML to Markdown conversion using Turndown
 */
export const htmlToMarkdown = (html: string): string => {
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-'
    });

    // Add custom rules for better conversion
    turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'] as any,
        replacement: (content) => `~~${content}~~`
    });

    return turndownService.turndown(html);
};

/**
 * Export note as TXT
 */
export const exportAsTxt = (note: Note): void => {
    const text = htmlToPlainText(note.content || '');
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9-_]+/gi, '_');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${safeTitle}.txt`);
};

/**
 * Export note as HTML
 */
export const exportAsHtml = (note: Note): void => {
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9-_]+/gi, '_');

    // Create a complete HTML document
    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(note.title || 'Untitled Note')}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 0.5rem;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        code {
            background: #f4f4f4;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 0.5rem;
            text-align: left;
        }
        th {
            background: #f4f4f4;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 1rem 0;
            padding-left: 1rem;
            color: #666;
        }
        .meta {
            color: #999;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <h1>${escapeHtml(note.title || 'Untitled Note')}</h1>
    <div class="meta">
        <div>Created: ${new Date(note.createdAt).toLocaleString()}</div>
        <div>Updated: ${new Date(note.updatedAt).toLocaleString()}</div>
        ${note.tags && note.tags.length > 0 ? `<div>Tags: ${note.tags.join(', ')}</div>` : ''}
    </div>
    <div class="content">
        ${note.content}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, `${safeTitle}.html`);
};

/**
 * Export note as Markdown
 */
export const exportAsMarkdown = (note: Note): void => {
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9-_]+/gi, '_');

    // Convert HTML to Markdown
    const markdown = htmlToMarkdown(note.content || '');

    // Add metadata header
    const header = `# ${note.title || 'Untitled Note'}\n\n`;
    const metadata = `> Created: ${new Date(note.createdAt).toLocaleString()}\n` +
        `> Updated: ${new Date(note.updatedAt).toLocaleString()}\n` +
        (note.tags && note.tags.length > 0 ? `> Tags: ${note.tags.join(', ')}\n` : '') +
        '\n---\n\n';

    const fullMarkdown = header + metadata + markdown;

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, `${safeTitle}.md`);
};

/**
 * Export note as PDF using html2canvas
 */
export const exportAsPdf = async (note: Note): Promise<void> => {
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9-_]+/gi, '_');

    const formatDate = (value: unknown) => {
        if (!value) return '';
        try {
            const date = value instanceof Date ? value : new Date(value as any);
            if (Number.isNaN(date.getTime())) return '';
            return date.toLocaleString();
        } catch (error) {
            return '';
        }
    };

    // Create a container element
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '0';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20mm';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#111827';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    container.style.lineHeight = '1.6';
    container.style.fontSize = '14px';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';

    const tags = (note.tags || []).filter(Boolean);

    // Build HTML content
    const htmlContent = `
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .np-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827; line-height: 1.2; }
            .np-meta { font-size: 11px; color: #6b7280; margin-bottom: 24px; line-height: 1.5; }
            .np-meta div { margin-bottom: 4px; }
            .np-tags { margin-top: 8px; }
            .np-tag { display: inline-block; background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 4px; font-size: 10px; margin-right: 6px; margin-bottom: 4px; }
            .np-content { font-size: 13px; color: #1f2937; line-height: 1.6; }
            .np-content p { margin: 0 0 12px 0; }
            .np-content p:last-child { margin-bottom: 0; }
            .np-content ul, .np-content ol { margin: 0 0 12px 20px; padding-left: 20px; }
            .np-content li { margin-bottom: 6px; }
            .np-content h1 { font-size: 20px; margin: 20px 0 12px 0; font-weight: 700; }
            .np-content h2 { font-size: 18px; margin: 18px 0 10px 0; font-weight: 700; }
            .np-content h3 { font-size: 16px; margin: 16px 0 8px 0; font-weight: 600; }
            .np-content img { max-width: 100%; height: auto; margin: 12px 0; display: block; border-radius: 4px; }
            .np-content blockquote { margin: 16px 0; padding-left: 16px; border-left: 3px solid #d1d5db; color: #4b5563; font-style: italic; }
            .np-content pre { background: #111827; color: #f9fafb; padding: 12px; border-radius: 6px; margin: 16px 0; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 11px; }
            .np-content code { background: #f3f4f6; color: #1f2937; padding: 2px 4px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 11px; }
            .np-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            .np-content th, .np-content td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .np-content th { background: #f9fafb; font-weight: 600; }
            .np-empty { font-style: italic; color: #6b7280; }
        </style>
        <div class="np-title">${escapeHtml(note.title || 'Untitled Note')}</div>
        <div class="np-meta">
            ${formatDate(note.createdAt) ? `<div>Created: ${escapeHtml(formatDate(note.createdAt))}</div>` : ''}
            ${formatDate(note.updatedAt) ? `<div>Updated: ${escapeHtml(formatDate(note.updatedAt))}</div>` : ''}
            ${tags.length ? `<div class="np-tags">${tags.map(tag => `<span class="np-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="np-content">${note.content || '<div class="np-empty">(Empty note)</div>'}</div>
    `;

    container.innerHTML = htmlContent;

    // Append to body
    document.body.appendChild(container);

    try {
        // Wait a bit for styles to apply
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log('[PDF Export] Container dimensions:', {
            scrollWidth: container.scrollWidth,
            scrollHeight: container.scrollHeight,
            offsetWidth: container.offsetWidth,
            offsetHeight: container.offsetHeight,
            clientWidth: container.clientWidth,
            clientHeight: container.clientHeight
        });

        // Check if container has content
        if (!container.scrollWidth || !container.scrollHeight) {
            console.error('[PDF Export] Container has no dimensions!');
            throw new Error('Failed to render content for PDF export');
        }

        // Convert to canvas
        console.log('[PDF Export] Starting html2canvas...');
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true,
            width: container.scrollWidth,
            height: container.scrollHeight,
            windowWidth: container.scrollWidth,
            windowHeight: container.scrollHeight
        });

        console.log('[PDF Export] Canvas created:', {
            width: canvas.width,
            height: canvas.height
        });

        // Check if canvas is empty
        if (canvas.width === 0 || canvas.height === 0) {
            console.error('[PDF Export] Canvas has no dimensions!');
            throw new Error('Failed to create canvas from content');
        }

        // Create PDF first
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        // Calculate PDF dimensions
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

        console.log('[PDF Export] PDF dimensions:', {
            imgWidth,
            imgHeight,
            pdfWidth,
            pdfHeight,
            pageHeight: pdf.internal.pageSize.getHeight()
        });

        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        console.log('[PDF Export] Image data length:', imgData.length);

        const pageHeight = pdf.internal.pageSize.getHeight();

        // If content fits on one page
        if (pdfHeight <= pageHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        } else {
            // Split into multiple pages
            let heightLeft = pdfHeight;
            let position = 0;

            while (heightLeft > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
                position -= pageHeight;

                if (heightLeft > 0) {
                    pdf.addPage();
                }
            }
        }

        console.log('[PDF Export] Saving PDF...');
        pdf.save(`${safeTitle}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        // Clean up
        if (container.parentNode) {
            document.body.removeChild(container);
        }
    }
};

/**
 * Export note as JSON
 */
export const exportAsJson = (note: Note): void => {
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9-_]+/gi, '_');

    const data = {
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `${safeTitle}.json`);
};

/**
 * Main export function - dispatches to appropriate exporter
 */
export const exportNote = async (note: Note, format: ExportFormat): Promise<void> => {
    switch (format) {
        case 'txt':
            exportAsTxt(note);
            return;
        case 'html':
            exportAsHtml(note);
            return;
        case 'md':
            exportAsMarkdown(note);
            return;
        case 'pdf':
            await exportAsPdf(note);
            return;
        case 'json':
            exportAsJson(note);
            return;
        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
};

/**
 * Get export format info
 */
export const getFormatInfo = (format: ExportFormat) => {
    const formatInfo = {
        txt: {
            name: 'Plain Text',
            extension: '.txt',
            description: 'Simple text file without formatting',
            iconType: 'txt' as const
        },
        html: {
            name: 'HTML Document',
            extension: '.html',
            description: 'Web page with full formatting and styles',
            iconType: 'html' as const
        },
        md: {
            name: 'Markdown',
            extension: '.md',
            description: 'Markdown format for GitHub, VSCode, etc.',
            iconType: 'md' as const
        },
        pdf: {
            name: 'PDF Document',
            extension: '.pdf',
            description: 'Portable Document Format',
            iconType: 'pdf' as const
        },
        json: {
            name: 'JSON Data',
            extension: '.json',
            description: 'Structured data format (can be re-imported)',
            iconType: 'json' as const
        },
        docx: {
            name: 'Word Document',
            extension: '.docx',
            description: 'Microsoft Word format (coming soon)',
            iconType: 'docx' as const
        }
    };

    return formatInfo[format];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Download a blob as a file
 */
const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
};

