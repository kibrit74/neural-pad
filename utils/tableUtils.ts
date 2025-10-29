import { Editor } from '@tiptap/react';

// Placeholder for table utility functions

export const sortTable = (editor: Editor, colIndex: number, ascending: boolean) => {
  if (!editor.isActive('table')) return;

  const { state, view } = editor;
  const { selection } = state;
  const tableNode = selection.$from.node(-2);
  const tableStart = selection.$from.start(-2) - 1;

  if (!tableNode || tableNode.type.name !== 'table') return;

  const rows = [];
  for (let i = 0; i < tableNode.childCount; i++) {
      const rowNode = tableNode.child(i);
      const cells = [];
      for (let j = 0; j < rowNode.childCount; j++) {
          cells.push(rowNode.child(j).textContent);
      }
      rows.push(cells);
  }

  const header = rows.shift();

  rows.sort((a, b) => {
      const valA = a[colIndex] || '';
      const valB = b[colIndex] || '';
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  if (header) rows.unshift(header);

  const newTable = state.schema.nodes.table.create(null, 
      rows.map(row => 
          state.schema.nodes.tableRow.create(null, 
              row.map(content => 
                  state.schema.nodes.tableCell.create(null, 
                      content ? state.schema.text(content) : null
                  )
              )
          )
      )
  );

  const tr = state.tr.replaceWith(tableStart, tableStart + tableNode.nodeSize, newTable);
  view.dispatch(tr);
};

export const toggleTableClass = (editor: Editor, className: string) => {
  if (!editor.isActive('table')) return;

  const { state, view } = editor;
  const { selection } = state;
  const tableNode = selection.$from.node(-2);
  const tableStart = selection.$from.start(-2) - 1;

  if (!tableNode || tableNode.type.name !== 'table') return;

  const currentAttrs = tableNode.attrs || {};
  const currentClasses = (currentAttrs.class || '').split(' ').filter(Boolean);
  
  let newClasses;
  if (currentClasses.includes(className)) {
    newClasses = currentClasses.filter(c => c !== className);
  } else {
    newClasses = [...currentClasses, className];
  }

  const newAttrs = { ...currentAttrs, class: newClasses.join(' ') };

  const tr = state.tr.setNodeMarkup(tableStart, undefined, newAttrs);
  view.dispatch(tr);
};
