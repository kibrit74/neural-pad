import type { Note } from '../types';
import { getSupabaseClient } from './supabaseClient';
import { authService } from './authService';

// Check if running in Electron
const isElectron = () => typeof window !== 'undefined' && (window as any)?.electron?.db;

// HTML to plain text converter
const htmlToPlainText = (html: string): string => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('img').forEach(img => {
        const placeholder = document.createTextNode('[Image]');
        img.parentNode?.replaceChild(placeholder, img);
    });
    tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, ' ');
    return tempDiv.textContent || tempDiv.innerText || '';
};

// =====================================================
// SUPABASE ADAPTER (Web)
// =====================================================

const supabaseAdapter = {
    async saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'plainTextContent'> & { id?: number | string }): Promise<number> {
        const supabase = getSupabaseClient();

        // Use authService instead of direct Supabase check
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('User not authenticated');

        console.log('[DB] saveNote called for:', note.id, 'Content size:', note.content?.length);

        const plainTextContent = htmlToPlainText(note.content);
        const noteData = {
            user_id: currentUser.id,
            title: note.title,
            content: note.content,
            plain_text_content: plainTextContent,
            tags: note.tags || null,
            is_pinned: note.isPinned || false,
            is_locked: note.isLocked || false,
            encrypted: note.encrypted || null,
            reminder: note.reminder ? new Date(note.reminder).toISOString() : null,
        };

        if (note.id && typeof note.id === 'string') {
            // Update existing note
            console.log('[DB] Updating note:', note.id);
            const { error } = await supabase
                .from('notes')
                .update(noteData)
                .eq('id', note.id);

            if (error) {
                console.error('[DB] Update error:', error);
                console.error('[DB] Error details:', JSON.stringify(error, null, 2));
                console.error('[DB] Error message:', error.message);
                console.error('[DB] Error code:', error.code);
                throw error;
            }
            console.log('[DB] Update successful');
            // Return the UUID as a string (cast to number for type compatibility)
            return note.id as any;
        } else {
            // Insert new note
            const { data, error } = await supabase
                .from('notes')
                .insert(noteData)
                .select('id')
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from insert');
            // Return the inserted note's UUID (cast to number for type compatibility)
            return data.id as any;
        }
    },

    async getAllNotes(): Promise<Note[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        console.log('[DB] getAllNotes - Raw data from Supabase:', data?.length, 'notes');
        if (data && data.length > 0) {
            console.log('[DB] First note content length:', data[0].content?.length);
            console.log('[DB] First note has image:', data[0].content?.includes('<img'));
        }

        return (data || []).map(note => ({
            id: note.id as any, // UUID as string
            title: note.title,
            content: note.content,
            plainTextContent: note.plain_text_content,
            tags: note.tags || [],
            isPinned: note.is_pinned,
            isLocked: note.is_locked,
            encrypted: note.encrypted,
            reminder: note.reminder ? new Date(note.reminder) : null,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
        }));
    },

    async getNote(id: number | string): Promise<Note | undefined> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return undefined;

        return {
            id: data.id as any,
            title: data.title,
            content: data.content,
            plainTextContent: data.plain_text_content,
            tags: data.tags || [],
            isPinned: data.is_pinned,
            isLocked: data.is_locked,
            encrypted: data.encrypted,
            reminder: data.reminder ? new Date(data.reminder) : null,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    },

    async getHistory(noteId: number | string): Promise<{ id: number; noteId: number; title: string; content: string; timestamp: Date }[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('note_history')
            .select('*')
            .eq('note_id', noteId)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        return (data || []).map(h => ({
            id: 0, // Not used
            noteId: 0, // Not used
            title: h.title,
            content: h.content,
            timestamp: new Date(h.timestamp),
        }));
    },

    async deleteNote(id: number | string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// =====================================================
// ELECTRON ADAPTER (Desktop)
// =====================================================

const electronAdapter = {
    async saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'plainTextContent'> & { id?: number }): Promise<number> {
        const dbApi = (window as any).electron.db;
        const plainTextContent = htmlToPlainText(note.content);
        const noteWithPlainText = { ...note, plainTextContent };
        return dbApi.saveNote(noteWithPlainText);
    },

    async getAllNotes(): Promise<Note[]> {
        const dbApi = (window as any).electron.db;
        return dbApi.getAllNotes();
    },

    async getNote(id: number): Promise<Note | undefined> {
        const dbApi = (window as any).electron.db;
        return dbApi.getNote(id);
    },

    async getHistory(noteId: number): Promise<{ id: number; noteId: number; title: string; content: string; timestamp: Date }[]> {
        const dbApi = (window as any).electron.db;
        return dbApi.getHistory(noteId);
    },

    async deleteNote(id: number): Promise<void> {
        const dbApi = (window as any).electron.db;
        return dbApi.deleteNote(id);
    },
};

// =====================================================
// UNIFIED DATABASE API
// =====================================================

const getAdapter = () => {
    return isElectron() ? electronAdapter : supabaseAdapter;
};

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'plainTextContent'> & { id?: number | string }): Promise<number> => {
    return getAdapter().saveNote(note as any);
};

export const getAllNotes = async (): Promise<Note[]> => {
    return getAdapter().getAllNotes();
};

export const getNote = async (id: number | string): Promise<Note | undefined> => {
    return getAdapter().getNote(id as any);
};

export const getHistory = async (noteId: number | string): Promise<{ id: number; noteId: number; title: string; content: string; timestamp: Date }[]> => {
    return getAdapter().getHistory(noteId as any);
};

export const deleteNote = async (id: number | string): Promise<void> => {
    return getAdapter().deleteNote(id as any);
};