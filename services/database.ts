import type { Note } from '../types';

// Select the appropriate DB API based on environment (Electron vs Web)
const getDbApi = async (): Promise<any> => {
    const electronApi = (window as any)?.electron?.db;
    if (electronApi) return electronApi;
    // Fallback to browser IndexedDB implementation in web environment
    const webDb = await import('../utils/db-indexeddb');
    return webDb;
};

const htmlToPlainText = (html: string): string => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Replace images with a placeholder text like "[Image]"
    tempDiv.querySelectorAll('img').forEach(img => {
        const placeholder = document.createTextNode('[Image]');
        img.parentNode?.replaceChild(placeholder, img);
    });
    
    // Replace line breaks with spaces for better plain text conversion
    tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, ' ');
    return tempDiv.textContent || tempDiv.innerText || '';
};

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'plainTextContent'> & { id?: number }): Promise<number> => {
    const dbApi = await getDbApi();
    const plainTextContent = htmlToPlainText(note.content);
    const noteWithPlainText = { ...note, plainTextContent };
    return dbApi.saveNote(noteWithPlainText);
};

export const getAllNotes = async (): Promise<Note[]> => {
    const dbApi = await getDbApi();
    return dbApi.getAllNotes();
};

export const getNote = async (id: number): Promise<Note | undefined> => {
    const dbApi = await getDbApi();
    return dbApi.getNote(id);
};

export const getHistory = async (noteId: number): Promise<{ id: number; noteId: number; title: string; content: string; timestamp: Date }[]> => {
    const dbApi = await getDbApi();
    return dbApi.getHistory(noteId);
};

export const deleteNote = async (id: number): Promise<void> => {
    const dbApi = await getDbApi();
    return dbApi.deleteNote(id);
};