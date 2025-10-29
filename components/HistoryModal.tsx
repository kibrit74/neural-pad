import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import * as db from '../utils/db';
import { diffWords } from 'diff';

interface HistoryModalProps {
  isOpen: boolean;
  noteId: number | null;
  currentHtml: string;
  onClose: () => void;
  onRestore: (html: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, noteId, currentHtml, onClose, onRestore }) => {
  const [items, setItems] = useState<{ id: number; timestamp: string; content: string; title: string }[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!noteId || !isOpen) return;
      const history = await db.getHistory(noteId);
      setItems(history.map(h => ({ id: h.id, timestamp: String(h.timestamp), content: h.content, title: h.title })));
      setSelectedId(history[0]?.id ?? null);
    };
    load();
  }, [isOpen, noteId]);

  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);

  const footer = (
    <div className="flex gap-2">
      <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-border hover:bg-border-strong text-text-primary">Close</button>
      <button
        onClick={() => { if (selected) onRestore(selected.content); }}
        className="px-4 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover"
        disabled={!selected}
      >Restore</button>
    </div>
  );

  const renderDiff = () => {
    const oldText = selected?.content || '';
    const newText = currentHtml || '';
    const parts = diffWords(oldText.replace(/<[^>]+>/g, ' '), newText.replace(/<[^>]+>/g, ' '));
    return (
      <div className="text-sm leading-relaxed">
        {parts.map((part, i) => (
          <span key={i} className={part.added ? 'bg-green-200' : part.removed ? 'bg-red-200 line-through' : ''}>{part.value}</span>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="History" footer={footer}>
      <div className="p-4 flex gap-4 h-[70vh]">
        <div className="w-1/3 overflow-auto border-r border-border pr-2">
          {items.map(i => (
            <button key={i.id} onClick={() => setSelectedId(i.id)} className={`block w-full text-left p-2 rounded mb-1 ${i.id===selectedId?'bg-primary text-primary-text':'hover:bg-border'}`}>
              <div className="text-xs text-text-secondary">{new Date(i.timestamp).toLocaleString()}</div>
              <div className="truncate">{i.title || '(untitled)'}</div>
            </button>
          ))}
        </div>
        <div className="w-2/3 overflow-auto">
          {selected ? renderDiff() : <div className="text-text-secondary">No selection</div>}
        </div>
      </div>
    </Modal>
  );
};

export default HistoryModal;
