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
    const [current, setCurrent] = useState(0);
    const isHoveringRef = useRef(false);

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
    
    // Auto-play effect with better timing
    useEffect(() => {
        const id = window.setInterval(() => {
            if (!isHoveringRef.current) setCurrent((c) => (c + 1) % images.length);
        }, 5000);
        return () => window.clearInterval(id);
    }, [images.length]);
    
    const next = () => setCurrent((c) => (c + 1) % images.length);
    const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

    if (!isOpen) {
        return null;
    }

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 z-[100] overflow-y-auto">
            {/* Enhanced Floating Navbar */}
            <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all"></div>
                                <img src="./Logo.png" alt="Neural Pad" className="relative w-10 h-10 object-contain transform group-hover:scale-110 transition-all" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Neural Pad
                            </span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-6">
                            <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-white transition-all font-medium relative group">
                                {language === 'tr' ? 'Özellikler' : 'Features'}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all"></span>
                            </button>
                            <button onClick={() => scrollToSection('mockups')} className="text-slate-300 hover:text-white transition-all font-medium relative group">
                                {language === 'tr' ? 'Görseller' : 'Screenshots'}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all"></span>
                            </button>
                            <button onClick={() => scrollToSection('download')} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30">
                                {language === 'tr' ? 'İndir' : 'Download'}
                            </button>
                        </div>

                        {/* Language Selector */}
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'tr')}
                            className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-all text-sm"
                        >
                            <option value="en">🇬🇧 English</option>
                            <option value="tr">🇹🇷 Türkçe</option>
                        </select>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative">
                {/* Hero Section - Ultra Modern */}
                <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12 relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-8 animate-bounce">
                            <SparkleIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-semibold text-purple-300">
                                {language === 'tr' ? 'AI Destekli Not Alma' : 'AI-Powered Note Taking'}
                            </span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                                {t('landingPage.heroTitle')}
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            {t('landingPage.heroSubtitle')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            {isElectron ? (
                                <button 
                                    onClick={onClose}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105 hover:shadow-purple-500/70"
                                >
                                    <span className="flex items-center gap-2">
                                        <SparkleIcon className="w-5 h-5" />
                                        {t('landingPage.cta')}
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => scrollToSection('download')}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105 hover:shadow-purple-500/70"
                                >
                                    <span className="flex items-center gap-2">
                                        <DownloadIcon className="w-5 h-5" />
                                        {language === 'tr' ? 'Ücretsiz İndir' : 'Download Free'}
                                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </button>
                            )}
                            
                            <button 
                                onClick={() => scrollToSection('mockups')}
                                className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white text-lg font-semibold rounded-xl border-2 border-slate-700 hover:border-purple-500 transition-all shadow-lg"
                            >
                                <span className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    {language === 'tr' ? 'Görselleri İncele' : 'View Screenshots'}
                                </span>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">10x</div>
                                <div className="text-sm text-slate-400">{language === 'tr' ? 'Daha Hızlı' : 'Faster'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
                                <div className="text-sm text-slate-400">{language === 'tr' ? 'Güvenli' : 'Secure'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-2">AI</div>
                                <div className="text-sm text-slate-400">{language === 'tr' ? 'Destekli' : 'Powered'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <button 
                        onClick={() => scrollToSection('features')}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
                    >
                        <div className="w-6 h-10 border-2 border-purple-500/50 rounded-full flex items-start justify-center p-2">
                            <div className="w-1 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        </div>
                    </button>
                </section>

                {/* Features Section - Enhanced */}
                <section id="features" className="py-20 px-6 relative">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                {language === 'tr' ? 'Güçlü Özellikler' : 'Powerful Features'}
                            </h2>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                {language === 'tr' 
                                    ? 'Notlarınızı bir üst seviyeye taşıyacak yapay zeka destekli araçlar' 
                                    : 'AI-powered tools to take your notes to the next level'}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Feature 1 */}
                            <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                                        <SparkleIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t('landingPage.featureAI.title')}</h3>
                                    <p className="text-slate-400 leading-relaxed">{t('landingPage.featureAI.description')}</p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t('landingPage.featureSpeed.title')}</h3>
                                    <p className="text-slate-400 leading-relaxed">{t('landingPage.featureSpeed.description')}</p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-green-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                                        <LockIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t('landingPage.featureSecurity.title')}</h3>
                                    <p className="text-slate-400 leading-relaxed">{t('landingPage.featureSecurity.description')}</p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-yellow-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                                        <ImageIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t('landingPage.featureRichText.title')}</h3>
                                    <p className="text-slate-400 leading-relaxed">{t('landingPage.featureRichText.description')}</p>
                                </div>
                            </div>

                            {/* Feature 5 */}
                            <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-pink-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                                        <ChatIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t('landingPage.featureChat.title')}</h3>
                                    <p className="text-slate-400 leading-relaxed">{t('landingPage.featureChat.description')}</p>
                                </div>
                            </div>

                            {/* Feature 6 */}
                            <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                                        <TagIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{t('landingPage.featureTags.title')}</h3>
                                    <p className="text-slate-400 leading-relaxed">{t('landingPage.featureTags.description')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Screenshots Section - Premium */}
                <section id="mockups" className="py-20 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                {language === 'tr' ? 'Uygulamadan Görseller' : 'App Screenshots'}
                            </h2>
                            <p className="text-lg text-slate-400">
                                {language === 'tr' 
                                    ? 'Modern ve kullanıcı dostu arayüz' 
                                    : 'Modern and user-friendly interface'}
                            </p>
                        </div>

                        {/* Premium Screenshot Slider */}
                        <div 
                            className="relative aspect-video max-w-5xl mx-auto"
                            onMouseEnter={() => (isHoveringRef.current = true)}
                            onMouseLeave={() => (isHoveringRef.current = false)}
                        >
                            {/* Mac-style window frame */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Window controls */}
                                <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900/90 border-b border-slate-700/50 flex items-center px-4 z-20">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
                                    </div>
                                    <div className="flex-1 text-center text-sm text-slate-400 font-medium">
                                        Neural Pad
                                    </div>
                                </div>

                                {/* Slides container */}
                                <div className="absolute top-12 left-0 right-0 bottom-0">
                                    <div 
                                        className="h-full w-full flex transition-transform duration-700 ease-out"
                                        style={{ transform: `translateX(-${current * 100}%)` }}
                                    >
                                        {images.map((src, i) => (
                                            <div key={i} className="h-full w-full flex-shrink-0 relative">
                                                <img 
                                                    src={src} 
                                                    alt={`Neural Pad Screenshot ${i + 1}`}
                                                    className="absolute inset-0 w-full h-full object-contain bg-slate-900 landing-image"
                                                    style={{
                                                        transform: current === i ? 'scale(1)' : 'scale(0.98)',
                                                        opacity: current === i ? 1 : 0.4,
                                                        transition: 'all 0.7s ease-out',
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

                                                {/* Caption overlay - modern design */}
                                                {current === i && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent p-8">
                                                        <div className="max-w-3xl">
                                                            <h3 className="text-2xl font-bold text-white mb-2">
                                                                {captions[i]?.title}
                                                            </h3>
                                                            <p className="text-slate-300 text-lg">
                                                                {captions[i]?.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Arrows - Premium style */}
                                <button
                                    onClick={prev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
                                    aria-label="Previous"
                                >
                                    <ChevronDownIcon className="w-6 h-6 -rotate-90 text-white" />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
                                    aria-label="Next"
                                >
                                    <ChevronDownIcon className="w-6 h-6 rotate-90 text-white" />
                                </button>

                                {/* Dots indicator - modern */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-full px-4 py-2">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrent(i)}
                                            className={`transition-all rounded-full ${
                                                current === i 
                                                    ? 'w-8 h-3 bg-gradient-to-r from-purple-500 to-pink-500' 
                                                    : 'w-3 h-3 bg-slate-600 hover:bg-slate-500'
                                            }`}
                                            aria-label={`Go to slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Glow effect */}
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl scale-105"></div>
                        </div>

                        {/* Navigation hints */}
                        <div className="text-center mt-8 text-sm text-slate-500">
                            <p>{language === 'tr' ? '← → Ok tuşları ile gezinebilirsiniz' : 'Use ← → arrow keys to navigate'}</p>
                        </div>
                    </div>
                </section>

                {/* Download Section - Ultra Premium */}
                <section id="download" className="py-20 px-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>
                    
                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                {language === 'tr' ? 'Ücretsiz İndirin' : 'Download for Free'}
                            </h2>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                {language === 'tr' 
                                    ? 'Windows, macOS ve Linux için hazır. Şimdi indirin ve AI destekli not alma deneyimini yaşayın.' 
                                    : 'Available for Windows, macOS, and Linux. Download now and experience AI-powered note-taking.'}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Windows */}
                            <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                        <WindowsIcon className="w-10 h-10 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 text-center">Windows</h3>
                                    <p className="text-sm text-slate-400 mb-4 text-center">Windows 10/11</p>
                                    <button 
                                        onClick={() => console.log('Download Windows')}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        {language === 'tr' ? 'İndir' : 'Download'}
                                    </button>
                                </div>
                            </div>

                            {/* macOS */}
                            <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-gray-500/50 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/5 rounded-full blur-3xl group-hover:bg-gray-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gray-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                        <AppleIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 text-center">macOS</h3>
                                    <p className="text-sm text-slate-400 mb-4 text-center">macOS 11+</p>
                                    <button 
                                        onClick={() => console.log('Download macOS')}
                                        className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        {language === 'tr' ? 'İndir' : 'Download'}
                                    </button>
                                </div>
                            </div>

                            {/* Linux */}
                            <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 hover:border-orange-500/50 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all"></div>
                                <div className="relative">
                                    <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                        <LinuxIcon className="w-10 h-10 text-orange-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 text-center">Linux</h3>
                                    <p className="text-sm text-slate-400 mb-4 text-center">AppImage / Deb</p>
                                    <button 
                                        onClick={() => console.log('Download Linux')}
                                        className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        {language === 'tr' ? 'İndir' : 'Download'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional info */}
                        <div className="mt-12 text-center">
                            <p className="text-slate-400 text-sm mb-4">
                                {language === 'tr' 
                                    ? '✨ Kurulum dosyası yaklaşık 176 MB • Tüm özellikler ücretsiz' 
                                    : '✨ Installer size ~176 MB • All features free'}
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {language === 'tr' ? 'Ücretsiz' : 'Free'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {language === 'tr' ? 'Açık Kaynak' : 'Open Source'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {language === 'tr' ? 'Reklam Yok' : 'No Ads'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 border-t border-slate-800">
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <img src="./Logo.png" alt="Neural Pad" className="w-8 h-8 object-contain" />
                            <span className="text-lg font-bold text-white">Neural Pad</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            © 2024 Neural Pad. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;

