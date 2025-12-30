import React, { useState, useContext } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import type { Settings, ApiProvider } from '../types';
import Modal from './Modal';
import CustomPatternsSection from './CustomPatternsSection';

interface SettingsModalProps {
    isOpen: boolean;
    settings: Settings;
    onSave: (settings: Settings) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onSave, onClose }) => {
    const { t } = useTranslations();
    // Access theme context safely; fall back to DOM/localStorage if provider is missing
    const themeCtx = useContext(ThemeContext);
    const theme: Theme = (themeCtx?.theme || (document.documentElement.getAttribute('data-theme') as Theme) || 'midnight');
    const setThemeSafe = (th: Theme) => {
        if (themeCtx?.setTheme) {
            themeCtx.setTheme(th);
        } else {
            document.documentElement.setAttribute('data-theme', th);
            localStorage.setItem('theme', th);
        }
    };
    const { language, setLanguage } = useLanguage();
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, type } = e.target;
        const target = e.target as HTMLInputElement;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? target.checked : e.target.value
        }));
    };

    const handleProviderChange = (provider: ApiProvider) => {
        setLocalSettings(prev => ({ ...prev, apiProvider: provider }));
    };

    const themes: Theme[] = ['coral', 'emerald', 'gold', 'teal', 'azure', 'midnight'];
    const themeNames: Record<Theme, { en: string; tr: string }> = {
        coral: { en: 'Coral', tr: 'Mercan' },
        emerald: { en: 'Emerald', tr: 'Zümrüt' },
        gold: { en: 'Gold', tr: 'Altın' },
        teal: { en: 'Teal', tr: 'Turkuaz' },
        azure: { en: 'Azure', tr: 'Okyanus' },
        midnight: { en: 'Midnight', tr: 'Gece Yarısı' },
    };
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
            className={`p-3 rounded-md border-2 transition-colors capitalize text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary w-full ${localSettings.apiProvider === provider
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
            <div className="p-6 space-y-6">
                <Section title={t('settings.theme')}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {themes.map(themeName => (
                            <button
                                key={`theme-${themeName}`}
                                onClick={() => setThemeSafe(themeName)}
                                aria-pressed={theme === themeName}
                                className={`p-4 rounded-md border-2 transition-colors text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${theme === themeName
                                    ? 'border-primary bg-primary text-primary-text'
                                    : 'border-border-strong bg-background hover:bg-border text-text-primary'
                                    }`}
                            >
                                {themeNames[themeName][language]}
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { exportBackup } = await import('../utils/exportAll');
                                                const result = await exportBackup();
                                                if (result.success) {
                                                    alert(`✅ ${t('settings.export.backupSuccess') || 'JSON yedek indirildi!'}`);
                                                } else {
                                                    alert(`❌ ${t('settings.export.backupError') || 'Yedek indirilemedi'}: ${result.error}`);
                                                }
                                            } catch (error) {
                                                alert(`❌ ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover transition-colors text-sm"
                                        title="Metin + Ayarlar (resimler hariç)"
                                    >
                                        📄 JSON
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { exportAll } = await import('../utils/exportAll');
                                                await exportAll('html');
                                                alert(`✅ ${t('settings.export.backupSuccess') || 'HTML yedek indirildi!'}`);
                                            } catch (error) {
                                                alert(`❌ ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                            }
                                        }}
                                        className="flex-1 px-3 py-2 rounded-md font-semibold bg-primary text-primary-text hover:bg-primary-hover transition-colors text-sm"
                                        title="Resimler dahil (ZIP dosyası)"
                                    >
                                        🖼️ HTML+Resim
                                    </button>
                                </div>
                                <p className="text-xs text-text-secondary">
                                    💡 JSON: Metin ve ayarlar • HTML: Resimlerle birlikte
                                </p>
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
                                        📥 {t('settings.export.restoreBackup')} (JSON)
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
                                        try {
                                            const mod = await import('../utils/exportAll');
                                            await mod.exportAll('html');
                                        } catch (error) {
                                            alert(`Export hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 rounded-md font-semibold bg-background border border-border-strong hover:bg-border text-text-primary transition-colors"
                                >HTML</button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const mod = await import('../utils/exportAll');
                                            await mod.exportAll('md');
                                        } catch (error) {
                                            alert(`Export hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 rounded-md font-semibold bg-background border border-border-strong hover:bg-border text-text-primary transition-colors"
                                >{t('common.markdown')}</button>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title={t('settings.language')}>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`p-4 rounded-md border-2 transition-colors text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${language === 'en'
                                ? 'border-primary bg-primary text-primary-text'
                                : 'border-border-strong bg-background hover:bg-border text-text-primary'
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('tr')}
                            className={`p-4 rounded-md border-2 transition-colors text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${language === 'tr'
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
                    <p className="text-sm text-text-secondary mt-3">
                        {t('settings.apiProviderNote') || 'AI modeli abonelik planınıza göre otomatik belirlenir.'}
                    </p>
                </Section>

                <Section title="🎯 Özel Tarama Kalıpları">
                    <p className="text-sm text-text-secondary mb-4">
                        Notlarınızdan özel veri tipleri tanımlayın (örn: Dosya Esas No, Hasta Adı, Karar No)
                    </p>
                    <CustomPatternsSection
                        patterns={localSettings.customPatterns || []}
                        onChange={(patterns) => {
                            setLocalSettings(prev => ({ ...prev, customPatterns: patterns }));
                        }}
                    />
                </Section>

            </div>
        </Modal>
    );
};

export default SettingsModal;

