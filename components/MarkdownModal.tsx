import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';
import TurndownService from 'turndown';
import { marked } from 'marked';

interface MarkdownModalProps {
  isOpen: boolean;
  html: string;
  onClose: () => void;
  onApply: (newHtml: string) => void;
}

const MarkdownModal: React.FC<MarkdownModalProps> = ({ isOpen, html, onClose, onApply }) => {
  const { t } = useTranslations();
  const td = useMemo(() => new TurndownService(), []);
  const [mode, setMode] = useState<'view'|'edit'>('view');
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMarkdown(td.turndown(html || ''));
      setMode('view');
    }
  }, [isOpen, html, td]);

  const footer = (
    <div className="flex gap-2">
      <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-border hover:bg-border-strong text-text-primary">{t('common.close')}</button>
      <button
        onClick={() => {
          const newHtml = marked(markdown) as string;
          onApply(newHtml);
          onClose();
        }}
        className="px-4 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover"
      >{t('common.apply')}</button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('common.markdown')} footer={footer}>
      <div className="p-4 flex gap-4 h-[70vh]">
        <div className="w-1/2 flex flex-col">
          <div className="text-sm text-text-secondary mb-2">{t('common.markdown')}</div>
          <textarea
            className="flex-1 w-full p-2 bg-background border border-border rounded resize-none"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
        </div>
        <div className="w-1/2 overflow-auto">
          <div className="text-sm text-text-secondary mb-2">{t('common.preview')}</div>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked(markdown) as string }} />
        </div>
      </div>
    </Modal>
  );
};

export default MarkdownModal;
