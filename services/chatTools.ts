/**
 * Chat Tool Calling Service
 * Provides data extraction and action capabilities for the chatbot
 */

import { extractAllData, CategoryizedData, ExtractedData } from '../utils/dataExtractor';
import { exportToExcel } from '../utils/exportData';
import { openExternalUrl } from '../utils/openExternal';
import type { ToolResult, ToolAction, ToolDataType, ExtractedItem, Settings } from '../types';

// ============================================================================
// TOOL DEFINITIONS (for Gemini Function Calling)
// ============================================================================

export const CHAT_TOOLS = {
    functionDeclarations: [
        {
            name: 'extract_data',
            description: 'Nottan belirli türde veri çıkarır. Kullanıcı tarih, telefon, adres, email gibi verileri bulmak istediğinde bu fonksiyonu kullan.',
            parameters: {
                type: 'object',
                properties: {
                    dataType: {
                        type: 'string',
                        enum: ['dates', 'phones', 'emails', 'addresses', 'ibans', 'tckn', 'prices', 'custom', 'all'],
                        description: 'Çıkarılacak veri türü. "custom" kullanıcı tanımlı özel kalıpları, "all" tüm verileri çıkarır.'
                    }
                },
                required: ['dataType']
            }
        },
        {
            name: 'export_to_excel',
            description: 'Çıkarılan verileri Excel dosyasına aktarır.',
            parameters: {
                type: 'object',
                properties: {
                    dataType: {
                        type: 'string',
                        enum: ['dates', 'phones', 'emails', 'addresses', 'ibans', 'tckn', 'prices', 'custom', 'all'],
                        description: 'Excel\'e aktarılacak veri türü'
                    }
                },
                required: ['dataType']
            }
        }
    ]
};

// ============================================================================
// TOOL ACTIONS DEFINITIONS
// ============================================================================

const getActionsForType = (dataType: ToolDataType): ToolAction[] => {
    const baseActions: ToolAction[] = [
        { id: 'copy', label: 'Kopyala', icon: '📋', type: 'copy' },
        { id: 'excel', label: 'Excel\'e Aktar', icon: '📊', type: 'excel' }
    ];

    switch (dataType) {
        case 'dates':
            return [
                { id: 'calendar', label: 'Takvime Ekle', icon: '📅', type: 'calendar' },
                ...baseActions
            ];
        case 'phones':
            return [
                { id: 'call', label: 'Ara', icon: '📞', type: 'call' },
                ...baseActions
            ];
        case 'emails':
            return [
                { id: 'email', label: 'E-posta Gönder', icon: '📧', type: 'email' },
                ...baseActions
            ];
        case 'addresses':
            return [
                { id: 'map', label: 'Haritada Göster', icon: '🗺️', type: 'map' },
                ...baseActions
            ];
        default:
            return baseActions;
    }
};

const getTypeLabel = (dataType: ToolDataType): string => {
    const labels: Record<ToolDataType, string> = {
        dates: 'Tarihler',
        phones: 'Telefonlar',
        emails: 'E-postalar',
        addresses: 'Adresler',
        ibans: 'IBAN\'lar',
        tckn: 'TC Kimlik Numaraları',
        prices: 'Tutarlar',
        custom: 'Özel Kalıplar',
        all: 'Tüm Veriler'
    };
    return labels[dataType] || dataType;
};

// ============================================================================
// TOOL EXECUTION
// ============================================================================

export interface ToolCallResult {
    success: boolean;
    message: string;
    toolResults?: ToolResult[];
}

/**
 * Executes the extract_data tool
 */
export const executeExtractData = (
    dataType: ToolDataType,
    noteContent: string,
    noteTitle: string,
    customPatterns: Settings['customPatterns']
): ToolCallResult => {
    try {
        // Extract all data from note
        const allData = extractAllData(noteContent, customPatterns || []);

        const results: ToolResult[] = [];

        const mapToExtractedItem = (items: ExtractedData[]): ExtractedItem[] => {
            return items.map(item => ({
                value: item.value,
                context: item.context
            }));
        };

        if (dataType === 'all') {
            // Return all categories that have data
            const categories: { key: keyof CategoryizedData; type: ToolDataType }[] = [
                { key: 'dates', type: 'dates' },
                { key: 'phones', type: 'phones' },
                { key: 'emails', type: 'emails' },
                { key: 'addresses', type: 'addresses' },
                { key: 'ibans', type: 'ibans' },
                { key: 'tckn', type: 'tckn' },
                { key: 'prices', type: 'prices' }
            ];

            categories.forEach(cat => {
                const items = allData[cat.key];
                if (items && items.length > 0) {
                    results.push({
                        type: cat.type,
                        label: getTypeLabel(cat.type),
                        items: mapToExtractedItem(items),
                        actions: getActionsForType(cat.type)
                    });
                }
            });

            // Also include custom patterns in 'all'
            if (allData.custom && allData.custom.length > 0) {
                results.push({
                    type: 'custom' as ToolDataType,
                    label: 'Özel Kalıplar',
                    items: mapToExtractedItem(allData.custom),
                    actions: getActionsForType('custom' as ToolDataType)
                });
            }
        } else if (dataType === 'custom') {
            // Handle custom patterns specially
            const items = allData.custom;
            if (items && items.length > 0) {
                results.push({
                    type: 'custom',
                    label: 'Özel Kalıplar',
                    items: mapToExtractedItem(items),
                    actions: getActionsForType('custom')
                });
            }
        } else {
            // Return specific category
            const categoryMap: Record<ToolDataType, keyof CategoryizedData> = {
                dates: 'dates',
                phones: 'phones',
                emails: 'emails',
                addresses: 'addresses',
                ibans: 'ibans',
                tckn: 'tckn',
                prices: 'prices',
                custom: 'custom',
                all: 'phones' // fallback, won't be used
            };

            const items = allData[categoryMap[dataType]];
            if (items && items.length > 0) {
                results.push({
                    type: dataType,
                    label: getTypeLabel(dataType),
                    items: mapToExtractedItem(items),
                    actions: getActionsForType(dataType)
                });
            }
        }

        if (results.length === 0) {
            return {
                success: true,
                message: `Bu notta ${getTypeLabel(dataType).toLowerCase()} bulunamadı.`,
                toolResults: []
            };
        }

        const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
        return {
            success: true,
            message: `${totalItems} adet veri bulundu:`,
            toolResults: results
        };

    } catch (error: any) {
        return {
            success: false,
            message: `Veri çıkarma hatası: ${error.message}`
        };
    }
};

/**
 * Executes the export_to_excel tool
 */
export const executeExportToExcel = (
    dataType: ToolDataType,
    noteContent: string,
    noteTitle: string,
    customPatterns: Settings['customPatterns']
): ToolCallResult => {
    try {
        const allData = extractAllData(noteContent, customPatterns || []);

        // If specific type, filter data
        let dataToExport: CategoryizedData;
        if (dataType === 'all') {
            dataToExport = allData;
        } else {
            // Create empty data with only requested type
            dataToExport = {
                phones: [],
                ibans: [],
                emails: [],
                dates: [],
                plates: [],
                tckn: [],
                prices: [],
                urls: [],
                addresses: [],
                custom: []
            };

            const categoryMap: Record<ToolDataType, keyof CategoryizedData> = {
                dates: 'dates',
                phones: 'phones',
                emails: 'emails',
                addresses: 'addresses',
                ibans: 'ibans',
                tckn: 'tckn',
                prices: 'prices',
                custom: 'custom',
                all: 'phones'
            };

            const key = categoryMap[dataType];
            (dataToExport as any)[key] = allData[key];
        }

        exportToExcel(dataToExport, noteTitle);

        return {
            success: true,
            message: `✅ ${getTypeLabel(dataType)} Excel dosyasına aktarıldı ve indirildi.`
        };

    } catch (error: any) {
        return {
            success: false,
            message: `Excel aktarma hatası: ${error.message}`
        };
    }
};

// ============================================================================
// INTENT DETECTION (Fallback for non-function-calling mode)
// ============================================================================

export interface DetectedIntent {
    tool: 'extract_data' | 'export_to_excel' | null;
    dataType: ToolDataType;
}

/**
 * Detects user intent from message text (fallback method)
 * Returns null if no clear data type is detected - allows AI to handle the request
 */
export const detectIntent = (message: string): DetectedIntent | null => {
    const lowerMessage = message.toLowerCase();

    // FIRST: Check for custom pattern indicators - these should NOT match standard types
    // Keywords that suggest user wants custom data, not standard phone/email/etc.
    const customIndicators = [
        'dosya', 'esas', 'mahkeme', 'karar', 'dava', 'hasta',
        'hasta adı', 'dosya no', 'esas no', 'karar no', 'dava no',
        'müvekkil', 'protokol', 'sicil', 'patent', 'marka',
        'özel kalıp', 'özel tarama'
    ];

    const hasCustomIndicator = customIndicators.some(kw => lowerMessage.includes(kw));

    // Keywords for actions
    const extractKeywords = ['bul', 'listele', 'göster', 'çıkar', 'getir'];
    const excelKeywords = ['excel', 'kaydet', 'aktar', 'indir'];

    // Check if user wants to extract action
    const wantsExtract = extractKeywords.some(kw => lowerMessage.includes(kw));
    const wantsExcel = excelKeywords.some(kw => lowerMessage.includes(kw));

    // If no action keywords, don't trigger tool
    if (!wantsExtract && !wantsExcel) {
        return null;
    }

    // If custom indicator found, return custom type
    if (hasCustomIndicator) {
        return {
            tool: wantsExcel ? 'export_to_excel' : 'extract_data',
            dataType: 'custom'
        };
    }

    // Keywords for SPECIFIC data types - we only trigger tools for these
    // Note: 'numara' alone is removed to prevent false matches like "dosya numarası"
    const typeKeywords: Record<Exclude<ToolDataType, 'all' | 'custom'>, string[]> = {
        dates: ['tarih', 'duruşma', 'toplantı', 'randevu'],
        phones: ['telefon', 'gsm', 'cep telefon', 'telefon numara'],
        emails: ['email', 'e-posta', 'eposta', 'mail', 'mailleri'],
        addresses: ['adres', 'konum', 'mahalle', 'sokak', 'cadde'],
        ibans: ['iban', 'banka hesab'],
        tckn: ['tc kimlik', 'tckn', 'kimlik numara'],
        prices: ['fiyat', 'tutar', 'ücret', 'bedel']
    };

    // Keywords for "all data" extraction
    const allKeywords = ['tüm veri', 'bütün veri', 'hepsini bul', 'tüm bilgi', 'ne var', 'neler var'];

    // Check for "all data" keywords
    if (allKeywords.some(kw => lowerMessage.includes(kw))) {
        return {
            tool: wantsExcel ? 'export_to_excel' : 'extract_data',
            dataType: 'all'
        };
    }

    // Try to detect specific data type
    let detectedType: ToolDataType | null = null;
    for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (keywords.some(kw => lowerMessage.includes(kw))) {
            detectedType = type as ToolDataType;
            break;
        }
    }

    // If no specific type detected, don't trigger tool - let AI handle it
    if (!detectedType) {
        return null;
    }

    return {
        tool: wantsExcel ? 'export_to_excel' : 'extract_data',
        dataType: detectedType
    };
};

// ============================================================================
// ACTION HANDLERS (for UI buttons)
// ============================================================================

export const handleToolAction = (
    actionType: ToolAction['type'],
    item: ExtractedItem,
    noteTitle: string
): void => {
    switch (actionType) {
        case 'calendar': {
            // Convert DD.MM.YYYY to YYYYMMDD
            const parts = item.value.split(/[.\/-]/);
            if (parts.length === 3) {
                const [day, month, year] = parts;
                const isoDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
                // Use context as event title for better clarity (clean up the ellipses)
                const cleanContext = item.context.replace(/^\.{3}|\.{3}$/g, '').trim();
                const eventTitle = cleanContext || noteTitle;
                const eventDetails = `📅 Tarih: ${item.value}\n📄 Not: ${noteTitle}\n\n${item.context}`;
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${isoDate}/${isoDate}&details=${encodeURIComponent(eventDetails)}`;
                // Use openExternalUrl for proper Electron support
                openExternalUrl(calendarUrl);
            }
            break;
        }
        case 'call': {
            const cleanPhone = item.value.replace(/\s/g, '');
            window.location.href = `tel:${cleanPhone}`;
            break;
        }
        case 'email': {
            window.location.href = `mailto:${item.value}`;
            break;
        }
        case 'map': {
            const encoded = encodeURIComponent(item.value);
            // Use openExternalUrl for proper Electron support
            openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
            break;
        }
        case 'copy': {
            navigator.clipboard.writeText(item.value);
            break;
        }
        case 'excel': {
            // This should be handled at a higher level with full data
            break;
        }
    }
};
