import JSZip from 'jszip';
import TurndownService from 'turndown';
import * as db from './db';

export async function exportAll(format: 'html'|'md') {
  const notes = await db.getAllNotes();
  const zip = new JSZip();
  const td = new TurndownService();

  for (const n of notes) {
    const title = (n.title || 'untitled').replace(/[^a-z0-9-_]+/gi, '_').slice(0,60);
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
