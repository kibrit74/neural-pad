import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import * as db from '../services/database';
import { diffWords } from 'diff';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryModalProps {
  isOpen: boolean;
  noteId: number | null;
  currentHtml: string;
  onClose: () => void;
  onRestore: (html: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, noteId, currentHtml, onClose, onRestore }) => {
  const { t } = useTranslations();
  const { language } = useLanguage();
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
      <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-border hover:bg-border-strong text-text-primary">{t('common.close')}</button>
      <button
        onClick={() => { if (selected) onRestore(selected.content); }}
        className="px-4 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selected}
      >{t('common.restore')}</button>
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('history.title')} footer={footer}>
      <div className="p-4 flex gap-4 h-[70vh]">
        <div className="w-1/3 overflow-auto border-r border-border pr-2">
          {items.length === 0 ? (
            <div className="text-text-secondary text-sm p-4">{t('history.empty')}</div>
          ) : (
            items.map(i => (
              <button key={i.id} onClick={() => setSelectedId(i.id)} className={`block w-full text-left p-2 rounded mb-1 ${i.id===selectedId?'bg-primary text-primary-text':'hover:bg-border'}`}>
                <div className="text-xs text-text-secondary">{new Date(i.timestamp).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}</div>
                <div className="truncate">{i.title || t('defaultNoteTitle')}</div>
              </button>
            ))
          )}
        </div>
        <div className="w-2/3 overflow-auto">
          {selected ? renderDiff() : <div className="text-text-secondary">{t('history.selectVersion')}</div>}
        </div>
      </div>
    </Modal>
  );
};

export default HistoryModal;
