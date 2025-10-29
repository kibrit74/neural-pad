import React, { useState } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import type { Settings, ApiProvider } from '../types';
import Modal from './Modal';

interface SettingsModalProps {
    isOpen: boolean;
    settings: Settings;
    onSave: (settings: Settings) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onSave, onClose }) => {
    const { t } = useTranslations();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;
        const isNumber = type === 'range' || type === 'number';
        setLocalSettings(prev => ({
            ...prev,
            [name]: isNumber ? parseFloat(value) : type === 'checkbox' ? target.checked : value
        }));
    };

    const handleProviderChange = (provider: ApiProvider) => {
        setLocalSettings(prev => ({ ...prev, apiProvider: provider }));
    };
    
    const themes: Theme[] = ['default', 'twilight', 'ocean', 'forest', 'blossom', 'dusk'];
    const providers: ApiProvider[] = ['gemini', 'openai', 'claude'];

    const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">{title}</h3>
            {children}
        </div>
    );

    const ProviderButton: React.FC<{ provider: ApiProvider }> = ({ provider }) => (
         <button
            onClick={() => handleProviderChange(provider)}
            className={`p-3 rounded-md border-2 transition-colors capitalize text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary w-full ${
                localSettings.apiProvider === provider
                ? 'border-primary bg-primary text-primary-text'
                : 'border-border-strong bg-background hover:bg-border text-text-primary'
            }`}
        >
            {provider}
        </button>
    );

    const footer = (
        <div className="flex justify-end gap-2 w-full">
            <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-border hover:bg-border-strong text-text-primary">{t('common.cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover">{t('common.save')}</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} footer={footer}>
            <style>{`
                .custom-range::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 0.25rem;
                    cursor: pointer;
                    background: var(--color-border);
                    border-radius: 9999px;
                }
                .custom-range::-moz-range-track {
                    width: 100%;
                    height: 0.25rem;
                    cursor: pointer;
                    background: var(--color-border);
                    border-radius: 9999px;
                }
                .custom-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    margin-top: -0.375rem;
                    width: 1rem;
                    height: 1rem;
                    border-radius: 50%;
                    background: var(--color-primary);
                    cursor: pointer;
                }
                .custom-range::-moz-range-thumb {
                    width: 1rem;
                    height: 1rem;
                    border-radius: 50%;
                    background: var(--color-primary);
                    cursor: pointer;
                    border: none;
                }
            `}</style>
            <div className="p-6 space-y-6">
                <Section title={t('settings.theme')}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {themes.map(themeName => (
                            <button
                                key={themeName}
                                onClick={() => setTheme(themeName)}
                                className={`p-4 rounded-md border-2 transition-colors capitalize text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                                    theme === themeName
                                    ? 'border-primary bg-primary text-primary-text'
                                    : 'border-border-strong bg-background hover:bg-border text-text-primary'
                                }`}
                            >
                                {t(`settings.themes.${themeName}`)}
                            </button>
                        ))}
                    </div>
                </Section>

                <Section title={t('settings.export.title')}>
                    <div className="space-y-3">
                        <div className="p-3 rounded-md bg-background-secondary border border-border">
                            <h4 className="font-semibold text-text-primary mb-2">💾 {t('settings.export.backupTitle')}</h4>
                            <p className="text-sm text-text-secondary mb-3">{t('settings.export.backupDescription')}</p>
                            <div className="space-y-2">
                                <button
                                    onClick={async () => {
                                        const { exportBackup } = await import('../utils/exportAll');
                                        await exportBackup();
                                    }}
                                    className="w-full px-4 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover transition-colors"
                                >
                                    📦 {t('settings.export.downloadBackup')}
                                </button>
                                <label className="block">
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const { importBackup } = await import('../utils/exportAll');
                                            const result = await importBackup(file);
                                            if (result.success) {
                                                alert(`✅ ${t('settings.export.importSuccess', { count: String(result.notesCount) })}`);
                                                window.location.reload();
                                            } else {
                                                alert(`❌ ${t('settings.export.importError')}: ${result.error}`);
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                    <span className="w-full px-4 py-2 rounded-md font-semibold bg-background border-2 border-border-strong hover:bg-border text-text-primary transition-colors cursor-pointer block text-center">
                                        📥 {t('settings.export.restoreBackup')}
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="p-3 rounded-md bg-background-secondary border border-border">
                            <h4 className="font-semibold text-text-primary mb-2">📄 {t('settings.export.exportTitle')}</h4>
                            <p className="text-sm text-text-secondary mb-3">{t('settings.export.exportDescription')}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        const { exportAll } = await import('../utils/exportAll');
                                        await exportAll('html');
                                    }}
                                    className="flex-1 px-3 py-2 rounded-md font-semibold bg-background border border-border-strong hover:bg-border text-text-primary transition-colors"
                                >HTML</button>
                                <button
                                    onClick={async () => {
                                        const { exportAll } = await import('../utils/exportAll');
                                        await exportAll('md');
                                    }}
                                    className="flex-1 px-3 py-2 rounded-md font-semibold bg-background border border-border-strong hover:bg-border text-text-primary transition-colors"
                                >Markdown</button>
                            </div>
                        </div>
                    </div>
                </Section>
                
                <Section title={t('settings.language')}>
                    <div className="grid grid-cols-2 gap-4">
                         <button
                            onClick={() => setLanguage('en')}
                            className={`p-4 rounded-md border-2 transition-colors text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                                language === 'en'
                                ? 'border-primary bg-primary text-primary-text'
                                : 'border-border-strong bg-background hover:bg-border text-text-primary'
                            }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('tr')}
                            className={`p-4 rounded-md border-2 transition-colors text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                                language === 'tr'
                                ? 'border-primary bg-primary text-primary-text'
                                : 'border-border-strong bg-background hover:bg-border text-text-primary'
                            }`}
                        >
                            Türkçe
                        </button>
                    </div>
                </Section>

                <Section title={t('settings.autoSave')}>
                     <div className="flex items-center justify-between p-3 rounded-md bg-background border border-border-strong">
                        <p className="text-text-secondary pr-4">{t('settings.autoSaveDescription')}</p>
                        <label htmlFor="autoSaveToggle" className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="autoSaveToggle" 
                                className="sr-only peer"
                                name="autoSave"
                                checked={!!localSettings.autoSave} 
                                onChange={handleInputChange}
                            />
                            <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </Section>

                <Section title={t('settings.apiProvider')}>
                    <div className="grid grid-cols-3 gap-4">
                        {providers.map(p => <ProviderButton key={p} provider={p} />)}
                    </div>
                </Section>

                {localSettings.apiProvider === 'openai' && (
                    <Section title="OpenAI">
                        <div className="space-y-2">
                            <label htmlFor="openaiApiKey" className="text-text-secondary">{t('settings.apiKey')}</label>
                            <input
                                type="password"
                                id="openaiApiKey"
                                name="openaiApiKey"
                                value={localSettings.openaiApiKey || ''}
                                onChange={handleInputChange}
                                placeholder={t('settings.apiKeyPlaceholder')}
                                className="w-full p-2 rounded bg-background border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                            />
                            <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {t('settings.getApiKeyHere', { provider: 'OpenAI' })}
                            </a>
                        </div>
                    </Section>
                )}

                {localSettings.apiProvider === 'claude' && (
                    <Section title="Anthropic (Claude)">
                        <div className="space-y-2">
                            <label htmlFor="claudeApiKey" className="text-text-secondary">{t('settings.apiKey')}</label>
                            <input
                                type="password"
                                id="claudeApiKey"
                                name="claudeApiKey"
                                value={localSettings.claudeApiKey || ''}
                                onChange={handleInputChange}
                                placeholder={t('settings.apiKeyPlaceholder')}
                                className="w-full p-2 rounded bg-background border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                            />
                            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {t('settings.getApiKeyHere', { provider: 'Anthropic' })}
                            </a>
                        </div>
                    </Section>
                )}
                
                {localSettings.apiProvider === 'gemini' && (
                    <>
                        <Section title="Google Gemini">
                            <div className="space-y-2">
                                <label htmlFor="geminiApiKey" className="text-text-secondary">{t('settings.apiKey')}</label>
                                <input
                                    type="password"
                                    id="geminiApiKey"
                                    name="geminiApiKey"
                                    value={localSettings.geminiApiKey || ''}
                                    onChange={handleInputChange}
                                    placeholder={t('settings.apiKeyPlaceholder')}
                                    className="w-full p-2 rounded bg-background border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                                />
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                    {t('settings.getApiKeyHere', { provider: 'Google AI Studio' })}
                                </a>
                            </div>
                        </Section>
                        
                        <Section title={t('settings.modelConfig')}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <label htmlFor="model" className="md:col-span-1 text-text-secondary">{t('settings.model')}</label>
                                    <select id="model" name="model" value={localSettings.model} onChange={handleInputChange} className="p-2 rounded bg-background border border-border-strong md:col-span-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary">
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <label htmlFor="temperature" className="md:col-span-1 text-text-secondary">{t('settings.temperature')} ({localSettings.temperature})</label>
                                    <input type="range" id="temperature" name="temperature" min="0" max="1" step="0.1" value={localSettings.temperature} onChange={handleInputChange} className="w-full md:col-span-2 custom-range" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <label htmlFor="topK" className="md:col-span-1 text-text-secondary">{t('settings.topK')} ({localSettings.topK})</label>
                                    <input type="range" id="topK" name="topK" min="1" max="100" step="1" value={localSettings.topK} onChange={handleInputChange} className="w-full md:col-span-2 custom-range" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <label htmlFor="topP" className="md:col-span-1 text-text-secondary">{t('settings.topP')} ({localSettings.topP})</label>
                                    <input type="range" id="topP" name="topP" min="0" max="1" step="0.05" value={localSettings.topP} onChange={handleInputChange} className="w-full md:col-span-2 custom-range" />
                                </div>
                            </div>
                        </Section>
                    </>
                )}

            </div>
        </Modal>
    );
};

export default SettingsModal;
