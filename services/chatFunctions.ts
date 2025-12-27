/**
 * Chat Function Calling Handlers
 * Executes Gemini function calls and returns results with action buttons
 */

import { Type } from '@google/genai';
import { extractAllData, CategoryizedData } from '../utils/dataExtractor';
import { exportToExcel } from '../utils/exportData';
import { openExternalUrl } from '../utils/openExternal';

// ============================================================================
// TYPES
// ============================================================================

export interface FunctionResult {
    success: boolean;
    message: string;
    data?: any[];
    actions?: ActionButton[];
}

export interface ActionButton {
    id: string;
    label: string;
    icon: string;
    action: () => void;
}

// ============================================================================
// FUNCTION DEFINITIONS FOR GEMINI
// ============================================================================

export const CHAT_FUNCTION_DECLARATIONS = [
    {
        name: 'extract_data',
        description: 'Belgeden belirli türde veri çıkarır (email, telefon, tarih, adres, IBAN, TC kimlik, tutar). Kullanıcı veri bulmak, listelemek veya göstermek istediğinde bu fonksiyonu kullan.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                dataType: {
                    type: Type.STRING,
                    enum: ['emails', 'phones', 'dates', 'addresses', 'ibans', 'tckn', 'prices', 'all'],
                    description: 'Çıkarılacak veri türü. emails=e-posta, phones=telefon, dates=tarih, addresses=adres, ibans=IBAN, tckn=TC kimlik, prices=tutar, all=hepsi'
                }
            },
            required: ['dataType']
        }
    },
    {
        name: 'add_to_calendar',
        description: 'Bir tarihi Google Takvime ekler. Kullanıcı takvime eklemek istediğinde bu fonksiyonu kullan.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                date: {
                    type: Type.STRING,
                    description: 'Tarih (DD.MM.YYYY formatında)'
                },
                title: {
                    type: Type.STRING,
                    description: 'Etkinlik başlığı'
                },
                description: {
                    type: Type.STRING,
                    description: 'Etkinlik açıklaması (opsiyonel)'
                }
            },
            required: ['date', 'title']
        }
    },
    {
        name: 'add_to_contacts',
        description: 'Kişi bilgilerini rehbere eklemek için vCard dosyası oluşturur. Kullanıcı rehbere eklemek istediğinde bu fonksiyonu kullan.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: {
                    type: Type.STRING,
                    description: 'Kişinin adı soyadı'
                },
                phone: {
                    type: Type.STRING,
                    description: 'Telefon numarası'
                },
                email: {
                    type: Type.STRING,
                    description: 'E-posta adresi (opsiyonel)'
                },
                address: {
                    type: Type.STRING,
                    description: 'Adres (opsiyonel)'
                }
            },
            required: ['name']
        }
    },
    {
        name: 'save_to_excel',
        description: 'Belgedeki verileri Excel dosyasına kaydeder ve indirir. Kullanıcı Excel\'e kaydetmek istediğinde bu fonksiyonu kullan.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                dataType: {
                    type: Type.STRING,
                    enum: ['emails', 'phones', 'dates', 'addresses', 'all'],
                    description: 'Excel\'e kaydedilecek veri türü'
                }
            },
            required: ['dataType']
        }
    },
    {
        name: 'send_email',
        description: 'E-posta göndermek için mail uygulamasını açar.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                email: {
                    type: Type.STRING,
                    description: 'Alıcı e-posta adresi'
                },
                subject: {
                    type: Type.STRING,
                    description: 'E-posta konusu (opsiyonel)'
                }
            },
            required: ['email']
        }
    },
    {
        name: 'call_phone',
        description: 'Telefon araması yapmak için telefon uygulamasını açar.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                phone: {
                    type: Type.STRING,
                    description: 'Aranacak telefon numarası'
                }
            },
            required: ['phone']
        }
    },
    {
        name: 'open_map',
        description: 'Adresi Google Maps\'te gösterir.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                address: {
                    type: Type.STRING,
                    description: 'Gösterilecek adres'
                }
            },
            required: ['address']
        }
    }
];

// ============================================================================
// FUNCTION EXECUTORS
// ============================================================================

/**
 * Main function call executor
 */
export const executeFunctionCall = (
    functionName: string,
    args: Record<string, any>,
    documentText: string,
    noteTitle: string = 'Not'
): FunctionResult => {
    console.log('[ChatFunctions] Executing:', functionName, args);

    switch (functionName) {
        case 'extract_data':
            return executeExtractData(args.dataType, documentText);

        case 'add_to_calendar':
            return executeAddToCalendar(args.date, args.title, args.description);

        case 'add_to_contacts':
            return executeAddToContacts(args.name, args.phone, args.email, args.address);

        case 'save_to_excel':
            return executeSaveToExcel(args.dataType, documentText, noteTitle);

        case 'send_email':
            return executeSendEmail(args.email, args.subject);

        case 'call_phone':
            return executeCallPhone(args.phone);

        case 'open_map':
            return executeOpenMap(args.address);

        default:
            return { success: false, message: `Bilinmeyen fonksiyon: ${functionName}` };
    }
};

/**
 * Extract data from document
 */
const executeExtractData = (dataType: string, documentText: string): FunctionResult => {
    const allData = extractAllData(documentText, []);

    const typeMap: Record<string, keyof CategoryizedData> = {
        emails: 'emails',
        phones: 'phones',
        dates: 'dates',
        addresses: 'addresses',
        ibans: 'ibans',
        tckn: 'tckn',
        prices: 'prices'
    };

    const typeLabels: Record<string, string> = {
        emails: 'E-posta adresleri',
        phones: 'Telefon numaraları',
        dates: 'Tarihler',
        addresses: 'Adresler',
        ibans: 'IBAN\'lar',
        tckn: 'TC Kimlik numaraları',
        prices: 'Tutarlar',
        all: 'Tüm veriler'
    };

    if (dataType === 'all') {
        const results: string[] = [];
        let totalCount = 0;

        Object.entries(typeLabels).forEach(([key, label]) => {
            if (key === 'all') return;
            const items = allData[typeMap[key]];
            if (items && items.length > 0) {
                results.push(`\n**${label}:**`);
                items.forEach(item => {
                    results.push(`• ${item.value}`);
                    totalCount++;
                });
            }
        });

        if (totalCount === 0) {
            return { success: true, message: 'Bu belgede veri bulunamadı.' };
        }

        return {
            success: true,
            message: `**${totalCount} adet veri bulundu:**${results.join('\n')}`,
            data: Object.values(allData).flat()
        };
    }

    const key = typeMap[dataType];
    if (!key) {
        return { success: false, message: `Bilinmeyen veri türü: ${dataType}` };
    }

    const items = allData[key];
    if (!items || items.length === 0) {
        return {
            success: true,
            message: `Bu belgede ${typeLabels[dataType]?.toLowerCase() || dataType} bulunamadı.`
        };
    }

    const formattedItems = items.map(item => `• ${item.value}`).join('\n');
    return {
        success: true,
        message: `**${typeLabels[dataType]} (${items.length}):**\n${formattedItems}`,
        data: items
    };
};

/**
 * Add date to Google Calendar
 */
const executeAddToCalendar = (date: string, title: string, description?: string): FunctionResult => {
    try {
        // Parse DD.MM.YYYY
        const parts = date.split(/[.\/-]/);
        if (parts.length !== 3) {
            return { success: false, message: `Geçersiz tarih formatı: ${date}` };
        }

        const [day, month, year] = parts;
        const isoDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${isoDate}/${isoDate}&details=${encodeURIComponent(description || '')}`;

        // Use openExternalUrl for proper Electron support
        openExternalUrl(calendarUrl);

        return {
            success: true,
            message: `✅ **"${title}"** etkinliği ${date} tarihine eklenmek üzere Google Takvim açıldı.`
        };
    } catch (error: any) {
        return { success: false, message: `Takvim hatası: ${error.message}` };
    }
};

/**
 * Create vCard and download
 */
const executeAddToContacts = (name: string, phone?: string, email?: string, address?: string): FunctionResult => {
    try {
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${name}`,
            `N:${name.split(' ').reverse().join(';')};;;`,
            phone ? `TEL;TYPE=CELL:${phone}` : '',
            email ? `EMAIL:${email}` : '',
            address ? `ADR;TYPE=HOME:;;${address};;;;` : '',
            'END:VCARD'
        ].filter(Boolean).join('\n');

        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}.vcf`;
        a.click();
        URL.revokeObjectURL(url);

        return {
            success: true,
            message: `✅ **${name}** rehbere eklemek için vCard dosyası indirildi.`
        };
    } catch (error: any) {
        return { success: false, message: `Rehber hatası: ${error.message}` };
    }
};

/**
 * Save data to Excel
 */
const executeSaveToExcel = (dataType: string, documentText: string, noteTitle: string): FunctionResult => {
    try {
        const allData = extractAllData(documentText, []);
        exportToExcel(allData, noteTitle);

        return {
            success: true,
            message: `✅ Veriler **${noteTitle}_veri_avcisi.xlsx** dosyasına kaydedildi ve indirildi.`
        };
    } catch (error: any) {
        return { success: false, message: `Excel hatası: ${error.message}` };
    }
};

/**
 * Open email client
 */
const executeSendEmail = (email: string, subject?: string): FunctionResult => {
    const mailtoUrl = subject
        ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
        : `mailto:${email}`;

    window.location.href = mailtoUrl;

    return {
        success: true,
        message: `✅ **${email}** adresine e-posta göndermek için mail uygulaması açıldı.`
    };
};

/**
 * Open phone dialer
 */
const executeCallPhone = (phone: string): FunctionResult => {
    const cleanPhone = phone.replace(/\s/g, '');
    window.location.href = `tel:${cleanPhone}`;

    return {
        success: true,
        message: `✅ **${phone}** numarasını aramak için telefon uygulaması açıldı.`
    };
};

/**
 * Open address in Google Maps
 */
const executeOpenMap = (address: string): FunctionResult => {
    const encoded = encodeURIComponent(address);
    // Use openExternalUrl for proper Electron support
    openExternalUrl(`https://www.google.com/maps/search/?api=1&query=${encoded}`);

    return {
        success: true,
        message: `✅ **${address}** adresi Google Maps'te açıldı.`
    };
};
