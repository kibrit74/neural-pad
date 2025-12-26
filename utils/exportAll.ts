import JSZip from 'jszip';
import TurndownService from 'turndown';
import * as db from '../services/database';

export async function exportAll(format: 'html' | 'md') {
  const notes = await db.getAllNotes();
  const zip = new JSZip();
  const td = new TurndownService();

  for (const n of notes) {
    const title = (n.title || 'untitled').replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60);
    if (format === 'html') {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${n.content}</body></html>`;
      zip.file(`${title}.html`, html);
    } else {
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

export async function exportBackup(): Promise<{ success: boolean; error?: string }> {
  try {
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

    return { success: true };
  } catch (error) {
    console.error('Export backup failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function importBackup(file: File): Promise<{ success: boolean; notesCount: number; error?: string }> {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    // Validate backup structure
    if (!backup.version || !backup.notes || !Array.isArray(backup.notes)) {
      return { success: false, notesCount: 0, error: 'Invalid backup file format' };
    }

    // Restore settings
    if (backup.settings) {
      if (backup.settings.theme) localStorage.setItem('theme', backup.settings.theme);
      if (backup.settings.language) localStorage.setItem('language', backup.settings.language);
      if (backup.settings.apiProvider) localStorage.setItem('apiProvider', backup.settings.apiProvider);
      if (backup.settings.autoSave) localStorage.setItem('autoSave', backup.settings.autoSave);
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
  } catch (error) {
    return { success: false, notesCount: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
