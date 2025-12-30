
import { GoogleGenAI, Type } from '@google/genai';
import { Settings } from '../types';
import { CategoryizedData, ExtractedData } from './dataExtractor';

// Helper to find position of value in text for DataHunter compatibility
const findPosition = (fullText: string, value: string): number => {
    return fullText.indexOf(value);
};

// Helper to get context
const getContext = (fullText: string, value: string): string => {
    const idx = fullText.indexOf(value);
    if (idx === -1) return value;
    const start = Math.max(0, idx - 20);
    const end = Math.min(fullText.length, idx + value.length + 20);
    return '...' + fullText.substring(start, end) + '...';
};

export const extractDataWithAI = async (
    text: string,
    settings: Settings
): Promise<CategoryizedData> => {
    // Priority: Env Var > Settings (User input removed, but keeping fallback just in case)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || settings.geminiApiKey;

    if (!apiKey) {
        throw new Error("Gemini API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = settings.model || 'gemini-2.0-flash'; // Default to flash for speed

    const schema = {
        type: Type.OBJECT,
        properties: {
            phones: { type: Type.ARRAY, items: { type: Type.STRING } },
            ibans: { type: Type.ARRAY, items: { type: Type.STRING } },
            emails: { type: Type.ARRAY, items: { type: Type.STRING } },
            dates: { type: Type.ARRAY, items: { type: Type.STRING } },
            plates: { type: Type.ARRAY, items: { type: Type.STRING } },
            tckn: { type: Type.ARRAY, items: { type: Type.STRING } },
            prices: { type: Type.ARRAY, items: { type: Type.STRING } },
            urls: { type: Type.ARRAY, items: { type: Type.STRING } },
            addresses: { type: Type.ARRAY, items: { type: Type.STRING } },
            custom: { type: Type.ARRAY, items: { type: Type.STRING } }, // Catch-all for other specific IDs
        }
    };

    const customPatternsText = settings.customPatterns?.map(p =>
        `- "${p.label}": Look for data similar to this example format: "${p.pattern}"`
    ).join('\n    ') || '';

    const hasCustomPatterns = settings.customPatterns && settings.customPatterns.length > 0;

    const prompt = `
    Analyze the following text and extract structured data into the specified categories.
    
    Standard Categories:
    1. **Addresses**: Fix OCR errors (e.g. "K a r a k a r t a l" -> "Karakartal"). Look for "N:", "Nu:", "No:" as number indicators. Capture full address.
    2. **TCKN**: Extract 11 digit Turkish ID numbers.
    3. **Phones**: Extract Turkish phone numbers (05xx...).
    4. **Prices**: Extract amounts with currency (e.g. 1500 TL, 100 USD).
    5. **Dates**: Standardize to DD.MM.YYYY format.
    6. **Emails**: Handle Turkish characters correctly.
    ${hasCustomPatterns ? `
    7. **Custom Data (IMPORTANT)**: The user has defined these specific data types to extract:
    ${customPatternsText}
    
    For each custom data type, find ALL matching values in the text and return them in the 'custom' array.
    Format: "Label: ExtractedValue" (e.g., "Dosya Esas numarası: 2024/123")
    ` : ''}
    
    Text to Analyze:
    """
    ${text.slice(0, 10000)}
    """
    `;

    try {
        const result = await ai.models.generateContent({
            model: model,
            contents: { role: 'user', parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1, // Low temp for extraction accuracy
            }
        });

        const rawData = JSON.parse(result.text || '{}');

        // Map to ExtractedData format
        const mapToExtracted = (items: string[] | undefined, category: string): ExtractedData[] => {
            if (!items || !Array.isArray(items)) return [];
            return items.map(val => ({
                value: val,
                context: getContext(text, val),
                position: findPosition(text, val),
                category
            }));
        };

        return {
            phones: mapToExtracted(rawData.phones, 'phone'),
            ibans: mapToExtracted(rawData.ibans, 'iban'),
            emails: mapToExtracted(rawData.emails, 'email'),
            dates: mapToExtracted(rawData.dates, 'date'),
            plates: mapToExtracted(rawData.plates, 'plate'),
            tckn: mapToExtracted(rawData.tckn, 'tckn'),
            prices: mapToExtracted(rawData.prices, 'price'),
            urls: mapToExtracted(rawData.urls, 'url'),
            addresses: mapToExtracted(rawData.addresses, 'address'),
            custom: mapToExtracted(rawData.custom, 'custom'),
        };

    } catch (error) {
        console.error("AI Extraction Failed:", error);
        throw error;
    }
};
