import { GoogleGenAI, GenerateContentResponse, Type, Content } from '@google/genai';
import type { Settings, WebSource, ChatMessage, ApiProvider } from '../types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DEFAULT_MODELS = {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o',
    claude: 'claude-3-5-sonnet-20241022'
} as const;

const API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    claude: 'https://api.anthropic.com/v1/messages'
} as const;

const ERROR_MESSAGES = {
    QUOTA_EXCEEDED: 'API quota exceeded. Please try again later.',
    API_KEY_INVALID: 'Invalid API key. Please check your settings.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNKNOWN_ERROR: 'An unknown error occurred.'
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface StreamChunk {
    text: string;
    sources?: WebSource[];
    isSearching?: boolean; // Yeni: Arama yapıldığını gösterir
    searchQuery?: string; // Yeni: Arama sorgusunu gösterir
}

interface GenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxTokens?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converts base64 image data to Gemini's inlineData format
 */
const fileToGenerativePart = (mimeType: string, data: string) => ({
    inlineData: { mimeType, data }
});

/**
 * Enhanced error handler with specific error type detection
 */
const handleApiError = (error: any, provider: string): never => {
    console.error(`[${provider}] API Error:`, error);
    
    const errorMessage = (error.message || '').toLowerCase();
    const errorCode = error.code || error.status;

    // Quota/Rate limit errors
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorCode === 429) {
        throw new Error('QUOTA_EXCEEDED');
    }

    // Authentication errors
    if (
        errorMessage.includes('api key') || 
        errorMessage.includes('invalid_api_key') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('unauthorized') ||
        errorCode === 401
    ) {
        throw new Error('API_KEY_INVALID');
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
    }

    // Return original error message or generic error
    throw new Error(error.message || `${ERROR_MESSAGES.UNKNOWN_ERROR} (${provider})`);
};

/**
 * Extracts web sources from Gemini response
 */
const getWebSources = (response: GenerateContentResponse): WebSource[] => {
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (!groundingMetadata?.groundingChunks) return [];
    
    const sources: WebSource[] = [];
    const seenUris = new Set<string>(); // Duplicate kontrolü
    
    for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web && chunk.web.uri && !seenUris.has(chunk.web.uri)) {
            sources.push({
                uri: chunk.web.uri,
                title: chunk.web.title || 'Untitled Source'
            });
            seenUris.add(chunk.web.uri);
        }
    }
    
    return sources;
};

/**
 * Validates API key format
 */
const validateApiKey = (key: string | undefined, provider: string): string => {
    if (!key || key.trim().length === 0) {
        throw new Error(`API_KEY_INVALID`);
    }
    return key.trim();
};

/**
 * Gets generation config from settings
 */
const getGenerationConfig = (settings: Settings): GenerationConfig => ({
    temperature: settings.temperature ?? 0.7,
    topK: settings.topK ?? 40,
    topP: settings.topP ?? 0.95,
    maxTokens: settings.maxTokens ?? 2048
});

// ============================================================================
// STANDALONE AI FUNCTIONS
// ============================================================================

/**
 * Generates content using Gemini (non-streaming)
 * Used for context menu operations, image analysis, etc.
 */
export const generateContent = async (
    prompt: string,
    settings: Settings,
    image?: { mimeType: string; data: string },
    useWebSearch: boolean = false // Yeni: Web arama desteği
): Promise<string> => {
    try {
        const apiKey = validateApiKey(settings.geminiApiKey, 'Gemini');

        const ai = new GoogleGenAI({ apiKey });
        const model = settings.model || DEFAULT_MODELS.gemini;
        const config = getGenerationConfig(settings);

        const parts = image 
            ? [fileToGenerativePart(image.mimeType, image.data), { text: prompt }] 
            : [{ text: prompt }];

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: model,
                contents: { parts },
                config: {
                    temperature: config.temperature,
                    topK: config.topK,
                    topP: config.topP,
                    tools: useWebSearch ? [{ googleSearch: {} }] : undefined,
                    systemInstruction: useWebSearch 
                        ? "Use Google Search when the question requires current information or real-time data. Always cite your sources with numbered references."
                        : undefined
                }
            });

        return response.text;
    } catch (error: any) {
        handleApiError(error, 'Gemini');
    }
};

/**
 * Generates tags for notes using AI with structured output
 */
export const generateTagsForNote = async (
    noteContent: string,
    settings: Settings
): Promise<string[]> => {
    if (!noteContent.trim()) return [];
    
    try {
        const apiKey = validateApiKey(settings.geminiApiKey, 'Gemini');

        const ai = new GoogleGenAI({ apiKey });
        const model = settings.model || DEFAULT_MODELS.gemini;
        
        const prompt = `Based on the following note content, suggest 3-5 relevant, single-word or two-word tags. Return only the tags as a JSON object with a "tags" key containing an array of strings. For example: {"tags": ["technology", "react-js"]}.\n\nNote:\n"${noteContent}"`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.2,
                topK: 10,
                topP: 0.9,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tags: {
                            type: Type.ARRAY,
                            description: 'A list of 3-5 relevant tags.',
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['tags']
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed && Array.isArray(parsed.tags)) {
            const sanitizedTags = (parsed.tags as unknown[])
                .map((tag: unknown) => String(tag).toLowerCase().replace(/\s+/g, '-').trim())
                .filter(tag => tag.length > 0 && tag.length <= 30); // Max tag length
            return [...new Set(sanitizedTags)].slice(0, 5); // Max 5 tags
        }
        return [];
    } catch (error: any) {
        console.error('Error generating tags:', error);
        return []; // Silent fail for tags
    }
};

/**
 * Yeni: Web araması gerekli mi kontrol eder
 */
const shouldUseWebSearch = (message: string): boolean => {
    const webSearchTriggers = [
        // Zaman ifadeleri
        'bugün', 'today', 'şu an', 'now', 'güncel', 'current',
        'son', 'latest', 'yeni', 'new', 'recent',
        
        // Soru kelimeleri + güncel bilgi
        'hava durumu', 'weather', 'fiyat', 'price',
        'haber', 'news', 'olay', 'event',
        
        // Direkt arama isteği
        'ara', 'search', 'bul', 'find',
        'araştır', 'research', 'incele', 'investigate'
    ];

    const lowerMessage = message.toLowerCase();
    return webSearchTriggers.some(trigger => lowerMessage.includes(trigger));
};

// ============================================================================
// STREAMING IMPLEMENTATIONS
// ============================================================================

/**
 * Gemini Streaming with Enhanced Web Search
 */
async function* streamGemini(
    history: ChatMessage[],
    settings: Settings,
    forceWebSearch: boolean,
    editorContext?: EditorContext
): AsyncGenerator<StreamChunk> {
    try {
        const apiKey = validateApiKey(settings.geminiApiKey, 'Gemini');

        const ai = new GoogleGenAI({ apiKey });
        const model = settings.model || DEFAULT_MODELS.gemini;
        const config = getGenerationConfig(settings);

        // Son mesajı kontrol et
        const lastMessage = history[history.length - 1]?.content || '';
        const autoDetectSearch = shouldUseWebSearch(lastMessage);
        const useWebSearch = forceWebSearch || autoDetectSearch;

        // Web arama aktifse bildir
        if (useWebSearch) {
            yield {
                text: '',
                isSearching: true,
                searchQuery: lastMessage.substring(0, 100)
            };
        }

        const contents: Content[] = [];

        // prepend editor context if provided
        if (editorContext && (editorContext.text || (editorContext.images && editorContext.images.length > 0))) {
            const ctxParts: any[] = [];
            if (editorContext.images && editorContext.images.length > 0) {
                for (const img of editorContext.images) {
                    ctxParts.push(fileToGenerativePart(img.mimeType, img.data));
                }
            }
            if (editorContext.text) {
                ctxParts.push({ text: `Document context from editor (plain text):\n\n${editorContext.text.slice(0, 8000)}` });
            }
            contents.push({ role: 'user', parts: ctxParts });
        }

        contents.push(
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        );

        const systemInstruction = useWebSearch
            ? `You are an AI assistant with access to Google Search. When answering questions:

1. ALWAYS use Google Search for:
   - Current events, news, or recent information
   - Real-time data (weather, stock prices, etc.)
   - Questions about specific dates or time-sensitive information
   - Fact-checking or verification requests

2. After searching:
   - Provide comprehensive answers based on search results
   - ALWAYS cite your sources with [1], [2], etc.
   - Include the source URL and title at the end
   - If search results are insufficient, state this clearly

3. Response format:
   - Main answer with inline citations
   - List of sources at the end

Example:
"According to recent reports [1], the temperature today is 25°C [2].

Sources:
[1] Weather.com - Today's Forecast
[2] AccuWeather - Current Conditions"`
            : "You are a helpful AI assistant. Provide clear, accurate, and comprehensive answers.";

        const stream = await ai.models.generateContentStream({
            model,
            contents,
            config: {
                systemInstruction,
                temperature: config.temperature,
                topK: config.topK,
                topP: config.topP,
                tools: useWebSearch ? [{ googleSearch: {} }] : undefined
            }
        });

        let hasYieldedSearching = false;
        for await (const chunk of stream) {
            // İlk chunk'ta arama bilgisini kaldır
            if (!hasYieldedSearching && useWebSearch) {
                yield { text: '', isSearching: false };
                hasYieldedSearching = true;
            }

            const sources = getWebSources(chunk);
            yield {
                text: chunk.text,
                sources: sources.length > 0 ? sources : undefined
            };
        }
    } catch (error: any) {
        handleApiError(error, 'Gemini');
    }
}

/**
 * OpenAI Streaming Implementation
 */
async function* streamOpenAI(
    history: ChatMessage[],
    settings: Settings,
    editorContext?: EditorContext
): AsyncGenerator<StreamChunk> {
    try {
        // FIX: The API key was being accessed from a non-existent `apiKeys` object.
        // Changed to access `openaiApiKey` directly from the `settings` object.
        const apiKey = validateApiKey(settings.openaiApiKey, 'OpenAI');
        const config = getGenerationConfig(settings);

        const messages = [] as { role: 'assistant'|'user'|'system'; content: string }[];
        if (editorContext && (editorContext.text || (editorContext.images && editorContext.images.length))) {
            messages.push({
                role: 'system',
                content: `User's document context (text only shown here). Use it when relevant.\n\n${(editorContext.text||'').slice(0, 8000)}`
            });
        }
        messages.push(
            ...history.map(({ role, content }): { role: 'assistant'|'user'|'system'; content: string } => ({
                role: (role === 'model' ? 'assistant' : 'user') as 'assistant'|'user',
                content
            }))
        );

        const response = await fetch(API_ENDPOINTS.openai, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: settings.model || DEFAULT_MODELS.openai,
                messages,
                stream: true,
                temperature: config.temperature,
                max_tokens: config.maxTokens
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6).trim();
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const chunk = parsed.choices[0]?.delta?.content;
                        if (chunk) {
                            yield { text: chunk };
                        }
                    } catch (e) {
                        console.warn('Failed to parse OpenAI chunk:', data);
                    }
                }
            }
        }
    } catch (error: any) {
        handleApiError(error, 'OpenAI');
    }
}

/**
 * Claude (Anthropic) Streaming Implementation
 */
async function* streamClaude(
    history: ChatMessage[],
    settings: Settings,
    editorContext?: EditorContext
): AsyncGenerator<StreamChunk> {
    try {
        // FIX: The API key was being accessed from a non-existent `apiKeys` object.
        // Changed to access `claudeApiKey` directly from the `settings` object.
        const apiKey = validateApiKey(settings.claudeApiKey, 'Claude');
        const config = getGenerationConfig(settings);

        const messages = [] as { role: 'assistant'|'user'|'system'; content: string }[];
        if (editorContext && (editorContext.text || (editorContext.images && editorContext.images.length))) {
            messages.push({
                role: 'system',
                content: `User's document context (text only):\n\n${(editorContext.text||'').slice(0, 8000)}`
            });
        }
        messages.push(
            ...history.map(({ role, content }): { role: 'assistant'|'user'|'system'; content: string } => ({
                role: (role === 'model' ? 'assistant' : 'user') as 'assistant'|'user',
                content
            }))
        );

        // Claude requires last message to be from user
        if (messages.length > 0 && messages[messages.length - 1]?.role !== 'user') {
            messages.pop();
        }

        const response = await fetch(API_ENDPOINTS.claude, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: settings.model || DEFAULT_MODELS.claude,
                messages,
                stream: true,
                max_tokens: config.maxTokens || 4096,
                temperature: config.temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const parsed = JSON.parse(line.substring(6));
                        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                            yield { text: parsed.delta.text };
                        }
                    } catch (e) {
                        console.warn('Failed to parse Claude chunk:', line);
                    }
                }
            }
        }
    } catch (error: any) {
        handleApiError(error, 'Claude');
    }
}

// ============================================================================
// MAIN CHAT STREAM DISPATCHER
// ============================================================================

/**
 * Main chat streaming function with automatic web search detection
 * 
 * @param history - Full chat history
 * @param settings - User settings including API keys and model config
 * @param forceWebSearch - Force web search regardless of content (default: false)
 * @returns AsyncGenerator yielding text chunks and optional sources
 */
export type EditorContext = { text?: string; images?: { mimeType: string; data: string }[] };

export async function* getChatStream(
    history: ChatMessage[],
    settings: Settings,
    forceWebSearch: boolean = false, // Varsayılan olarak otomatik tespit aktif
    editorContext?: EditorContext
): AsyncGenerator<StreamChunk> {
    const provider: ApiProvider = settings.apiProvider || 'gemini';

    // Validate history
    if (!history || history.length === 0) {
        throw new Error('Chat history is empty');
    }

    try {
        switch (provider) {
            case 'openai':
                yield* streamOpenAI(history, settings, editorContext);
                break;
            
            case 'claude':
                yield* streamClaude(history, settings, editorContext);
                break;
            
            case 'gemini':
            default:
                yield* streamGemini(history, settings, forceWebSearch, editorContext);
                break;
        }
    } catch (error: any) {
        handleApiError(error, provider);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Yeni: API sağlayıcısının durumunu kontrol eder
 */
export const checkProviderStatus = async (
    provider: ApiProvider,
    apiKey: string
): Promise<{ status: 'ok' | 'error'; message: string }> => {
    try {
        switch (provider) {
            case 'gemini':
                const ai = new GoogleGenAI({ apiKey });
                await ai.models.generateContent({
                    model: DEFAULT_MODELS.gemini,
                    contents: { parts: [{ text: 'test' }] }
                });
                return { status: 'ok', message: 'Gemini API is working' };
            
            case 'openai':
                const openaiRes = await fetch(API_ENDPOINTS.openai, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: DEFAULT_MODELS.openai,
                        messages: [{ role: 'user', content: 'test' }],
                        max_tokens: 5
                    })
                });
                if (!openaiRes.ok) throw new Error('OpenAI API error');
                return { status: 'ok', message: 'OpenAI API is working' };
            
            case 'claude':
                const claudeRes = await fetch(API_ENDPOINTS.claude, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: DEFAULT_MODELS.claude,
                        messages: [{ role: 'user', content: 'test' }],
                        max_tokens: 5
                    })
                });
                if (!claudeRes.ok) throw new Error('Claude API error');
                return { status: 'ok', message: 'Claude API is working' };
            
            default:
                throw new Error('Unknown provider');
        }
    } catch (error: any) {
        return { status: 'error', message: error.message };
    }
};

/**
 * Yeni: Web arama sonuçlarını formatlar
 */
export const formatWebSources = (sources: WebSource[]): string => {
    if (!sources || sources.length === 0) return '';
    
    let formatted = '\n\n**Kaynaklar:**\n';
    sources.forEach((source, index) => {
        formatted += `[${index + 1}] ${source.title}\n${source.uri}\n`;
    });
    
    return formatted;
};
