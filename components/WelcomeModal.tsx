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
    const [isElectron, setIsElectron] = useState(false);

    // Check if running in Electron
    useEffect(() => {
        const electron = (window as any)?.electron?.isElectron === true;
        setIsElectron(electron);
    }, []);

    // Slider state for mockups
    const images = Array.from({ length: 8 }, (_, i) => `./${i + 1}.png`);
    const captions = Array.from({ length: 8 }, (_, i) => ({
        title: t(`landingPage.mockupsItems.i${i + 1}.title`),
        desc: t(`landingPage.mockupsItems.i${i + 1}.desc`),
    }));
    const [current, setCurrent] = useState(0);
    const isHoveringRef = useRef(false);
    const [parallaxOffset, setParallaxOffset] = useState(0);
    
    // Auto-play effect
    useEffect(() => {
        const id = window.setInterval(() => {
            if (!isHoveringRef.current) setCurrent((c) => (c + 1) % images.length);
        }, 4000);
        return () => window.clearInterval(id);
    }, []);
    
    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            setParallaxOffset(scrolled * 0.3); // Parallax speed multiplier
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Keyboard navigation effect
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                prev();
            } else if (e.key === 'ArrowRight') {
                next();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    const next = () => setCurrent((c) => (c + 1) % images.length);
    const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

    if (!isOpen) {
        return null;
    }

    const Feature: React.FC<{ icon: React.ReactElement; titleKey: string; descriptionKey: string }> = ({ icon, titleKey, descriptionKey }) => (
        <div className="feature-card-3d group">
            <div className="feature-card glassmorphism flex flex-col items-center text-center p-8 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                <div className="relative z-10 flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                    {icon}
                </div>
                <h3 className="relative z-10 text-xl font-bold text-text-primary mb-3">{t(titleKey)}</h3>
                <p className="relative z-10 text-sm text-text-secondary leading-relaxed">{t(descriptionKey)}</p>
            </div>
        </div>
    );

    const ExportFeature: React.FC<{ icon: React.ReactElement; title: string; description: string }> = ({ icon, title, description }) => (
        <div className="feature-card-3d group">
            <div className="feature-card glassmorphism flex flex-col items-center text-center p-8 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                <div className="relative z-10 flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
                    {icon}
                </div>
                <h3 className="relative z-10 text-xl font-bold text-text-primary mb-3">{title}</h3>
                <p className="relative z-10 text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
        </div>
    );

    const DownloadButton: React.FC<{ icon: React.ReactElement; osName: string; downloadUrl?: string }> = ({ icon, osName, downloadUrl }) => {
        const handleDownload = () => {
            if (downloadUrl) {
                try {
                    const newWindow = window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                    if (newWindow) {
                        newWindow.opener = null;
                    }
                } catch (error) {
                    console.error('Failed to open download link:', error);
                }
            }
        };

        return (
            <button 
                onClick={handleDownload}
                disabled={!downloadUrl}
                aria-label={`Download for ${osName}`}
                className={`download-btn group relative glassmorphism flex items-center justify-center gap-3 w-full px-6 py-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-300/40 hover:border-purple-400/60 rounded-2xl font-bold text-text-primary transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 ${!downloadUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <span className="relative z-10 transform group-hover:scale-110 transition-transform">{icon}</span>
                <span className="relative z-10">{t('landingPage.downloadFor')} {osName}</span>
                <svg className="relative z-10 w-5 h-5 group-hover:translate-y-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        );
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-[100] overflow-y-auto animate-modal-enter" data-theme="default">
            {/* Enhanced Navbar with Glassmorphism */}
            <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism bg-background/80 backdrop-blur-2xl border-b border-primary/20 shadow-2xl shadow-primary/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo with hover effect */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => scrollToSection('hero')}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/30 transition-all"></div>
                            <img src="./Logo.png" alt="Neural Pad" className="relative w-10 h-10 object-contain transform group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Neural Pad
                        </span>
                    </div>
                    
                    {/* Navigation Links with enhanced hover effects */}
                    <div className="hidden md:flex items-center gap-8">
                        <button 
                            onClick={() => scrollToSection('hero')}
                            className="relative text-text-secondary hover:text-primary transition-all duration-300 font-medium group"
                        >
                            <span className="relative z-10">{language === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <button 
                            onClick={() => scrollToSection('features')}
                            className="relative text-text-secondary hover:text-primary transition-all duration-300 font-medium group"
                        >
                            <span className="relative z-10">{language === 'tr' ? 'Özellikler' : 'Features'}</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <button 
                            onClick={() => scrollToSection('mockups')}
                            className="relative text-text-secondary hover:text-primary transition-all duration-300 font-medium group"
                        >
                            <span className="relative z-10">{language === 'tr' ? 'Ekran Görüntüleri' : 'Screenshots'}</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <button 
                            onClick={() => scrollToSection('download')}
                            className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary hover:from-primary/20 hover:to-purple-600/20 transition-all duration-300 font-semibold border border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
                        >
                            {language === 'tr' ? 'İndir' : 'Download'}
                        </button>
                    </div>

                    {/* Language Selector with enhanced styling */}
                    <div className="flex gap-2" role="group" aria-label="Language selector">
                        <button
                            onClick={() => setLanguage('en')}
                            aria-label="Switch to English"
                            aria-pressed={language === 'en'}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                language === 'en'
                                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-background-secondary text-text-secondary hover:bg-border hover:scale-105'
                            }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('tr')}
                            aria-label="Türkçe'ye geç"
                            aria-pressed={language === 'tr'}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                language === 'tr'
                                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-background-secondary text-text-secondary hover:bg-border hover:scale-105'
                            }`}
                        >
                            TR
                        </button>
                    </div>
                </div>
            </nav>
            
            <main className="max-w-5xl mx-auto px-6 pt-20">
                <section id="hero" className="text-center flex flex-col items-center py-20 md:py-32 relative">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    <div className="relative z-10 w-full">
                        <div className="relative w-32 h-32 mx-auto mb-8 animate-float">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-primary/30">
                                <img src="./Logo.png" alt="Logo" className="w-20 h-20 object-contain transform hover:scale-110 transition-transform" />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-7xl font-black text-text-primary tracking-tight mb-6 animate-fade-in-up bg-gradient-to-r from-text-primary via-primary to-text-primary bg-clip-text" style={{animationDelay: '0.1s'}}>
                            {t('landingPage.heroTitle')}
                        </h1>
                        <p className="text-lg md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 animate-fade-in-up leading-relaxed" style={{animationDelay: '0.3s'}}>
                            {t('landingPage.heroSubtitle')}
                        </p>
                        
                        {/* Sadece Electron'da giriş butonu göster */}
                        {isElectron && (
                            <button 
                                onClick={onClose} 
                                className="relative group bg-gradient-to-r from-primary to-purple-600 hover:from-primary-hover hover:to-purple-700 text-primary-text font-bold py-4 px-10 rounded-full text-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30 animate-fade-in-up shadow-2xl shadow-primary/40 hover:shadow-primary/60" 
                                style={{animationDelay: '0.5s'}}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <SparkleIcon className="w-5 h-5" />
                                    {t('landingPage.cta')}
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                            </button>
                        )}
                    </div>
                </section>

                <section id="mockups" className="py-12 md:py-16 scroll-mt-20 relative">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="text-center mb-12 animate-fade-in">
                            <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-4 bg-gradient-to-r from-text-primary via-primary to-text-primary bg-clip-text">
                                {t('landingPage.mockupsTitle')}
                            </h2>
                            <p className="text-base md:text-lg text-text-secondary">
                                {t('landingPage.mockupsSubtitle')}
                            </p>
                        </div>

                        <div
                            className="relative"
                            onMouseEnter={() => (isHoveringRef.current = true)}
                            onMouseLeave={() => (isHoveringRef.current = false)}
                        >
                            {/* Glow effect around slider */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>
                            
                            <div 
                                className="relative glassmorphism rounded-3xl p-4 shadow-2xl border border-primary/20 hover:border-primary/30 transition-all animate-fade-in-up"
                                style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
                            >
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
<img 
                                                src={src} 
                                                alt={`Neural Pad Screenshot ${i + 1}: ${captions[i]?.title || 'App feature'}`} 
                                                className="absolute inset-0 w-full h-full object-contain bg-background landing-image" 
                                                style={{
                                                    transform: current === i ? 'scale(1.05) translateZ(20px)' : 'scale(1) translateZ(0)',
                                                    transition: 'transform 0.7s ease-in-out',
                                                    imageRendering: '-webkit-optimize-contrast',
                                                    WebkitFontSmoothing: 'antialiased',
                                                    backfaceVisibility: 'hidden'
                                                }}
                                                loading="eager"
                                                decoding="sync"
                                                fetchpriority="high"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/Logo.png';
                                                    e.currentTarget.style.objectFit = 'scale-down';
                                                }}
                                            />

                                            <div className="absolute bottom-0 left-0 right-0">
<div className="glassmorphism px-5 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent border-t border-white/20 landing-caption">
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
                                    className="absolute inset-y-0 left-2 md:left-4 w-12 md:w-14 grid place-items-center z-20 group"
                                >
                                    <span className="rounded-full bg-background/80 border-2 border-primary/30 backdrop-blur-xl p-2 md:p-3 hover:bg-background hover:border-primary hover:scale-110 transition-all shadow-lg hover:shadow-primary/30">
                                        <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6 -rotate-90 text-primary group-hover:text-primary-hover transition-colors" />
                                    </span>
                                </button>
                                <button
                                    aria-label="Next"
                                    onClick={next}
                                    className="absolute inset-y-0 right-2 md:right-4 w-12 md:w-14 grid place-items-center z-20 group"
                                >
                                    <span className="rounded-full bg-background/80 border-2 border-primary/30 backdrop-blur-xl p-2 md:p-3 hover:bg-background hover:border-primary hover:scale-110 transition-all shadow-lg hover:shadow-primary/30">
                                        <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6 rotate-90 text-primary group-hover:text-primary-hover transition-colors" />
                                    </span>
                                </button>

                                {/* Dots */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                    <div className="bg-background/80 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 shadow-lg">
                                        <div className="flex gap-2">
                                            {images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    aria-label={`Go to slide ${i + 1}`}
                                                    onClick={() => setCurrent(i)}
                                                    className={`h-2.5 rounded-full transition-all hover:scale-110 ${
                                                        current === i 
                                                            ? 'w-8 bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/50' 
                                                            : 'w-2.5 bg-border hover:bg-primary/50'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </section>

                <section id="features" className="py-16 md:py-24 scroll-mt-20">
                     <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                            {t('landingPage.featuresTitle')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        
                        {/* Voice Recognition */}
                        <div className="animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Sesli Not Alma' : 'Voice Recognition'}
                                description={language === 'tr' ? 'Konuşarak not yazın. Whisper AI ve Web Speech API desteği. Eller serbest çalışın.' : 'Write notes by speaking. Whisper AI and Web Speech API support. Hands-free workflow.'}
                            />
                        </div>
                        
                        {/* Version History */}
                        <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Versiyon Geçmişi' : 'Version History'}
                                description={language === 'tr' ? 'Not geçmişini görüntüleyin. Eski versiyonlara kolayca geri dönün. Hiçbir değişiklik kaybolmaz.' : 'View note history. Easily restore previous versions. Never lose any changes.'}
                            />
                        </div>
                        
                        {/* Keyboard Shortcuts */}
                        <div className="animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Klavye Kısayolları' : 'Keyboard Shortcuts'}
                                description={language === 'tr' ? 'Ctrl+S kaydet, Ctrl+N yeni not. Hızlı ve verimli çalışın. Profesyonel iş akışı.' : 'Ctrl+S save, Ctrl+N new note. Work fast and efficiently. Professional workflow.'}
                            />
                        </div>
                        
                        {/* Cross-Platform */}
                        <div className="animate-fade-in-up" style={{animationDelay: '1.0s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Çapraz Platform' : 'Cross-Platform'}
                                description={language === 'tr' ? 'Windows, macOS ve Linux desteği. Aynı arayüz, aynı özellikler. Her platformda mükemmel.' : 'Windows, macOS and Linux support. Same interface, same features. Perfect on every platform.'}
                            />
                        </div>
                        
                        {/* Rich Text Editor */}
                        <div className="animate-fade-in-up" style={{animationDelay: '1.1s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Zengin Metin Editörü' : 'Rich Text Editor'}
                                description={language === 'tr' ? 'TipTap editör. Tablo, resim, kod bloğu. Yazı tipi, renk, formatlar. WYSIWYG düzenleme.' : 'TipTap editor. Tables, images, code blocks. Fonts, colors, formats. WYSIWYG editing.'}
                            />
                        </div>
                        
                        {/* Dark Mode */}
                        <div className="animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Karanlık Mod' : 'Dark Mode'}
                                description={language === 'tr' ? 'Göz dostu karanlık tema. Gece çalışmaları için ideal. Otomatik tema değiştirme.' : 'Eye-friendly dark theme. Perfect for night work. Automatic theme switching.'}
                            />
                        </div>
                        
                        {/* Export Features */}
                        <div className="animate-fade-in-up" style={{animationDelay: '1.3s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'PDF Export' : 'PDF Export'}
                                description={language === 'tr' ? 'Notlarınızı profesyonel PDF formatında dışa aktarın. Formatlamalar ve resimler korunur.' : 'Export your notes as professional PDFs. Formatting and images preserved.'}
                            />
                        </div>
                        
                        <div className="animate-fade-in-up" style={{animationDelay: '1.4s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'HTML Export' : 'HTML Export'}
                                description={language === 'tr' ? 'Web sayfası olarak kaydedin. Tüm stil ve formatlar korunur.' : 'Save as web page. All styles and formats preserved.'}
                            />
                        </div>
                        
                        <div className="animate-fade-in-up" style={{animationDelay: '1.5s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Markdown Export' : 'Markdown Export'}
                                description={language === 'tr' ? 'Markdown formatında dışa aktarın. GitHub, GitLab ve diğer platformlar için ideal.' : 'Export as Markdown. Perfect for GitHub, GitLab and other platforms.'}
                            />
                        </div>
                        
                        <div className="animate-fade-in-up" style={{animationDelay: '1.6s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'TXT Export' : 'TXT Export'}
                                description={language === 'tr' ? 'Düz metin formatında kaydedin. Her yerde açılabilir, sade ve basit.' : 'Save as plain text. Opens anywhere, simple and clean.'}
                            />
                        </div>
                        
                        <div className="animate-fade-in-up" style={{animationDelay: '1.7s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'JSON Yedekleme' : 'JSON Backup'}
                                description={language === 'tr' ? 'Tam yedekleme için JSON formatında kaydedin. Tüm metadata dahil.' : 'Save as JSON for full backup. All metadata included.'}
                            />
                        </div>
                        
                        <div className="animate-fade-in-up" style={{animationDelay: '1.8s'}}>
                            <ExportFeature 
                                icon={
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                } 
                                title={language === 'tr' ? 'Çoklu Format' : 'Multi Format'}
                                description={language === 'tr' ? 'PDF, HTML, Markdown, TXT ve JSON. İhtiyacınıza göre seçin.' : 'PDF, HTML, Markdown, TXT and JSON. Choose what fits your needs.'}
                            />
                        </div>
                    </div>
                </section>


                 <section id="download" className="py-16 md:py-24 text-center scroll-mt-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-4 animate-fade-in">
                        {t('landingPage.downloadTitle')}
                    </h2>
                    <p className="text-lg text-text-secondary max-w-xl mx-auto mb-12 animate-fade-in">
                        {t('landingPage.downloadSubtitle')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            <DownloadButton 
                                icon={<AppleIcon />} 
                                osName="macOS" 
                                downloadUrl="https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.dmg"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <DownloadButton 
                                icon={<WindowsIcon />} 
                                osName="Windows" 
                                downloadUrl="https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe"
                            />
                        </div>
                        <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                            <DownloadButton 
                                icon={<LinuxIcon />} 
                                osName="Linux" 
                                downloadUrl="https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.AppImage"
                            />
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

                        {/* Features */}
                        <div className="text-center">
                            <h4 className="text-lg font-semibold text-white mb-4">
                                {language === 'tr' ? 'Özellikler' : 'Features'}
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center justify-center gap-2">
                                    <ChatIcon className="w-4 h-4 text-purple-400" />
                                    <span>{language === 'tr' ? 'AI Sohbet Asistanı' : 'AI Chat Assistant'}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-purple-400" />
                                    <span>{language === 'tr' ? 'Görsel Zeka' : 'Visual Intelligence'}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <TagIcon className="w-4 h-4 text-purple-400" />
                                    <span>{language === 'tr' ? 'Akıllı Etiketleme' : 'Smart Tagging'}</span>
                                </li>
                                <li className="flex items-center justify-center gap-2">
                                    <LockIcon className="w-4 h-4 text-purple-400" />
                                    <span>{language === 'tr' ? 'Şifreli Notlar' : 'Encrypted Notes'}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="text-center md:text-right">
                            <h4 className="text-lg font-semibold text-white mb-4">
                                {language === 'tr' ? 'İletişim' : 'Contact'}
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
