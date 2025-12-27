import React from 'react';

export type ApiProvider = 'gemini' | 'openai' | 'claude';

export interface Settings {
    model: string;
    temperature: number;
    topK: number;
    topP: number;
    apiProvider: ApiProvider;
    autoSave?: boolean;
    openaiApiKey?: string;
    claudeApiKey?: string;
    geminiApiKey?: string;
    // FIX: Add optional `maxTokens` property to align with its usage in geminiService.
    maxTokens?: number;
    // Custom data extraction patterns
    customPatterns?: Array<{
        id: string;
        label: string;
        pattern: string;
        category: 'custom';
        isPlainText?: boolean;
    }>;
}

export interface ContextMenuItem {
    actionId: string;
    label: string;
    icon: React.ReactNode;
}

export interface NotificationType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning';
    persistent?: boolean;
    onClick?: () => void;
}

export interface EncryptedPayload {
    salt: string;
    iv: string;
    data: string;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    plainTextContent?: string;
    isPinned?: boolean;
    // Password protection
    isLocked?: boolean;
    encrypted?: EncryptedPayload | null;
    // Reminder
    reminder?: Date | null;
}

export interface WebSource {
    uri: string;
    title: string;
}

// Tool calling types for chatbot
export type ToolDataType = 'dates' | 'phones' | 'emails' | 'addresses' | 'ibans' | 'tckn' | 'prices' | 'custom' | 'all';

export interface ToolAction {
    id: string;
    label: string;
    icon: string; // emoji
    type: 'calendar' | 'call' | 'email' | 'map' | 'excel' | 'copy';
}

export interface ExtractedItem {
    value: string;
    context: string;
}

export interface ToolResult {
    type: ToolDataType;
    label: string;
    items: ExtractedItem[];
    actions: ToolAction[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    sources?: WebSource[];
    imagePreview?: string;
    toolResults?: ToolResult[]; // Data extraction results with action buttons
}
