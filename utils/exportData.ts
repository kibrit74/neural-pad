import * as XLSX from 'xlsx';
import { CategoryizedData } from './dataExtractor';

export const exportToExcel = (data: CategoryizedData, noteTitle: string) => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Define categories with Turkish names as column headers
    // Special handling for dates - add context column
    const categories = [
        { key: 'phones', name: 'Telefonlar', data: data.phones, hasContext: false },
        { key: 'emails', name: 'E-postalar', data: data.emails, hasContext: false },
        { key: 'addresses', name: 'Adresler', data: data.addresses, hasContext: false },
        { key: 'dates', name: 'Tarihler', data: data.dates, hasContext: true, contextName: 'Tarih Açıklaması' },
        { key: 'tckn', name: 'TC Kimlik No', data: data.tckn, hasContext: false },
        { key: 'ibans', name: 'IBAN\'lar', data: data.ibans, hasContext: false },
        { key: 'prices', name: 'Tutarlar', data: data.prices, hasContext: false },
        { key: 'urls', name: 'Web Siteleri', data: data.urls, hasContext: false },
        { key: 'plates', name: 'Plakalar', data: data.plates, hasContext: false },
        { key: 'custom', name: 'Özel Veriler', data: data.custom, hasContext: false },
    ];

    // Calculate max rows needed
    const maxRows = Math.max(...categories.map(c => c.data.length), 0);

    if (maxRows > 0) {
        // Build data array with category names as columns
        const sheetData: any[] = [];

        for (let i = 0; i < maxRows; i++) {
            const row: any = {};
            categories.forEach(cat => {
                const item = cat.data[i];
                row[cat.name] = item ? item.value : '';

                // Add context column for dates
                if (cat.hasContext && cat.contextName) {
                    row[cat.contextName] = item ? item.context : '';
                }
            });
            sheetData.push(row);
        }

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(sheetData);

        // Build column widths array
        const colWidths: { wch: number }[] = [];
        categories.forEach(cat => {
            // Main column width
            let maxLen = cat.name.length;
            cat.data.forEach(item => {
                if (item.value.length > maxLen) maxLen = item.value.length;
            });
            colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 15), 50) });

            // Context column width (for dates)
            if (cat.hasContext && cat.contextName) {
                let ctxMaxLen = cat.contextName.length;
                cat.data.forEach(item => {
                    if (item.context && item.context.length > ctxMaxLen) ctxMaxLen = item.context.length;
                });
                colWidths.push({ wch: Math.min(Math.max(ctxMaxLen + 2, 20), 60) });
            }
        });
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Veri Avcısı Sonuçları");
    } else {
        // No data found
        const emptySheet = XLSX.utils.json_to_sheet([{ 'Durum': 'Bu belge için veri bulunamadı.' }]);
        XLSX.utils.book_append_sheet(wb, emptySheet, 'Sonuç');
    }

    // Generate file name
    const safeTitle = (noteTitle || 'not').replace(/[^a-z0-9-_]+/gi, '_');
    const fileName = `${safeTitle}_veri_avcisi.xlsx`;

    // Write file
    XLSX.writeFile(wb, fileName);
};
