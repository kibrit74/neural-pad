import { jsPDF } from "jspdf";

const htmlToText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Determine language from html lang attribute for translations
    const lang = document.documentElement.lang || 'en';
    const aiResponseTitle = lang === 'tr' ? 'Yapay Zeka Yanıtı' : 'AI Response';

    // Replace images with their placeholders for text export
    tempDiv.querySelectorAll('img[data-image-id]').forEach(img => {
        const id = img.getAttribute('data-image-id');
        if (id) {
            const placeholder = document.createTextNode(`[${id}]`);
            img.parentNode?.replaceChild(placeholder, img);
        }
    });
    
    // Replace divs used for AI responses with styled text
    tempDiv.querySelectorAll('.ai-response').forEach(div => {
        // Extract only the content, not the title from the div
        const contentClone = div.cloneNode(true) as HTMLElement;
        const titleElement = contentClone.querySelector('strong');
        if (titleElement) {
             titleElement.remove();
        }
        
        const text = `\n\n--- ${aiResponseTitle} ---\n${contentClone.textContent?.trim()}\n--- End ${aiResponseTitle} ---\n\n`;
        const textNode = document.createTextNode(text);
        div.parentNode?.replaceChild(textNode, div);
    });

    // Replace <br> with newlines
    tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');

    return tempDiv.textContent || tempDiv.innerText || '';
};

export const downloadTxt = (filename: string, htmlContent: string) => {
    const text = htmlToText(htmlContent);
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

export const downloadPdf = (filename: string, htmlContent: string) => {
    const text = htmlToText(htmlContent);
    const pdf = new jsPDF();
    
    // Add a font that supports Turkish characters
    // Using a standard font that has better unicode support.
    pdf.setFont('Helvetica'); 
    
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const lines = pdf.splitTextToSize(text, pdf.internal.pageSize.width - margin * 2);
    
    let cursor = margin;

    lines.forEach((line: string) => {
        if (cursor + 10 > pageHeight - margin) {
            pdf.addPage();
            cursor = margin;
        }
        pdf.text(line, margin, cursor);
        cursor += 7; // Line height
    });

    pdf.save(filename);
};

// Download as standalone HTML (opened by Word and browsers)
export const downloadHtml = (filename: string, htmlContent: string) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${filename}</title></head><body>${htmlContent}</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Minimal HTML→RTF converter (basic bold/italic/underline, paragraphs, lists, headings)
function escapeRtf(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/\u00A0/g, ' ');
}

function nodeToRtf(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return escapeRtf((node as Text).nodeValue || '');
    }
    const el = node as HTMLElement;
    const tag = el.tagName?.toLowerCase();
    let inner = Array.from(el.childNodes).map(nodeToRtf).join('');

    switch (tag) {
        case 'b':
        case 'strong':
            return `\\b ${inner}\\b0 `;
        case 'i':
        case 'em':
            return `\\i ${inner}\\i0 `;
        case 'u':
            return `\\ul ${inner}\\ul0 `;
        case 'br':
            return `\\line `;
        case 'p':
        case 'div':
            return `${inner}\\par `;
        case 'h1':
            return `\\fs48 \\b ${inner}\\b0 \\fs24 \\par `;
        case 'h2':
            return `\\fs40 \\b ${inner}\\b0 \\fs24 \\par `;
        case 'h3':
            return `\\fs32 \\b ${inner}\\b0 \\fs24 \\par `;
        case 'ul':
            return `${Array.from(el.children).map(li => `\\par \\bullet\tab ${nodeToRtf(li)} `).join('')}\\par `;
        case 'ol':
            return `${Array.from(el.children).map((li, i) => `\\par ${i + 1}.\tab ${nodeToRtf(li)} `).join('')}\\par `;
        case 'li':
            return inner;
        case 'table':
            return `${Array.from(el.querySelectorAll('tr')).map(tr => `${Array.from(tr.children).map(td => `${nodeToRtf(td)}\tab`).join('')}\\par`).join('')}\\par `;
        case 'td':
        case 'th':
            return inner + ' ';
        default:
            return inner;
    }
}

function htmlToRtf(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const bodyRtf = Array.from(div.childNodes).map(nodeToRtf).join('');
    const header = '{\\rtf1\\ansi\\deff0\\fs24 ';
    const footer = '}';
    return header + bodyRtf + footer;
}

export const downloadRtf = (filename: string, htmlContent: string) => {
    const rtf = htmlToRtf(htmlContent);
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.rtf') ? filename : `${filename}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
