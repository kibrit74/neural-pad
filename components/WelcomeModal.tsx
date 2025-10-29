import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { SparkleIcon, ImageIcon, ChatIcon, TagIcon, AppleIcon, WindowsIcon, LinuxIcon } from './icons/Icons';

interface LandingPageProps {
    isOpen: boolean;
    onClose: () => void; // This will now function as onEnter
}

const LandingPage: React.FC<LandingPageProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslations();

    if (!isOpen) {
        return null;
    }

    const Feature: React.FC<{ icon: React.ReactElement; titleKey: string; descriptionKey: string }> = ({ icon, titleKey, descriptionKey }) => (
        <div className="feature-card flex flex-col items-center text-center p-6 bg-background-secondary rounded-xl">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{t(titleKey)}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{t(descriptionKey)}</p>
        </div>
    );

    const DownloadButton: React.FC<{ icon: React.ReactElement; osName: string }> = ({ icon, osName }) => (
        <button className="download-btn flex items-center justify-center gap-3 w-full px-6 py-4 bg-background-secondary rounded-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
            {icon}
            <span>{t('landingPage.downloadFor')} {osName}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-background z-[100] overflow-y-auto animate-modal-enter">
            <main className="max-w-5xl mx-auto px-6">
                {/* Hero Section */}
                <section className="text-center flex flex-col items-center py-20 md:py-32">
                    <div className="w-24 h-24 mb-6 flex items-center justify-center animate-float">
                        <img src="./Logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tight mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                        {t('landingPage.heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary max-w-3xl mb-10 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                        {t('landingPage.heroSubtitle')}
                    </p>
                    <button 
                        onClick={onClose} 
                        className="bg-primary text-primary-text font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-hover transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30 animate-fade-in-up animate-pulse-glow" 
                        style={{animationDelay: '0.5s'}}
                    >
                        {t('landingPage.cta')}
                    </button>
                </section>

                {/* Features Section */}
                <section className="py-16 md:py-24">
                     <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                            {t('landingPage.featuresTitle')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            <Feature 
                                icon={<SparkleIcon width="24" height="24" />} 
                                titleKey="welcome.feature1Title"
                                descriptionKey="welcome.feature1Description"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <Feature 
                                icon={<ImageIcon width="24" height="24" />} 
                                titleKey="welcome.feature2Title"
                                descriptionKey="welcome.feature2Description"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            <Feature 
                                icon={<ChatIcon width="24" height="24" />} 
                                titleKey="welcome.feature3Title"
                                descriptionKey="welcome.feature3Description"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                            <Feature 
                                icon={<TagIcon width="24" height="24" />} 
                                titleKey="welcome.feature4Title"
                                descriptionKey="welcome.feature4Description"
                            />
                        </div>
                    </div>
                </section>

                 {/* Download Section */}
                <section className="py-16 md:py-24 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-4 animate-fade-in">
                        {t('landingPage.downloadTitle')}
                    </h2>
                    <p className="text-lg text-text-secondary max-w-xl mx-auto mb-12 animate-fade-in">
                        {t('landingPage.downloadSubtitle')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            <DownloadButton icon={<AppleIcon />} osName="macOS" />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <DownloadButton icon={<WindowsIcon />} osName="Windows" />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            <DownloadButton icon={<LinuxIcon />} osName="Linux" />
                        </div>
                    </div>
                </section>

            </main>
            {/* Footer */}
            <footer className="text-center py-10 border-t border-border">
                <p className="text-text-secondary">{t('landingPage.footerText', { year: new Date().getFullYear().toString() })}</p>
            </footer>
        </div>
    );
};

export default LandingPage;