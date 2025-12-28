import type { Note } from '../types';

// Simple HTML to Markdown converter (no external dependencies)
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold and italic
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');

  // Code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '\n```\n$1\n```\n');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Lists (basic support)
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?ul[^>]*>/gi, '\n');
  md = md.replace(/<\/?ol[^>]*>/gi, '\n');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n');

  // Paragraphs and line breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");

  // Clean up extra whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

// Get database API
const getDb = async () => {
  const db = await import('../services/database');
  return db;
};

export async function exportAll(format: 'html' | 'md') {
  console.log('[exportAll] Starting export, format:', format);
  try {
    const db = await getDb();
    console.log('[exportAll] Database loaded');

    const notes = await db.getAllNotes();
    console.log('[exportAll] Got notes:', notes.length);

    if (notes.length === 0) {
      console.warn('[exportAll] No notes to export!');
      alert('Dışa aktarılacak not bulunamadı!');
      return;
    }

    // Dynamic import JSZip
    const JSZipModule = await import('jszip');
    const JSZip = JSZipModule.default;
    console.log('[exportAll] JSZip loaded');

    const zip = new JSZip();

    for (const n of notes) {
      const title = (n.title || 'untitled').replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60);
      console.log('[exportAll] Processing note:', title);
      if (format === 'html') {
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${n.content}</body></html>`;
        zip.file(`${title}.html`, html);
      } else {
        const md = htmlToMarkdown(n.content || '');
        zip.file(`${title}.md`, md);
      }
    }

    console.log('[exportAll] Generating ZIP...');
    const blob = await zip.generateAsync({ type: 'blob' });
    console.log('[exportAll] ZIP size:', blob.size);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-pad-export-${format}.zip`;
    document.body.appendChild(a);
    console.log('[exportAll] Triggering download...');
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('[exportAll] Export completed successfully!');
    alert('Dışa aktarma başarılı!');
  } catch (error) {
    console.error('[exportAll] Export failed:', error);
    alert(`Dışa aktarma başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
}

export async function exportBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
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

    localStorage.setItem('lastBackupDate', new Date().toISOString());

    return { success: true };
  } catch (error) {
    console.error('Export backup failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function importBackup(file: File): Promise<{ success: boolean; notesCount: number; error?: string }> {
  try {
    const db = await getDb();
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.version || !backup.notes || !Array.isArray(backup.notes)) {
      return { success: false, notesCount: 0, error: 'Invalid backup file format' };
    }

    if (backup.settings) {
      if (backup.settings.theme) localStorage.setItem('theme', backup.settings.theme);
      if (backup.settings.language) localStorage.setItem('language', backup.settings.language);
      if (backup.settings.apiProvider) localStorage.setItem('apiProvider', backup.settings.apiProvider);
      if (backup.settings.autoSave) localStorage.setItem('autoSave', backup.settings.autoSave);
    }

    let importedCount = 0;
    for (const note of backup.notes) {
      const { id, ...noteData } = note;
      await db.saveNote(noteData);
      importedCount++;
    }

    return { success: true, notesCount: importedCount };
  } catch (error) {
    return { success: false, notesCount: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
