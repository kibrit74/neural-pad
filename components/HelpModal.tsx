
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
            <div className="text-text-secondary leading-relaxed space-y-2">{children}</div>
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
            <div className="p-6 space-y-6">
                <Section title={t('help.quickStart')}>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>{t('help.quickStartStep1')}</li>
                        <li>{t('help.quickStartStep2')}</li>
                        <li>{t('help.quickStartStep3')}</li>
                        <li>{t('help.quickStartStep4')}</li>
                    </ul>
                </Section>

                <Section title={t('help.writingAssistant')}>
                    <p>{t('help.writingAssistantDesc')}</p>
                </Section>

                <Section title={t('help.imageTools')}>
                    <p>{t('help.imageToolsDesc')}</p>
                </Section>

                <Section title={t('help.chat')}>
                    <p>{t('help.chatDesc')}</p>
                </Section>

                <Section title={t('help.organization')}>
                    <p>{t('help.organizationDesc')}</p>
                </Section>
                
                <Section title={t('help.voiceInput')}>
                    <p>{t('help.voiceInputDesc')}</p>
                    <ol className="list-decimal pl-5 space-y-1 mt-2">
                        <li>{t('help.voiceInputStep1')}</li>
                        <li>{t('help.voiceInputStep2')}</li>
                        <li>{t('help.voiceInputStep3')}</li>
                        <li>{t('help.voiceInputStep4')}</li>
                    </ol>
                </Section>

                <Section title={t('help.exportBackup')}>
                    <div className="space-y-3">
                        <p className="font-medium text-text-primary">💾 {t('help.backupTitle')}</p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>{t('help.backupStep1')}</li>
                            <li>{t('help.backupStep2')}</li>
                            <li>{t('help.backupStep3')}</li>
                        </ol>
                        
                        <p className="font-medium text-text-primary mt-4">📥 {t('help.restoreTitle')}</p>
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>{t('help.restoreStep1')}</li>
                            <li>{t('help.restoreStep2')}</li>
                            <li>{t('help.restoreStep3')}</li>
                            <li>{t('help.restoreStep4')}</li>
                        </ol>
                        
                        <div className="mt-3 p-3 bg-background rounded border border-border-strong">
                            <p className="text-sm">💡 <strong>{t('help.backupTip')}</strong> {t('help.backupTipDesc')}</p>
                        </div>
                    </div>
                </Section>

                <Section title={t('help.storageSecurity')}>
                    <p>{t('help.storageSecurityDesc')}</p>
                </Section>

                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{t('help.shortcuts')}</h3>
                    <div className="bg-background-secondary rounded-lg p-2 border border-border-strong">
                        <Shortcut keys="Ctrl/Cmd + S" description={t('help.saveNote')} />
                        <Shortcut keys="Ctrl/Cmd + B" description={t('help.bold')} />
                        <Shortcut keys="Ctrl/Cmd + I" description={t('help.italic')} />
                        <Shortcut keys="Ctrl/Cmd + U" description={t('help.underline')} />
                        <Shortcut keys="Ctrl/Cmd + Z" description={t('help.undo')} />
                        <Shortcut keys="Ctrl/Cmd + Y" description={t('help.redo')} />
                    </div>
                </div>

                <Section title={t('help.troubleshooting')}>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>{t('help.troubleshootingWindow')}</li>
                        <li>{t('help.troubleshootingApi')}</li>
                        <li>{t('help.troubleshootingImages')}</li>
                    </ul>
                </Section>
            </div>
        </Modal>
    );
};

export default HelpModal;
