import * as pdfjsLib from 'pdfjs-dist';

// PDF.js worker - local dosyadan yükle
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface PDFImportResult {
    text: string;
    pageCount: number;
    fileName: string;
}

/**
 * PDF dosyasından metin çıkarır
 */
export async function extractTextFromPDF(file: File): Promise<PDFImportResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');

        fullText += pageText + '\n\n';
    }

    return {
        text: fullText.trim(),
        pageCount,
        fileName: file.name
    };
}

/**
 * PDF metnini HTML formatına dönüştürür
 */
export function formatPDFTextAsHTML(result: PDFImportResult): string {
    const paragraphs = result.text
        .split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('');

    return `<h2>📄 ${result.fileName}</h2><p><em>${result.pageCount} sayfa</em></p>${paragraphs}`;
}
