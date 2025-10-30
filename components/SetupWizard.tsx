import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Settings } from '../types';
import { SparkleIcon, Moon, ArrowRightIcon, ArrowLeftIcon, CircleCheckIcon, SunIcon } from './icons/Icons';

interface SetupWizardProps {
    onComplete: (setupData: {
        theme: 'light' | 'dark';
        language: 'en' | 'tr';
        apiProvider: 'openai' | 'claude' | 'gemini';
    }) => void;
}

type SetupStep = 'welcome' | 'theme' | 'language' | 'api' | 'complete';

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
    const { t } = useTranslations();
    const { language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    
    const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
    const [apiProvider, setApiProvider] = useState<'openai' | 'claude' | 'gemini'>('gemini');
    const [isAnimating, setIsAnimating] = useState(false);

    const steps: SetupStep[] = ['welcome', 'theme', 'language', 'api', 'complete'];
    const currentStepIndex = steps.indexOf(currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(steps[currentStepIndex + 1]);
                setIsAnimating(false);
            }, 150);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(steps[currentStepIndex - 1]);
                setIsAnimating(false);
            }, 150);
        }
    };

    const handleComplete = () => {
        // Temayı ve dili localStorage'a kaydet
        localStorage.setItem('theme', theme);
        localStorage.setItem('language', language);
        localStorage.setItem('hasCompletedSetup', 'true');
        
        onComplete({ theme, language, apiProvider });
    };

    const WelcomeStep = () => (
        <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-float">
                <img src="./Logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {t('setup.welcome.title')}
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
                {t('setup.welcome.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="p-4 bg-background-secondary rounded-lg">
                    <SparkleIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-text-primary mb-1">{t('setup.welcome.features.ai')}</h3>
                    <p className="text-sm text-text-secondary">{t('setup.welcome.features.aiDesc')}</p>
                </div>
                <div className="p-4 bg-background-secondary rounded-lg">
                    <SunIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-text-primary mb-1">{t('setup.welcome.features.themes')}</h3>
                    <p className="text-sm text-text-secondary">{t('setup.welcome.features.themesDesc')}</p>
                </div>
                <div className="p-4 bg-background-secondary rounded-lg">
                    <CircleCheckIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-text-primary mb-1">{t('setup.welcome.features.secure')}</h3>
                    <p className="text-sm text-text-secondary">{t('setup.welcome.features.secureDesc')}</p>
                </div>
            </div>
        </div>
    );

    const ThemeStep = () => (
        <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                {t('setup.theme.title')}
            </h2>
            <p className="text-text-secondary mb-8">
                {t('setup.theme.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                    onClick={() => setTheme('light')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                        theme === 'light'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <SunIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {t('setup.theme.light')}
                    </h3>
                    <p className="text-sm text-text-secondary">
                        {t('setup.theme.lightDesc')}
                    </p>
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <Moon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {t('setup.theme.dark')}
                    </h3>
                    <p className="text-sm text-text-secondary">
                        {t('setup.theme.darkDesc')}
                    </p>
                </button>
            </div>
        </div>
    );

    const LanguageStep = () => (
        <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                {t('setup.language.title')}
            </h2>
            <p className="text-text-secondary mb-8">
                {t('setup.language.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                    onClick={() => setLanguage('en')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                        language === 'en'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <div className="text-4xl mb-4">🇺🇸</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">English</h3>
                    <p className="text-sm text-text-secondary">Use English interface</p>
                </button>
                <button
                    onClick={() => setLanguage('tr')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                        language === 'tr'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <div className="text-4xl mb-4">🇹🇷</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Türkçe</h3>
                    <p className="text-sm text-text-secondary">Türkçe arayüz kullan</p>
                </button>
            </div>
        </div>
    );

    const ApiStep = () => (
        <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                {t('setup.api.title')}
            </h2>
            <p className="text-text-secondary mb-8">
                {t('setup.api.description')}
            </p>
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setApiProvider('gemini')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            apiProvider === 'gemini'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-border-strong'
                        }`}
                    >
                        <h3 className="font-semibold text-text-primary">Google Gemini</h3>
                        <p className="text-sm text-text-secondary mt-1">{t('setup.api.recommended')}</p>
                    </button>
                    <button
                        onClick={() => setApiProvider('openai')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            apiProvider === 'openai'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-border-strong'
                        }`}
                    >
                        <h3 className="font-semibold text-text-primary">OpenAI</h3>
                        <p className="text-sm text-text-secondary mt-1">GPT Models</p>
                    </button>
                    <button
                        onClick={() => setApiProvider('claude')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            apiProvider === 'claude'
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-border-strong'
                        }`}
                    >
                        <h3 className="font-semibold text-text-primary">Anthropic Claude</h3>
                        <p className="text-sm text-text-secondary mt-1">Claude Models</p>
                    </button>
                </div>
                <div className="bg-background-secondary p-4 rounded-lg text-left">
                    <p className="text-sm text-text-secondary">
                        <strong className="text-text-primary">{t('setup.api.note')}:</strong> {t('setup.api.noteDesc')}
                    </p>
                </div>
            </div>
        </div>
    );

    const CompleteStep = () => (
        <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
                <CircleCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                {t('setup.complete.title')}
            </h2>
            <p className="text-text-secondary mb-8">
                {t('setup.complete.description')}
            </p>
            <div className="bg-background-secondary p-6 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold text-text-primary mb-4">{t('setup.complete.summary')}</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-secondary">{t('setup.complete.theme')}:</span>
                        <span className="text-text-primary capitalize">{theme}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">{t('setup.complete.language')}:</span>
                        <span className="text-text-primary">{language === 'en' ? 'English' : 'Türkçe'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-secondary">{t('setup.complete.apiProvider')}:</span>
                        <span className="text-text-primary capitalize">{apiProvider}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 'welcome': return <WelcomeStep />;
            case 'theme': return <ThemeStep />;
            case 'language': return <LanguageStep />;
            case 'api': return <ApiStep />;
            case 'complete': return <CompleteStep />;
            default: return <WelcomeStep />;
        }
    };

    return (
        <div className="fixed inset-0 bg-background z-[100] overflow-y-auto">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-border z-10">
                <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6">
                    <div className="text-sm text-text-secondary">
                        {t('setup.step')} {currentStepIndex + 1} {t('setup.of')} {steps.length}
                    </div>
                    <div className="text-sm text-text-secondary">
                        Neural Pad {t('setup.setup')}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className={`w-full max-w-4xl transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                        {renderStep()}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border">
                    <div className="flex justify-between items-center max-w-4xl mx-auto">
                        <button
                            onClick={prevStep}
                            disabled={currentStepIndex === 0}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                currentStepIndex === 0
                                    ? 'opacity-50 cursor-not-allowed text-text-secondary'
                                    : 'text-text-primary hover:bg-background-secondary'
                            }`}
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            {t('setup.back')}
                        </button>

                        {currentStep === 'complete' ? (
                            <button
                                onClick={handleComplete}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-text rounded-lg font-medium hover:bg-primary-hover transition-all"
                            >
                                {t('setup.startUsing')}
                                <CircleCheckIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-text rounded-lg font-medium hover:bg-primary-hover transition-all"
                            >
                                {t('setup.next')}
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;