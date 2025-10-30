import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import { SparkleIcon, ImageIcon, ChatIcon, TagIcon, AppleIcon, WindowsIcon, LinuxIcon, ChevronDownIcon, DownloadIcon, LockIcon } from './icons/Icons';

interface LandingPageProps {
    isOpen: boolean;
    onClose: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslations();
    const { language, setLanguage } = useLanguage();

    // Slider state for mockups
    const images = Array.from({ length: 8 }, (_, i) => `./${i + 1}.png`);
    const captions = Array.from({ length: 8 }, (_, i) => ({
        title: t(`landingPage.mockupsItems.i${i + 1}.title`),
        desc: t(`landingPage.mockupsItems.i${i + 1}.desc`),
    }));
    const [current, setCurrent] = useState(0);
    const isHoveringRef = useRef(false);
    useEffect(() => {
        const id = window.setInterval(() => {
            if (!isHoveringRef.current) setCurrent((c) => (c + 1) % images.length);
        }, 4000);
        return () => window.clearInterval(id);
    }, []);
    const next = () => setCurrent((c) => (c + 1) % images.length);
    const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

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

    const DownloadButton: React.FC<{ icon: React.ReactElement; osName: string; downloadUrl?: string }> = ({ icon, osName, downloadUrl }) => {
        const handleDownload = () => {
            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
            }
        };

        return (
            <button 
                onClick={handleDownload}
                disabled={!downloadUrl}
                className={`download-btn flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-300/30 rounded-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ${!downloadUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {icon}
                <span>{t('landingPage.downloadFor')} {osName}</span>
            </button>
        );
    };

    return (
        <div className="fixed inset-0 bg-background z-[100] overflow-y-auto animate-modal-enter" data-theme="default">
            <div className="fixed top-6 right-6 z-10 flex gap-2">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        language === 'en'
                            ? 'bg-primary text-primary-text shadow-lg'
                            : 'bg-background-secondary text-text-secondary hover:bg-border'
                    }`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('tr')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        language === 'tr'
                            ? 'bg-primary text-primary-text shadow-lg'
                            : 'bg-background-secondary text-text-secondary hover:bg-border'
                    }`}
                >
                    TR
                </button>
            </div>
            
            <main className="max-w-5xl mx-auto px-6">
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

                <section className="py-12 md:py-16">
                    <div className="text-center mb-8 animate-fade-in">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                            {t('landingPage.mockupsTitle')}
                        </h2>
                        <p className="text-sm md:text-base text-text-secondary mt-2">
                            {t('landingPage.mockupsSubtitle')}
                        </p>
                    </div>

                    <div
                        className="relative"
                        onMouseEnter={() => (isHoveringRef.current = true)}
                        onMouseLeave={() => (isHoveringRef.current = false)}
                    >
                        <div className="rounded-2xl border border-border bg-background-secondary/80 backdrop-blur p-3 shadow-2xl animate-fade-in-up">
<div className="relative h-80 md:h-[32rem] overflow-hidden rounded-xl bg-background">
                                {/* Browser chrome */}
                                <div className="absolute top-3 left-4 z-10 flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-400/70"></span>
                                    <span className="w-3 h-3 rounded-full bg-yellow-400/70"></span>
                                    <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
                                </div>

                                {/* Slides */}
                                <div
                                    className="h-full w-full flex transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${current * 100}%)` }}
                                >
                                    {images.map((src, i) => (
                                        <div key={i} className="h-full w-full flex-shrink-0 relative">
<img src={src} alt={`Mockup ${i + 1}`} className="absolute inset-0 w-full h-full object-contain bg-background landing-image" loading="lazy" />

                                            <div className="absolute bottom-0 left-0 right-0">
<div className="px-5 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm border-t border-border landing-caption">
<h3 className="text-lg md:text-xl font-semibold landing-caption-title">
                                                        {captions[i]?.title}
                                                    </h3>
<p className="text-sm md:text-base mt-1 landing-caption-desc">
                                                        {captions[i]?.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Controls */}
                                <button
                                    aria-label="Previous"
                                    onClick={prev}
                                    className="absolute inset-y-0 left-0 w-10 md:w-12 grid place-items-center"
                                >
                                    <span className="rounded-full bg-background/70 border border-border backdrop-blur p-1 hover:bg-background/90 transition">
                                        <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                                    </span>
                                </button>
                                <button
                                    aria-label="Next"
                                    onClick={next}
                                    className="absolute inset-y-0 right-0 w-10 md:w-12 grid place-items-center"
                                >
                                    <span className="rounded-full bg-background/70 border border-border backdrop-blur p-1 hover:bg-background/90 transition">
                                        <ChevronDownIcon className="w-5 h-5 rotate-90" />
                                    </span>
                                </button>

                                {/* Dots */}
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            aria-label={`Go to slide ${i + 1}`}
                                            onClick={() => setCurrent(i)}
                                            className={`h-2.5 w-2.5 rounded-full transition-all ${
                                                current === i ? 'bg-primary w-5' : 'bg-border'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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
                        <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                            <Feature 
                                icon={<DownloadIcon width="24" height="24" />} 
                                titleKey="landingPage.newFeatures.backupTitle"
                                descriptionKey="landingPage.newFeatures.backupDesc"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                            <Feature 
                                icon={<LockIcon width="24" height="24" />} 
                                titleKey="landingPage.newFeatures.secureTitle"
                                descriptionKey="landingPage.newFeatures.secureDesc"
                            />
                        </div>
                    </div>
                </section>


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
                            <DownloadButton 
                                icon={<WindowsIcon />} 
                                osName="Windows" 
                                downloadUrl="https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            <DownloadButton icon={<LinuxIcon />} osName="Linux" />
                        </div>
                    </div>
                </section>

            </main>
            <footer className="bg-gradient-to-r from-gray-700 to-gray-800 border-t border-gray-600">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Logo ve Açıklama */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-white p-1 shadow-sm">
                                    <img src="/Logo.png" alt="Neural Pad Logo" className="w-full h-full object-contain" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Neural Pad</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {language === 'tr' 
                                    ? 'AI destekli akıllı not defteri. Notlarınızı yazın, organize edin, güvenle saklayın ve yapay zeka ile geliştirin.'
                                    : 'AI-powered smart notebook. Write, organize, secure your notes and enhance them with artificial intelligence.'
                                }
                            </p>
                        </div>

                        {/* Hızlı Linkler */}
                        <div className="text-center">
                            <h4 className="text-lg font-semibold text-white mb-4">
                                {t('welcome.quickLinks.features')}
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center justify-center gap-2">
                                    <ChatIcon className="w-4 h-4 text-purple-400" />
                                    <span>{t('welcome.quickLinks.aiChat')}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-purple-400" />
                                    <span>{t('welcome.quickLinks.imageAnalysis')}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <TagIcon className="w-4 h-4 text-purple-400" />
                                    <span>{t('welcome.quickLinks.tagging')}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <LockIcon className="w-4 h-4 text-purple-400" />
                                    <span>{t('landingPage.newFeatures.secureTitle')}</span>
                                </li>
                            </ul>
                        </div>

                        {/* İletişim */}
                        <div className="text-center md:text-right">
                            <h4 className="text-lg font-semibold text-white mb-4">
                                {t('welcome.quickLinks.contact')}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-center md:justify-end gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                    </svg>
                                    <a 
                                        href="mailto:zubobilisim@gmail.com" 
                                        className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm"
                                    >
                                        zubobilisim@gmail.com
                                    </a>
                                </div>
                                
                                {/* Sosyal Medya İkonları */}
                                <div className="flex items-center justify-center md:justify-end gap-4 mt-4">
                                    <a 
                                        href="https://github.com/kibrit74/neural-pad" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-gray-600 hover:bg-purple-500/20 text-gray-300 hover:text-purple-400 transition-all duration-200"
                                        aria-label="GitHub"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                    </a>
                                    <a 
                                        href="https://twitter.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-gray-600 hover:bg-purple-500/20 text-gray-300 hover:text-purple-400 transition-all duration-200"
                                        aria-label="Twitter"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                    </a>
                                    <a 
                                        href="https://linkedin.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-gray-600 hover:bg-purple-500/20 text-gray-300 hover:text-purple-400 transition-all duration-200"
                                        aria-label="LinkedIn"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alt Çizgi ve Telif Hakkı */}
                    <div className="border-t border-gray-600 pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-400 text-sm">
                                {t('landingPage.footerText', { year: new Date().getFullYear().toString() })}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <span className="hover:text-purple-400 cursor-pointer transition-colors">
                                    {t('welcome.quickLinks.privacyPolicy')}
                                </span>
                                <span className="hover:text-purple-400 cursor-pointer transition-colors">
                                    {t('welcome.quickLinks.termsOfService')}
                                </span>
                                <span className="hover:text-purple-400 cursor-pointer transition-colors">
                                    {t('welcome.quickLinks.support')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
