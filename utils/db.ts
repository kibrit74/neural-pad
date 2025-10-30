
import type { Note } from '../types';

const DB_NAME = 'GeminiWriterDB';
const DB_VERSION = 3;
const STORE_NAME = 'notes';

let db: IDBDatabase;

// Request persistent storage to prevent browser from auto-deleting data
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((persistent) => {
        if (persistent) {
            console.log('✅ Storage will not be cleared automatically by the browser.');
        } else {
            console.warn('⚠️ Storage may be cleared by the browser under storage pressure.');
        }
    });
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database error:', request.error);
            reject('Error opening database');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            const oldVersion = (event as any).oldVersion;
            
            console.log(`Database upgrade: v${oldVersion} -> v${DB_VERSION}`);
            
            let store;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            } else {
                 store = (event.target as any).transaction.objectStore(STORE_NAME);
            }
            
            if (!store.indexNames.contains('tags')) {
                store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
            }

            if (!dbInstance.objectStoreNames.contains('history')) {
                const history = dbInstance.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                history.createIndex('noteId', 'noteId', { unique: false });
                history.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

const htmlToPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, ' ');
    return tempDiv.textContent || tempDiv.innerText || '';
};

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'plainTextContent'> & { id?: number }): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const now = new Date();
        const isLocked = !!(note as any).isLocked;
        const plainTextContent = isLocked ? '' : htmlToPlainText(note.content);

        if (note.id) { // Handle update
            const getRequest = store.get(note.id);
            getRequest.onsuccess = () => {
                const existingNote = getRequest.result;
                // Create a complete Note object for saving
                const noteToSave: Note = {
                    id: note.id!,
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    tags: note.tags || [],
                    createdAt: existingNote ? existingNote.createdAt : now, // Preserve original creation date
                    updatedAt: now,
                    plainTextContent: plainTextContent,
                    isPinned: (note as any).isPinned || existingNote?.isPinned,
                    isLocked,
                    encrypted: (note as any).encrypted ?? existingNote?.encrypted ?? null,
                };
                const putRequest = store.put(noteToSave);
                putRequest.onsuccess = () => {
                    const historyTx = (transaction as any).db.transaction('history', 'readwrite');
                    const historyStore = historyTx.objectStore('history');
                    historyStore.add({ noteId: noteToSave.id, title: noteToSave.title, content: noteToSave.content, timestamp: now });
                    resolve(putRequest.result as number);
                };
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        } else { // Handle create
            const noteToSave: Omit<Note, 'id'> = {
                title: note.title,
                content: isLocked ? '' : note.content,
                tags: note.tags || [],
                createdAt: now,
                updatedAt: now,
                plainTextContent: plainTextContent,
                isPinned: (note as any).isPinned,
                isLocked,
                encrypted: (note as any).encrypted ?? null,
            };
            const addRequest = store.add(noteToSave);
            addRequest.onsuccess = () => {
                const id = addRequest.result as number;
                const historyTx = (transaction as any).db.transaction('history', 'readwrite');
                const historyStore = historyTx.objectStore('history');
                historyStore.add({ noteId: id, title: noteToSave.title, content: noteToSave.content, timestamp: now });
                resolve(id);
            };
            addRequest.onerror = () => reject(addRequest.error);
        }
    });
};


export const getAllNotes = async (): Promise<Note[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('updatedAt');
        const request = index.getAll();

        request.onsuccess = () => {
            resolve(request.result.reverse());
        };
        request.onerror = () => reject(request.error);
    });
};

export const getNote = async (id: number): Promise<Note | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getHistory = async (noteId: number): Promise<{ id: number; noteId: number; title: string; content: string; timestamp: Date }[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('history', 'readonly');
        const store = tx.objectStore('history');
        const index = store.index('noteId');
        const req = index.getAll(noteId as any);
        req.onsuccess = () => resolve(req.result.sort((a, b) => (b.timestamp as any) - (a.timestamp as any)));
        req.onerror = () => reject(req.error);
    });
};

export const deleteNote = async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME, 'history'], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const historyStore = transaction.objectStore('history');
        
        // Delete the note
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
            // Delete all history entries for this note
            const index = historyStore.index('noteId');
            const historyRequest = index.openCursor(IDBKeyRange.only(id));
            
            historyRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            
            historyRequest.onerror = () => reject(historyRequest.error);
        };
        
        deleteRequest.onerror = () => reject(deleteRequest.error);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
