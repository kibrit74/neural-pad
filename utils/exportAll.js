"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAll = exportAll;
exports.exportBackup = exportBackup;
exports.importBackup = importBackup;
const jszip_1 = __importDefault(require("jszip"));
const turndown_1 = __importDefault(require("turndown"));
const db = __importStar(require("./db"));
async function exportAll(format) {
    const notes = await db.getAllNotes();
    const zip = new jszip_1.default();
    const td = new turndown_1.default();
    for (const n of notes) {
        const title = (n.title || 'untitled').replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60);
        if (format === 'html') {
            const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${n.content}</body></html>`;
            zip.file(`${title}.html`, html);
        }
        else {
            const md = td.turndown(n.content || '');
            zip.file(`${title}.md`, md);
        }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-pad-export-${format}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
async function exportBackup() {
    const notes = await db.getAllNotes();
    const settings = {
        theme: localStorage.getItem('theme'),
        language: localStorage.getItem('language'),
        apiProvider: localStorage.getItem('apiProvider'),
        autoSave: localStorage.getItem('autoSave'),
    };
    const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        notes,
        settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `neural-pad-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Update last backup date to reset the reminder
    localStorage.setItem('lastBackupDate', new Date().toISOString());
}
async function importBackup(file) {
    try {
        const text = await file.text();
        const backup = JSON.parse(text);
        // Validate backup structure
        if (!backup.version || !backup.notes || !Array.isArray(backup.notes)) {
            return { success: false, notesCount: 0, error: 'Invalid backup file format' };
        }
        // Restore settings
        if (backup.settings) {
            if (backup.settings.theme)
                localStorage.setItem('theme', backup.settings.theme);
            if (backup.settings.language)
                localStorage.setItem('language', backup.settings.language);
            if (backup.settings.apiProvider)
                localStorage.setItem('apiProvider', backup.settings.apiProvider);
            if (backup.settings.autoSave)
                localStorage.setItem('autoSave', backup.settings.autoSave);
        }
        // Restore notes
        let importedCount = 0;
        for (const note of backup.notes) {
            // Remove the old id to create new notes
            const { id, ...noteData } = note;
            await db.saveNote(noteData);
            importedCount++;
        }
        return { success: true, notesCount: importedCount };
    }
    catch (error) {
        return { success: false, notesCount: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
