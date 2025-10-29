import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';

export type PasswordMode = 'set' | 'unlock' | 'remove';

interface PasswordModalProps {
  isOpen: boolean;
  mode: PasswordMode;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void> | void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, mode, onClose, onConfirm }) => {
  const { t } = useTranslations();
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setPassword('');
  }, [isOpen]);

  const titles: Record<PasswordMode, string> = {
    set: t('password.setTitle'),
    unlock: t('password.unlockTitle'),
    remove: t('password.removeTitle'),
  };

  const footer = (
    <div className="flex justify-end gap-2 w-full">
      <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-border hover:bg-border-strong text-text-primary">
        {t('common.cancel')}
      </button>
      <button
        onClick={async () => {
          if (!password) return;
          try {
            setSubmitting(true);
            await onConfirm(password);
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!password || isSubmitting}
        className="px-4 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover disabled:opacity-50"
      >
        {t('password.confirm')}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[mode]} footer={footer}>
      <div className="p-6 space-y-3">
        <label htmlFor="pw" className="block text-sm text-text-secondary">{t('password.passwordLabel')}</label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password.placeholder')}
          className="w-full p-2 rounded bg-background border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
          autoFocus
        />
      </div>
    </Modal>
  );
};

export default PasswordModal;
