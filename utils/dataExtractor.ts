export interface ExtractedData {
    value: string;
    context: string;
    position: number;
    category: string;
}

export interface CustomPattern {
    id: string;
    label: string;
    pattern: string;
    category: 'custom';
    isPlainText?: boolean; // If true, pattern is treated as plain text instead of regex
}

export interface CategoryizedData {
    phones: ExtractedData[];
    ibans: ExtractedData[];
    emails: ExtractedData[];
    dates: ExtractedData[];
    plates: ExtractedData[];
    tckn: ExtractedData[];
    prices: ExtractedData[];
    urls: ExtractedData[];
    addresses: ExtractedData[];
    custom: ExtractedData[];
}

// Helper: Strip HTML tags and get plain text
const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

// Helper: Extract context around match
const extractContext = (text: string, index: number, matchLength: number, contextSize: number = 40): string => {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + matchLength + contextSize);
    let context = text.slice(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context.trim();
};

// Turkish phone number patterns
// Formats: 0532 xxx xx xx, +90 532 xxx xx xx, 0(532) xxx xx xx, 532 xxx xx xx
export const extractPhoneNumbers = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];
    const seen = new Set<string>();

    const pattern = /(?:\+90|0)?\s*[1-9]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}\b/g;

    let match;
    while ((match = pattern.exec(text)) !== null) {
        let value = match[0];

        // Cleanup
        const cleanNumber = value.replace(/[\s\-\(\)]/g, '');

        if (cleanNumber.length < 10 || cleanNumber.length > 12) continue;

        if (seen.has(cleanNumber)) continue;
        seen.add(cleanNumber);

        results.push({
            value,
            context: extractContext(text, match.index, value.length),
            position: match.index,
            category: 'phone'
        });
    }

    return results;
};

// Turkish IBAN pattern: TR + 2 check digits + 24 digits
export const extractIBANs = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];

    const pattern = /TR\s?(\d{2})\s?(\d{4}\s?){5}\d{2}/gi;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        const value = match[0].replace(/\s/g, ''); // Remove spaces for cleaner display
        results.push({
            value,
            context: extractContext(text, match.index, match[0].length),
            position: match.index,
            category: 'iban'
        });
    }

    return results;
};

// Email pattern - properly handles consecutive emails like "test@hotmail.comuser@gmail.com"
export const extractEmails = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];
    const seen = new Set<string>(); // Deduplication

    // Common TLDs to detect email boundaries
    const commonTLDs = ['com', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'co', 'info', 'biz',
        'tr', 'uk', 'de', 'fr', 'ru', 'jp', 'cn', 'br', 'au', 'in', 'it', 'es',
        'com.tr', 'org.tr', 'edu.tr', 'gov.tr', 'net.tr'];

    // Find all @ symbols first, then build emails around them
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '@') {
            // Extract local part (before @)
            // But stop if we hit a TLD boundary (e.g., ".com" at end of previous email)
            let localStart = i - 1;
            let foundTLDBoundary = false;

            while (localStart >= 0 && /[a-zA-Z0-9._%+-]/.test(text[localStart])) {
                // Check if we're at a TLD boundary
                for (const tld of commonTLDs) {
                    const tldWithDot = '.' + tld;
                    const checkStart = localStart - tld.length;
                    if (checkStart >= 0) {
                        const potentialTLD = text.substring(checkStart, localStart + 1).toLowerCase();
                        if (potentialTLD === tldWithDot) {
                            localStart = localStart + 1;
                            foundTLDBoundary = true;
                            break;
                        }
                    }
                }
                if (foundTLDBoundary) break;
                localStart--;
            }

            if (!foundTLDBoundary) localStart++;

            // Extract domain part (after @)
            let domainEnd = i + 1;
            let lastDotPos = -1;

            while (domainEnd < text.length && /[a-zA-Z0-9.-]/.test(text[domainEnd])) {
                if (text[domainEnd] === '.') lastDotPos = domainEnd;
                domainEnd++;
            }

            if (lastDotPos > i) {
                const tldPart = text.substring(lastDotPos + 1, domainEnd);
                if (tldPart.length >= 2 && /^[a-zA-Z]+$/.test(tldPart)) {
                    domainEnd = lastDotPos + 1 + tldPart.length;

                    const localPart = text.substring(localStart, i);
                    const domainPart = text.substring(i + 1, domainEnd);

                    if (localPart.length > 0 && !localPart.startsWith('.')) {
                        const value = localPart + '@' + domainPart;
                        const lowerValue = value.toLowerCase();

                        if (seen.has(lowerValue)) continue;
                        seen.add(lowerValue);

                        results.push({
                            value,
                            context: extractContext(text, localStart, value.length),
                            position: localStart,
                            category: 'email'
                        });
                    }
                }
            }
        }
    }

    return results;
};

// Turkish date patterns: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
export const extractDates = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];

    const pattern = /(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);

        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
            results.push({
                value: match[0],
                context: extractContext(text, match.index, match[0].length, 50),
                position: match.index,
                category: 'date'
            });
        }
    }

    return results;
};

// Turkish license plate pattern: XX ABC 1234 or XX ABC 12 or XX A 1234
export const extractLicensePlates = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];

    const pattern = /\b(\d{2})\s?([A-Z]{1,3})\s?(\d{2,4})\b/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        const plateCode = parseInt(match[1]);
        if (plateCode >= 1 && plateCode <= 81) {
            results.push({
                value: match[0],
                context: extractContext(text, match.index, match[0].length),
                position: match.index,
                category: 'plate'
            });
        }
    }

    return results;
};

// TC Kimlik No: 11 digits with validation
export const extractTCKN = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];

    const pattern = /\b[1-9]\d{10}\b/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        const tckn = match[0];
        if (validateTCKN(tckn)) {
            results.push({
                value: tckn,
                context: extractContext(text, match.index, tckn.length),
                position: match.index,
                category: 'tckn'
            });
        }
    }

    return results;
};

const validateTCKN = (tckn: string): boolean => {
    if (tckn.length !== 11) return false;
    const digits = tckn.split('').map(Number);
    if (digits[0] === 0) return false;
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
    const digit10 = ((sum1 * 7) - sum2) % 10;
    if (digits[9] !== digit10) return false;
    const sum3 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    const digit11 = sum3 % 10;
    return digits[10] === digit11;
};

// Money/price patterns: 1.250,00 TL, $1,250.00, etc
export const extractPrices = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];

    const patterns = [
        /(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s?(TL|TRY|₺|Lira)/gi,
        /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /€\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,
        /(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s?(Dolar|Euro|Sterlin|Pound)/gi,
        /(?:Tutar|Toplam|Fiyat|Bedel|KDV|Matrah)[:\s]+(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)/gi,
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            results.push({
                value: match[0],
                context: extractContext(text, match.index, match[0].length),
                position: match.index,
                category: 'price'
            });
        }
    });

    return results;
};

// URL patterns: http, https, www links
export const extractURLs = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];
    const seen = new Set<string>();

    const pattern = /(?:https?:\/\/|www\.)[^\s<>"{}|\\^`\[\]]+/gi;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        let value = match[0].replace(/[.,;:!?)]+$/, '');
        if (seen.has(value.toLowerCase())) continue;
        seen.add(value.toLowerCase());

        results.push({
            value,
            context: extractContext(text, match.index, value.length),
            position: match.index,
            category: 'url'
        });
    }

    return results;
};

// Turkish address patterns
export const extractAddresses = (html: string): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];
    const seen = new Set<string>();

    const stopLookahead = '(?!(?:CEP|TEL|KONU|SAYIN|ADRES|TC|T\\.C\\.|MAHKEMESİ|MAHKEME|DAVACI|DAVALI|E-POSTA|EMAIL))';

    const patterns = [
        /(?:(?:[A-ZÇĞİÖŞÜa-zçğıöşü0-9]+\s+){1,4})?(?:Mahallesi|Mah\.|Mh\.)\s+(?:[A-ZÇĞİÖŞÜa-zçğıöşü0-9\/\-]+\s+){0,6}(?:Cad\.|Caddesi|Sd\.|Sok\.|Sokak|Sk\.|Bulvarı|Bulv\.|Blv\.|Meydanı|Yolu|Küme Evleri|Evleri|Han|Plaza|Sitesi|Merkezi|Blok|Apt\.|Apartmanı)(?:[^,:\n]|,(?!\s*(?:CEP|TEL|KONU)))*?(?:(?:No|N|Nu|Numara)[:\.\s]*\d+[^,\n]*)?/gi,
        /(?:(?:[A-ZÇĞİÖŞÜa-zçğıöşü0-9]+\s+){1,4})?(?:Caddesi|Cad\.|Sd\.|Sokak|Sok\.|Sk\.|Bulvarı|Bulv\.|Blv\.|Meydanı|Hanı|Pasajı|Plaza|Sitesi|Apartmanı|Apt\.|Blok|Center|İş Merkezi)(?:[^,:\n]|,(?!\s*(?:CEP|TEL|KONU)))*?(?:(?:No|N|Nu|Numara)[:\.\s]*\d+[^,\n]*)?/gi,
        /(?:[A-ZÇĞİÖŞÜa-zçğıöşü0-9\.]+\s+(?:Mah\.|Mahallesi|Mh\.)\s+)?(?:[A-ZÇĞİÖŞÜa-zçğıöşü0-9\.]+\s+(?:Cad\.|Caddesi|Sok\.|Sokak|Bulvarı|Bulv\.|Cd\.|Sk\.)\s+)?[^,\n]+(?:(?:No|N|Nu|Numara)[:\.\s]*\d+[^,\n]*)?(?:\/\d+)?(?:[A-ZÇĞİÖŞÜa-zçğıöşü\s]+\/[A-ZÇĞİÖŞÜa-zçğıöşü\s]+)/gi,
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            let value = match[0].trim();
            const stopWords = ['CEP', 'TEL', 'KONU', 'SAYIN', 'TC', 'T.C', 'ADRES', 'EMAİL', 'E-POSTA'];
            for (const word of stopWords) {
                const idx = value.toUpperCase().indexOf(word);
                if (idx > 5) value = value.substring(0, idx).trim();
            }
            value = value.replace(/[.,:;\-\/]+$/, '');
            if (value.length < 15) continue;
            if (/^[\d\s\/.\-]+$/.test(value)) continue;

            const normalized = value.toLowerCase().replace(/\s+/g, ' ');
            if (seen.has(normalized)) continue;
            seen.add(normalized);

            results.push({
                value,
                context: extractContext(text, match.index, value.length, 60),
                position: match.index,
                category: 'address'
            });
        }
    });

    return results;
};

export const extractCustomPatterns = (html: string, patterns: CustomPattern[]): ExtractedData[] => {
    const text = stripHtml(html);
    const results: ExtractedData[] = [];

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    patterns.forEach(customPattern => {
        try {
            let regex: RegExp;
            if (customPattern.isPlainText) {
                const escapedPattern = escapeRegex(customPattern.pattern);
                regex = new RegExp(escapedPattern, 'gi');
            } else {
                regex = new RegExp(customPattern.pattern, 'gi');
            }

            let match;
            while ((match = regex.exec(text)) !== null) {
                const value = match[1] || match[0];
                results.push({
                    value,
                    context: extractContext(text, match.index, match[0].length),
                    position: match.index,
                    category: `custom:${customPattern.label}`
                });
            }
        } catch (error) {
            console.error(`Invalid pattern for ${customPattern.label}:`, error);
        }
    });

    return results;
};

const isOverlapping = (start1: number, end1: number, start2: number, end2: number): boolean => {
    return Math.max(start1, start2) < Math.min(end1, end2);
};

export const extractAllData = (html: string, customPatterns: CustomPattern[] = []): CategoryizedData => {
    const phones = extractPhoneNumbers(html);
    const ibans = extractIBANs(html);
    const emails = extractEmails(html);
    const dates = extractDates(html);
    const plates = extractLicensePlates(html);
    const tckn = extractTCKN(html);
    const prices = extractPrices(html);
    const addresses = extractAddresses(html);
    const urls = extractURLs(html);
    const custom = extractCustomPatterns(html, customPatterns);

    const allData: { data: ExtractedData, end: number, type: string, priority: number }[] = [];

    const pushWithPriority = (items: ExtractedData[], type: string, priority: number) => {
        items.forEach(item => {
            allData.push({
                data: item,
                end: item.position + item.value.length,
                type: type,
                priority
            });
        });
    };

    pushWithPriority(custom, 'custom', 10);
    pushWithPriority(tckn, 'tckn', 9.5);
    pushWithPriority(addresses, 'addresses', 9);
    pushWithPriority(urls, 'urls', 8);
    pushWithPriority(emails, 'emails', 7);
    pushWithPriority(phones, 'phones', 6);
    pushWithPriority(ibans, 'ibans', 4);
    pushWithPriority(plates, 'plates', 3);
    pushWithPriority(dates, 'dates', 2);
    pushWithPriority(prices, 'prices', 1);

    allData.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.data.position - b.data.position;
    });

    const acceptedItems = new Map<string, ExtractedData[]>();
    const occupiedRanges: { start: number, end: number }[] = [];

    ['phones', 'ibans', 'emails', 'dates', 'plates', 'tckn', 'prices', 'custom', 'addresses', 'urls'].forEach(key => {
        acceptedItems.set(key, []);
    });

    for (const item of allData) {
        const start = item.data.position;
        const end = item.end;
        let overlaps = false;

        for (const range of occupiedRanges) {
            if (isOverlapping(start, end, range.start, range.end)) {
                overlaps = true;
                break;
            }
        }

        if (!overlaps) {
            occupiedRanges.push({ start, end });
            const list = acceptedItems.get(item.type);
            if (list) list.push(item.data);
        }
    }

    acceptedItems.forEach(list => list.sort((a, b) => a.position - b.position));

    return {
        phones: acceptedItems.get('phones') || [],
        ibans: acceptedItems.get('ibans') || [],
        emails: acceptedItems.get('emails') || [],
        dates: acceptedItems.get('dates') || [],
        plates: acceptedItems.get('plates') || [],
        tckn: acceptedItems.get('tckn') || [],
        prices: acceptedItems.get('prices') || [],
        custom: acceptedItems.get('custom') || [],
        addresses: acceptedItems.get('addresses') || [],
        urls: acceptedItems.get('urls') || [],
    };
};
