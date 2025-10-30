import { Editor } from '@tiptap/react';

// Robustly locate the table node and its position in the document
function findTable(editor: Editor): { tableNode: any; tablePos: number } | null {
  const { selection } = editor.state;
  const $from = selection.$from;
  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);
    if (node && node.type && node.type.name === 'table') {
      // Position before the table node
      const tablePos = $from.before(d);
      return { tableNode: node, tablePos };
    }
  }
  return null;
}

export const sortTable = (editor: Editor, colIndex: number, ascending: boolean) => {
  const { state, view } = editor;
  const found = findTable(editor);
  if (!found) return;
  const { tableNode, tablePos } = found;

  // Extract rows preserving full content and attributes
  const rowsPM: any[] = [];
  for (let i = 0; i < tableNode.childCount; i++) {
    rowsPM.push(tableNode.child(i));
  }

  const firstRow = rowsPM[0];
  const hasHeader = !!firstRow && firstRow.childCount > 0 &&
    Array.from({ length: firstRow.childCount }).some((_, idx) => firstRow.child(idx).type.name === 'tableHeader');

  const bodyRows = rowsPM.slice(hasHeader ? 1 : 0);

  const getCellText = (rowNode: any, index: number): string => {
    if (!rowNode || rowNode.childCount === 0) return '';
    const cell = rowNode.child(index) || rowNode.child(0);
    return (cell && cell.textContent) ? cell.textContent : '';
  };

  const comparator = (a: any, b: any) => {
    const A = getCellText(a, colIndex);
    const B = getCellText(b, colIndex);
    const numA = parseFloat(A.replace(/[^0-9.\-]/g, ''));
    const numB = parseFloat(B.replace(/[^0-9.\-]/g, ''));
    const isNumA = !isNaN(numA) && /^-?\d/.test(A);
    const isNumB = !isNaN(numB) && /^-?\d/.test(B);
    if (isNumA && isNumB) return ascending ? numA - numB : numB - numA;
    return ascending ? A.localeCompare(B) : B.localeCompare(A);
  };

  bodyRows.sort(comparator);

  const newRows = hasHeader ? [firstRow, ...bodyRows] : bodyRows;
  const newTable = tableNode.type.create(tableNode.attrs, newRows);

  const tr = state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable);
  view.dispatch(tr);
};

export const toggleTableClass = (editor: Editor, className: string) => {
  const found = findTable(editor);
  if (!found) return;
  const { tableNode } = found;

  const currentAttrs = tableNode.attrs || {};
  const currentClasses = (currentAttrs.class || '').split(' ').filter(Boolean);

  let newClasses: string[];
  if (currentClasses.includes(className)) {
    newClasses = currentClasses.filter(c => c !== className);
  } else {
    newClasses = [...currentClasses, className];
  }

  editor.commands.updateAttributes('table', { class: newClasses.join(' ') });
};

// Ensure border classes are mutually exclusive (only one active at a time)
export const setTableBorderClass = (
  editor: Editor,
  borderClass: 'np-borders-none' | 'np-borders-all' | 'np-borders-outside'
) => {
  const found = findTable(editor);
  if (!found) return;
  const { tableNode } = found;

  const currentAttrs = tableNode.attrs || {};
  const currentClasses = (currentAttrs.class || '').split(' ').filter(Boolean);
  const borderClasses = ['np-borders-none', 'np-borders-all', 'np-borders-outside'];

  const filtered = currentClasses.filter(c => !borderClasses.includes(c));
  const newClasses = [...filtered, borderClass];
  editor.commands.updateAttributes('table', { class: newClasses.join(' ') });
};
