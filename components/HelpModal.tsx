
import React from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslations();

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary leading-relaxed">{children}</p>
        </div>
    );
    
    const Shortcut: React.FC<{ keys: string; description: string }> = ({ keys, description }) => (
        <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
            <span className="text-text-primary">{description}</span>
            <kbd className="px-2 py-1 text-xs font-semibold text-text-secondary bg-border rounded-md">{keys}</kbd>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('help.title')}>
            <div className="p-6">
                <Section title={t('help.writingAssistant')}>
                    {t('help.writingAssistantDesc')}
                </Section>
                <Section title={t('help.imageTools')}>
                    {t('help.imageToolsDesc')}
                </Section>
                 <Section title={t('help.chat')}>
                    {t('help.chatDesc')}
                </Section>
                 <Section title={t('help.organization')}>
                    {t('help.organizationDesc')}
                </Section>
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{t('help.shortcuts')}</h3>
                    <div className="bg-background-secondary rounded-lg p-2 border border-border-strong">
                        <Shortcut keys="Ctrl/Cmd + S" description={t('help.saveNote')} />
                        <Shortcut keys="Ctrl/Cmd + B" description={t('help.bold')} />
                        <Shortcut keys="Ctrl/Cmd + I" description={t('help.italic')} />
                        <Shortcut keys="Ctrl/Cmd + Z" description={t('help.undo')} />
                        <Shortcut keys="Ctrl/Cmd + Y" description={t('help.redo')} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;
