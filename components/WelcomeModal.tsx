import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import {
    BrainIcon, SearchIcon, NotesIcon, ShareIcon, BellIcon, Moon,
    ZapIcon, PaletteIcon, ShieldIcon, KeyboardIcon, StarIcon,
    MonitorIcon, LaptopIcon, TerminalIcon, CheckIcon, FlameIcon,
    BriefcaseIcon, CodeIcon, GraduationCapIcon, BuildingIcon, GithubIcon,
    TwitterIcon, MessageCircleIcon, YoutubeIcon, DownloadIcon, PlayIcon,
    FileTextIcon, Share2Icon
} from './icons/Icons';

interface LandingPageProps {
    isOpen: boolean;
    onClose: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslations();
    const { language, setLanguage } = useLanguage();
    const [isElectron, setIsElectron] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Language-based text
    const texts = {
        navbar: {
            home: language === 'tr' ? 'Ana Sayfa' : 'Home',
            features: language === 'tr' ? 'Özellikler' : 'Features',
            app: language === 'tr' ? 'Uygulama' : 'Application',
            download: language === 'tr' ? 'İndir' : 'Download',
        },
        hero: {
            badge: language === 'tr' ? 'Yapay Zeka ile Güçlendirildi' : 'Powered by AI',
            title1: language === 'tr' ? 'Akıllı Not Tutmanın ' : 'The Future of ',
            title2: language === 'tr' ? 'Geleceği' : 'Smart Notes',
            subtitle: language === 'tr'
                ? 'Neural Pad ile notlarınızı AI destekli araçlarla yazın, düzenleyin ve organize edin. Verimliliğinizi %50 artırın.'
                : 'Write, edit and organize your notes with AI-powered tools. Increase your productivity by 50%.',
            cta: language === 'tr' ? 'Hemen Başla' : 'Get Started',
            watchDemo: language === 'tr' ? 'Demo İzle' : 'Watch Demo',
            stats: {
                users: language === 'tr' ? 'Aktif Kullanıcı' : 'Active Users',
                rating: language === 'tr' ? 'Kullanıcı Puanı' : 'User Rating',
                uptime: 'Uptime',
            },
        },
        socialProof: [
            { icon: BriefcaseIcon, text: language === 'tr' ? 'Avukatlar tarafından tercih ediliyor' : 'Trusted by lawyers' },
            { icon: CodeIcon, text: language === 'tr' ? 'Yazılımcılar tarafından sevildi' : 'Loved by developers' },
            { icon: GraduationCapIcon, text: language === 'tr' ? 'Öğrenciler için ideal' : 'Perfect for students' },
            { icon: BuildingIcon, text: language === 'tr' ? '50+ Şirket kullanıyor' : '50+ Companies use it' },
        ],
        features: {
            badge: language === 'tr' ? 'ÖZELLİKLER' : 'FEATURES',
            title: language === 'tr' ? 'Güçlü Özellikler, Basit Kullanım' : 'Powerful Features, Simple Use',
            subtitle: language === 'tr'
                ? 'Neural Pad, modern not tutma ihtiyaçlarınız için tasarlanmış güçlü araçlar sunar.'
                : 'Neural Pad offers powerful tools designed for modern note-taking needs.',
            items: [
                { icon: BrainIcon, title: language === 'tr' ? 'Yapay Zeka Destekli Yazım' : 'AI-Powered Writing', desc: language === 'tr' ? 'AI asistan ile metinlerinizi geliştirin, özetleyin ve profesyonel hale getirin.' : 'Improve, summarize and professionalize your texts with AI assistant.' },
                { icon: SearchIcon, title: language === 'tr' ? 'Akıllı Veri Tarama' : 'Smart Data Scanning', desc: language === 'tr' ? 'E-posta, telefon, tarih gibi verileri otomatik algılayın ve dışa aktarın.' : 'Automatically detect and export data like emails, phones, dates.' },
                { icon: FileTextIcon, title: language === 'tr' ? 'Zengin Metin Editörü' : 'Rich Text Editor', desc: language === 'tr' ? 'Slash komutları, formatlama ve blok yapısı ile profesyonel belgeler oluşturun.' : 'Create professional documents with slash commands, formatting and block structure.' },
                { icon: Share2Icon, title: language === 'tr' ? 'Çoklu Dışa Aktarım' : 'Multi-Format Export', desc: language === 'tr' ? 'PDF, Word, Excel, HTML ve Markdown formatlarında dışa aktarın.' : 'Export in PDF, Word, Excel, HTML and Markdown formats.' },
                { icon: BellIcon, title: language === 'tr' ? 'Akıllı Hatırlatıcılar' : 'Smart Reminders', desc: language === 'tr' ? 'Notlarınıza hatırlatıcı ekleyin ve önemli görevleri asla kaçırmayın.' : 'Add reminders to your notes and never miss important tasks.' },
                { icon: Moon, title: language === 'tr' ? 'Özelleştirilebilir Temalar' : 'Customizable Themes', desc: language === 'tr' ? 'Karanlık mod dahil 10+ tema seçeneği ile gözlerinizi koruyun.' : 'Protect your eyes with 10+ theme options including dark mode.' },
            ],
        },
        showcase: {
            badge: language === 'tr' ? 'UYGULAMA' : 'APPLICATION',
            title: language === 'tr' ? 'Modern ve Güçlü Editör' : 'Modern and Powerful Editor',
            subtitle: language === 'tr'
                ? 'Neural Pad\'in sezgisel arayüzü ile not tutmak hiç bu kadar kolay olmamıştı. Slash komutları, AI asistan ve zengin formatlama seçenekleri ile profesyonel belgeler oluşturun.'
                : 'Taking notes has never been easier with Neural Pad\'s intuitive interface. Create professional documents with slash commands, AI assistant and rich formatting options.',
            items: [
                { icon: ZapIcon, text: language === 'tr' ? 'Anında AI yanıtları' : 'Instant AI responses' },
                { icon: PaletteIcon, text: language === 'tr' ? 'Özelleştirilebilir arayüz' : 'Customizable interface' },
                { icon: ShieldIcon, text: language === 'tr' ? 'Yerel veri depolama' : 'Local data storage' },
                { icon: KeyboardIcon, text: language === 'tr' ? 'Klavye kısayolları' : 'Keyboard shortcuts' },
            ],
        },
        testimonials: {
            badge: language === 'tr' ? 'KULLANICI YORUMLARI' : 'TESTIMONIALS',
            title: language === 'tr' ? 'Kullanıcılarımız Ne Diyor?' : 'What Our Users Say?',
            subtitle: language === 'tr' ? 'Binlerce kullanıcının Neural Pad hakkındaki görüşleri.' : 'Opinions of thousands of users about Neural Pad.',
            items: [
                { name: 'Av. Ayşe Yılmaz', role: language === 'tr' ? 'Hukuk Bürosu Sahibi' : 'Law Firm Owner', initials: 'AY', text: language === 'tr' ? '"Avukatlık mesleğinde dava notları hayati önem taşıyor. Neural Pad\'in AI özellikleri sayesinde notlarımı çok daha hızlı organize edebiliyorum."' : '"Case notes are vital in the legal profession. Thanks to Neural Pad\'s AI features, I can organize my notes much faster."' },
                { name: 'Mehmet Kaya', role: 'Senior Developer', initials: 'MK', text: language === 'tr' ? '"Yazılım geliştirici olarak kod notlarımı tutmak için mükemmel. Markdown desteği ve dışa aktarım seçenekleri tam aradığım şeydi."' : '"Perfect for keeping my code notes as a developer. Markdown support and export options were exactly what I was looking for."' },
                { name: 'Elif Şahin', role: language === 'tr' ? 'Tıp Öğrencisi' : 'Medical Student', initials: 'ES', text: language === 'tr' ? '"Üniversite derslerinde not tutmak için en iyi uygulama. AI asistan ile ders notlarımı özetliyorum."' : '"The best app for taking notes in university classes. I summarize my lecture notes with the AI assistant."' },
            ],
        },
        download: {
            badge: language === 'tr' ? 'İNDİRME' : 'DOWNLOAD',
            title: language === 'tr' ? 'Masaüstü Uygulamasını Edinin' : 'Get the Desktop App',
            subtitle: language === 'tr'
                ? 'Tüm platformlar için ücretsiz, reklamsız ve açık kaynak. Verileriniz sadece sizin cihazınızda kalır.'
                : 'Free, ad-free and open source for all platforms. Your data stays only on your device.',
            downloadLabel: language === 'tr' ? 'İndir' : 'Download',
            trustBadges: [
                language === 'tr' ? '%100 Ücretsiz' : '100% Free',
                language === 'tr' ? 'Reklam Yok' : 'No Ads',
                language === 'tr' ? 'Açık Kaynak' : 'Open Source',
                language === 'tr' ? 'Gizlilik Garantili' : 'Privacy Guaranteed',
            ],
        },
        faq: {
            badge: language === 'tr' ? 'SSS' : 'FAQ',
            title: language === 'tr' ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions',
            items: [
                { q: language === 'tr' ? 'Neural Pad ücretsiz mi?' : 'Is Neural Pad free?', a: language === 'tr' ? 'Evet, Neural Pad tamamen ücretsizdir. Reklam içermez ve tüm özelliklere ücretsiz erişim sağlar.' : 'Yes, Neural Pad is completely free. It contains no ads and provides free access to all features.' },
                { q: language === 'tr' ? 'Verilerim güvende mi?' : 'Is my data safe?', a: language === 'tr' ? 'Kesinlikle! Neural Pad verilerinizi yerel olarak cihazınızda saklar.' : 'Absolutely! Neural Pad stores your data locally on your device.' },
                { q: language === 'tr' ? 'AI özellikleri nasıl çalışıyor?' : 'How do AI features work?', a: language === 'tr' ? 'Neural Pad, Google Gemini AI kullanarak metin iyileştirme, özetleme ve çeviri özellikleri sunar.' : 'Neural Pad uses Google Gemini AI for text improvement, summarization and translation features.' },
                { q: language === 'tr' ? 'Hangi platformları destekliyor?' : 'Which platforms does it support?', a: language === 'tr' ? 'Windows, macOS ve Linux işletim sistemlerinde çalışır.' : 'It works on Windows, macOS and Linux operating systems.' },
                { q: language === 'tr' ? 'Notlarımı dışa aktarabilir miyim?' : 'Can I export my notes?', a: language === 'tr' ? 'PDF, Word, Excel, HTML ve Markdown formatlarında dışa aktarabilirsiniz.' : 'You can export in PDF, Word, Excel, HTML and Markdown formats.' },
            ],
        },
        footer: {
            description: language === 'tr'
                ? 'Yapay zeka destekli akıllı not tutma uygulaması. Notlarınızı organize edin, verimliliğinizi artırın.'
                : 'AI-powered smart note-taking app. Organize your notes, increase your productivity.',
            columns: [
                { title: language === 'tr' ? 'Ürün' : 'Product', links: language === 'tr' ? ['Özellikler', 'İndir', 'Değişiklik Günlüğü', 'Yol Haritası'] : ['Features', 'Download', 'Changelog', 'Roadmap'] },
                { title: language === 'tr' ? 'Kaynaklar' : 'Resources', links: language === 'tr' ? ['Dokümantasyon', 'Klavye Kısayolları', 'API Referans', 'Blog'] : ['Documentation', 'Keyboard Shortcuts', 'API Reference', 'Blog'] },
                { title: language === 'tr' ? 'Destek' : 'Support', links: language === 'tr' ? ['SSS', 'İletişim', 'GitHub Issues', 'Discord'] : ['FAQ', 'Contact', 'GitHub Issues', 'Discord'] },
            ],
            copyright: `© ${new Date().getFullYear()} Neural Pad. ${language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}`,
        },
    };

    // Slider images - app screenshots
    const screenshots = [
        { src: '/screenshots/editor-main.png', alt: language === 'tr' ? 'Ana Editör' : 'Main Editor' },
        { src: '/screenshots/ai-menu.png', alt: language === 'tr' ? 'AI Menüsü' : 'AI Menu' },
        { src: '/screenshots/share-modal.png', alt: language === 'tr' ? 'Paylaşım' : 'Sharing' },
        { src: '/screenshots/reminder-modal.png', alt: language === 'tr' ? 'Hatırlatıcı' : 'Reminder' },
        { src: '/screenshots/data-hunter.png', alt: language === 'tr' ? 'Veri Tarama' : 'Data Scanning' },
        { src: '/screenshots/ai-chat.png', alt: language === 'tr' ? 'AI Sohbet' : 'AI Chat' },
    ];

    // Check if running in Electron
    useEffect(() => {
        const electron = (window as any)?.electron?.isElectron === true;
        setIsElectron(electron);
    }, []);

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % screenshots.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [screenshots.length]);

    if (!isOpen) return null;

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] overflow-y-auto"
            style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #1f1515 50%, #150a0a 100%)' }}
        >
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl border-b border-red-500/20" style={{ background: 'rgba(26, 10, 10, 0.9)' }}>
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                            <FlameIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-red-500">Neural Pad</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('hero')} className="text-gray-400 hover:text-red-500 transition-colors font-medium">{texts.navbar.home}</button>
                        <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-red-500 transition-colors font-medium">{texts.navbar.features}</button>
                        <button onClick={() => scrollToSection('showcase')} className="text-gray-400 hover:text-red-500 transition-colors font-medium">{texts.navbar.app}</button>
                        <button onClick={() => scrollToSection('download')} className="text-gray-400 hover:text-red-500 transition-colors font-medium">{texts.navbar.download}</button>
                    </div>

                    <div className="flex gap-2">
                        {['en', 'tr'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang as 'en' | 'tr')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${language === lang
                                    ? 'text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                style={language === lang ? { background: 'linear-gradient(135deg, #ef4444, #f97316)' } : {}}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="hero" className="min-h-screen pt-32 pb-20 px-6 flex items-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 mb-6">
                            <ZapIcon className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500 font-medium">{texts.hero.badge}</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                            <span className="text-white">{texts.hero.title1}</span>
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #ef4444, #f97316)' }}>{texts.hero.title2}</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">{texts.hero.subtitle}</p>

                        <div className="flex flex-wrap gap-4 mb-10">
                            {isElectron && (
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 rounded-xl text-white font-bold text-lg flex items-center gap-2 transition-all hover:scale-105 shadow-2xl shadow-red-500/30"
                                    style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    {texts.hero.cta}
                                </button>
                            )}
                            <button
                                onClick={() => scrollToSection('showcase')}
                                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 border border-white/20 text-white bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                            >
                                <PlayIcon className="w-5 h-5" />
                                {texts.hero.watchDemo}
                            </button>
                        </div>

                        <div className="flex gap-10">
                            <div>
                                <div className="text-2xl font-bold text-red-500">10,000+</div>
                                <div className="text-sm text-gray-500">{texts.hero.stats.users}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-500">4.9/5</div>
                                <div className="text-sm text-gray-500">{texts.hero.stats.rating}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-500">%99.9</div>
                                <div className="text-sm text-gray-500">{texts.hero.stats.uptime}</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-2xl blur-2xl opacity-30" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
                        <img
                            src="/screenshots/editor-main.png"
                            alt="Neural Pad Editor"
                            className="relative w-full rounded-2xl shadow-2xl border border-red-500/20"
                            style={{ animation: 'float 6s ease-in-out infinite' }}
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/251616/ef4444?text=Neural+Pad'; }}
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-10 border-y border-red-500/20" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-12">
                    {texts.socialProof.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-400">
                            <item.icon className="w-6 h-6 text-red-500" />
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-red-500 bg-red-500/15 mb-4">{texts.features.badge}</span>
                        <h2 className="text-4xl font-bold text-white mb-4">{texts.features.title}</h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">{texts.features.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {texts.features.items.map((feature, i) => (
                            <div
                                key={i}
                                className="p-8 rounded-2xl border border-red-500/20 backdrop-blur-xl transition-all hover:-translate-y-2 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/10 cursor-default"
                                style={{ background: 'rgba(37, 22, 22, 0.8)' }}
                            >
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Showcase */}
            <section id="showcase" className="py-24 px-6 relative" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[800px] h-[800px] bg-red-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center relative z-10">
                    <div>
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-red-500 bg-red-500/15 mb-4">{texts.showcase.badge}</span>
                        <h2 className="text-4xl font-bold text-white mb-6">{texts.showcase.title}</h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed">{texts.showcase.subtitle}</p>

                        <div className="flex flex-col gap-4">
                            {texts.showcase.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors">
                                    <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <item.icon className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span className="text-gray-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Screenshot Carousel */}
                    <div className="relative">
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-red-500/20">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {screenshots.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img.src}
                                        alt={img.alt}
                                        className="w-full flex-shrink-0 object-cover"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/900x600/251616/ef4444?text=Screenshot'; }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-4">
                            {screenshots.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`h-2.5 rounded-full transition-all ${currentSlide === i
                                        ? 'w-8 shadow-lg shadow-red-500/50'
                                        : 'w-2.5 bg-gray-600 hover:bg-red-500/50'
                                        }`}
                                    style={currentSlide === i ? { background: 'linear-gradient(135deg, #ef4444, #f97316)' } : {}}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-red-500 bg-red-500/15 mb-4">{texts.testimonials.badge}</span>
                        <h2 className="text-4xl font-bold text-white mb-4">{texts.testimonials.title}</h2>
                        <p className="text-lg text-gray-400">{texts.testimonials.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {texts.testimonials.items.map((item, i) => (
                            <div
                                key={i}
                                className="p-8 rounded-2xl border border-red-500/20 backdrop-blur-xl"
                                style={{ background: 'rgba(37, 22, 22, 0.8)' }}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <StarIcon key={j} className="w-4 h-4 text-yellow-400" style={{ fill: '#facc15' }} />
                                    ))}
                                </div>
                                <p className="text-gray-400 italic mb-6 leading-relaxed">{item.text}</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                                        {item.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{item.name}</h4>
                                        <p className="text-sm text-gray-500">{item.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Download */}
            <section id="download" className="py-24 px-6" style={{ background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-red-500 bg-red-500/15 mb-4">{texts.download.badge}</span>
                    <h2 className="text-4xl font-bold text-white mb-4">{texts.download.title}</h2>
                    <p className="text-lg text-gray-400 mb-10">{texts.download.subtitle}</p>

                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        {[
                            { icon: MonitorIcon, name: 'Windows', url: 'https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad.Setup.1.0.0.exe' },
                            { icon: LaptopIcon, name: 'macOS', url: 'https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.dmg' },
                            { icon: TerminalIcon, name: 'Linux', url: 'https://github.com/kibrit74/neural-pad/releases/download/v1.0.0/Neural.Pad-1.0.0.AppImage' },
                        ].map((item) => (
                            <a
                                key={item.name}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-7 py-4 rounded-xl border border-red-500/20 backdrop-blur-xl hover:bg-red-500/15 hover:border-red-500 transition-all hover:-translate-y-1"
                                style={{ background: 'rgba(37, 22, 22, 0.8)' }}
                            >
                                <item.icon className="w-6 h-6 text-red-500" />
                                <div className="text-left">
                                    <div className="text-xs text-gray-500">{texts.download.downloadLabel}</div>
                                    <div className="font-semibold text-white">{item.name}</div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {texts.download.trustBadges.map((text) => (
                            <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                                <CheckIcon className="w-4 h-4 text-green-500" />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-red-500 bg-red-500/15 mb-4">{texts.faq.badge}</span>
                        <h2 className="text-4xl font-bold text-white">{texts.faq.title}</h2>
                    </div>

                    <div className="space-y-0 border-t border-red-500/20">
                        {texts.faq.items.map((faq, i) => (
                            <div key={i} className="border-b border-red-500/20">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full py-6 flex items-center justify-between text-left font-semibold text-white hover:text-red-500 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <span className="text-red-500 text-xl transition-transform" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                                </button>
                                {openFaq === i && (
                                    <p className="pb-6 text-gray-400 leading-relaxed">{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-10 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                                    <FlameIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-red-500">Neural Pad</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{texts.footer.description}</p>
                        </div>

                        {texts.footer.columns.map((col, i) => (
                            <div key={i}>
                                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                                <ul className="space-y-2">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-red-500/20">
                        <p className="text-gray-500 text-sm">{texts.footer.copyright}</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            {[
                                { icon: GithubIcon, href: 'https://github.com/kibrit74/neural-pad' },
                                { icon: TwitterIcon, href: '#' },
                                { icon: MessageCircleIcon, href: '#' },
                                { icon: YoutubeIcon, href: '#' },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Float animation keyframes */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
