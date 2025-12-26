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

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    sources?: WebSource[];
    imagePreview?: string;
}
