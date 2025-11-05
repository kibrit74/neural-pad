"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.getHistory = exports.getNote = exports.getAllNotes = exports.saveNote = void 0;
const DB_NAME = 'GeminiWriterDB';
const DB_VERSION = 3;
const STORE_NAME = 'notes';
let db;
// Request persistent storage to prevent browser from auto-deleting data
if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((persistent) => {
        if (persistent) {
            console.log('✅ Storage will not be cleared automatically by the browser.');
        }
        else {
            console.warn('⚠️ Storage may be cleared by the browser under storage pressure.');
        }
    });
}
const openDB = () => {
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
            db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            const oldVersion = event.oldVersion;
            console.log(`Database upgrade: v${oldVersion} -> v${DB_VERSION}`);
            let store;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                store = dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
            else {
                store = event.target.transaction.objectStore(STORE_NAME);
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
const htmlToPlainText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, ' ');
    return tempDiv.textContent || tempDiv.innerText || '';
};
const saveNote = async (note) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const now = new Date();
        const isLocked = !!note.isLocked;
        const plainTextContent = isLocked ? '' : htmlToPlainText(note.content);
        if (note.id) { // Handle update
            const getRequest = store.get(note.id);
            getRequest.onsuccess = () => {
                const existingNote = getRequest.result;
                // Create a complete Note object for saving
                const noteToSave = {
                    id: note.id,
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    tags: note.tags || [],
                    createdAt: existingNote ? existingNote.createdAt : now, // Preserve original creation date
                    updatedAt: now,
                    plainTextContent: plainTextContent,
                    isPinned: note.isPinned || existingNote?.isPinned,
                    isLocked,
                    encrypted: note.encrypted ?? existingNote?.encrypted ?? null,
                };
                const putRequest = store.put(noteToSave);
                putRequest.onsuccess = () => {
                    const historyTx = transaction.db.transaction('history', 'readwrite');
                    const historyStore = historyTx.objectStore('history');
                    historyStore.add({ noteId: noteToSave.id, title: noteToSave.title, content: noteToSave.content, timestamp: now });
                    resolve(putRequest.result);
                };
                putRequest.onerror = () => reject(putRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        }
        else { // Handle create
            const noteToSave = {
                title: note.title,
                content: isLocked ? '' : note.content,
                tags: note.tags || [],
                createdAt: now,
                updatedAt: now,
                plainTextContent: plainTextContent,
                isPinned: note.isPinned,
                isLocked,
                encrypted: note.encrypted ?? null,
            };
            const addRequest = store.add(noteToSave);
            addRequest.onsuccess = () => {
                const id = addRequest.result;
                const historyTx = transaction.db.transaction('history', 'readwrite');
                const historyStore = historyTx.objectStore('history');
                historyStore.add({ noteId: id, title: noteToSave.title, content: noteToSave.content, timestamp: now });
                resolve(id);
            };
            addRequest.onerror = () => reject(addRequest.error);
        }
    });
};
exports.saveNote = saveNote;
const getAllNotes = async () => {
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
exports.getAllNotes = getAllNotes;
const getNote = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
exports.getNote = getNote;
const getHistory = async (noteId) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('history', 'readonly');
        const store = tx.objectStore('history');
        const index = store.index('noteId');
        const req = index.getAll(noteId);
        req.onsuccess = () => resolve(req.result.sort((a, b) => b.timestamp - a.timestamp));
        req.onerror = () => reject(req.error);
    });
};
exports.getHistory = getHistory;
const deleteNote = async (id) => {
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
                const cursor = event.target.result;
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
exports.deleteNote = deleteNote;
