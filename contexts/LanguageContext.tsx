import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations } from '../utils/i18nTranslations';

export type Language = 'en' | 'tr';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'tr') {
        return savedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'tr' ? 'tr' : 'en';
};

type LanguageProviderProps = {
    children: ReactNode;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage());

    useEffect(() => {
        document.documentElement.lang = language;
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string, replacements?: Record<string, string>): string => {
        const keys = key.split('.');
        let result: any = translations[language];

        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English if translation is missing
                let fallbackResult: any = translations.en;
                for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                }
                result = fallbackResult || key;
                break;
            }
        }

        let strResult = String(result);

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                strResult = strResult.replace(`{{${placeholder}}}`, replacements[placeholder]);
            });
        }

        return strResult;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};