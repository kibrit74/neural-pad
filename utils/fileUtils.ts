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