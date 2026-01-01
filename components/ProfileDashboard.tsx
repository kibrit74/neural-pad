import React, { useEffect, useState, useContext } from 'react';
import { authService, type AuthUser } from '../services/authService';
import { statsService, type UserStats, type UserSubscription } from '../services/statsService';
import { useTranslations } from '../hooks/useTranslations';
import { Settings, ApiProvider } from '../types';
import { ThemeContext, Theme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import CustomPatternsSection from './CustomPatternsSection';

interface ProfileDashboardProps {
    onClose: () => void;
    user: AuthUser;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    onLogout?: () => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onClose, user, settings, onSettingsChange, onLogout }) => {
    const { t } = useTranslations();

    const [stats, setStats] = useState<UserStats | null>(null);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'account'>('overview');

    // Settings State
    const themeCtx = useContext(ThemeContext);
    const { language, setLanguage } = useLanguage();
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            const [statsData, subData] = await Promise.all([
                statsService.getUserStats(user.id),
                statsService.getSubscriptionInfo(user.id),
            ]);
            setStats(statsData);
            setSubscription(subData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            onLogout?.();
            onClose();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Settings Handlers
    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const target = e.target as HTMLInputElement;
        const isNumber = type === 'range' || type === 'number';
        const newValue = isNumber ? parseFloat(value) : type === 'checkbox' ? target.checked : value;

        const newSettings = {
            ...localSettings,
            [name]: newValue
        };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings); // Auto-save
    };

    const handleProviderChange = (provider: ApiProvider) => {
        const newSettings = {
            ...localSettings,
            apiProvider: provider
        };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const setThemeSafe = (th: string) => {
        if (themeCtx?.setTheme) {
            themeCtx.setTheme(th as Theme);
        } else {
            document.documentElement.setAttribute('data-theme', th);
            localStorage.setItem('theme', th);
        }
    };

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'pro': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
            case 'enterprise': return 'bg-gradient-to-r from-purple-500 to-pink-500';
            default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    // Lists
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

    return (
        <>
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
            <div className="fixed inset-0 bg-background-secondary z-[100] overflow-y-auto animate-in fade-in duration-200">
                <div className="max-w-7xl mx-auto min-h-screen flex flex-col px-4 md:px-0">
                    {/* Header */}
                    <div className="relative p-4 md:p-8 pb-16 md:pb-24 text-white shadow-lg" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))' }}>
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm group"
                            title="Kapat"
                        >
                            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-4">
                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
                                <svg className="w-10 h-10 md:w-16 md:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{user.fullName || 'Kullanıcı'}</h1>
                                <p className="text-white/80 mt-2 text-lg font-light flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user.email}
                                </p>
                                {subscription && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm uppercase tracking-wider ${getPlanBadgeColor(subscription.planType)}`}>
                                            {subscription.planType}
                                        </span>
                                        <span className="text-sm bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                            {t('profile.memberSince', { date: formatDate(user.createdAt ? new Date(user.createdAt) : new Date()) })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 px-4 md:px-8 pb-12 flex flex-col md:flex-row items-start gap-4 md:gap-8" style={{ paddingTop: '2rem' }}>
                        {/* Sidebar / Tabs */}
                        <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible self-start">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`w-full p-3 md:p-4 rounded-xl flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all duration-200 border whitespace-nowrap ${activeTab === 'overview'
                                    ? 'bg-background border-transparent shadow-lg md:transform md:scale-105'
                                    : 'bg-background/80 border-transparent hover:bg-background text-text-secondary hover:text-text-primary'
                                    } backdrop-blur-sm`}
                                style={activeTab === 'overview' ? { color: 'var(--color-primary)' } : {}}
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="font-semibold text-sm md:text-base">{t('profile.overview')}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full p-3 md:p-4 rounded-xl flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all duration-200 border whitespace-nowrap ${activeTab === 'settings'
                                    ? 'bg-background border-transparent shadow-lg md:transform md:scale-105'
                                    : 'bg-background/80 border-transparent hover:bg-background text-text-secondary hover:text-text-primary'
                                    } backdrop-blur-sm`}
                                style={activeTab === 'settings' ? { color: 'var(--color-primary)' } : {}}
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-semibold text-sm md:text-base">{t('profile.settings')}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`w-full p-3 md:p-4 rounded-xl flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all duration-200 border whitespace-nowrap ${activeTab === 'account'
                                    ? 'bg-background border-transparent shadow-lg md:transform md:scale-105'
                                    : 'bg-background/80 border-transparent hover:bg-background text-text-secondary hover:text-text-primary'
                                    } backdrop-blur-sm`}
                                style={activeTab === 'account' ? { color: 'var(--color-primary)' } : {}}
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-semibold text-sm md:text-base">{t('profile.account')}</span>
                            </button>
                        </div>

                        {/* Content Panel */}
                        <div className="flex-1 bg-background rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 min-h-[500px] border border-border">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral-red border-t-transparent"></div>
                                </div>
                            ) : activeTab === 'overview' ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {/* Profile Card */}
                                    <div className="bg-gradient-to-br from-background-secondary to-background p-8 rounded-3xl border border-border shadow-lg">
                                        <div className="flex items-start gap-6">
                                            {/* Avatar */}
                                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold bg-background border-2 border-border shadow-inner" style={{ color: 'var(--color-primary)' }}>
                                                {user.email?.charAt(0).toUpperCase() || '?'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <h2 className="text-3xl font-bold text-text-primary mb-2">
                                                    {user.email?.split('@')[0] || 'User'}
                                                </h2>
                                                <p className="text-text-secondary flex items-center gap-2 mb-3">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {user.email}
                                                </p>
                                                <div className="flex gap-4">
                                                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {t('profile.memberSince', { date: new Date().toLocaleDateString() })}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-lg text-sm font-semibold border" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                                                        {subscription?.planType ? subscription.planType.toUpperCase() : 'FREE'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Summary */}
                                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        {t('profile.activitySummary')}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Toplam Not Card */}
                                        <div className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background p-6 rounded-2xl border border-border hover:border-border-strong transition-all hover:shadow-xl group">
                                            <div className="flex justify-between items-start relative z-10">
                                                <div>
                                                    <p className="text-text-secondary font-medium text-sm uppercase tracking-wide">{t('profile.totalNotes')}</p>
                                                    <h3 className="text-5xl font-bold mt-3" style={{ color: 'var(--color-primary)' }}>{stats?.totalNotes || 0}</h3>
                                                </div>
                                                <div className="p-3 rounded-xl bg-background-secondary">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ stroke: 'var(--color-primary)' }} strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* Decorative gradient blob */}
                                            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                                        </div>

                                        {/* Bugün Eklenen Card */}
                                        <div className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background p-6 rounded-2xl border border-border hover:border-border-strong transition-all hover:shadow-xl group">
                                            <div className="flex justify-between items-start relative z-10">
                                                <div>
                                                    <p className="text-text-secondary font-medium text-sm uppercase tracking-wide">{t('profile.todayNotes')}</p>
                                                    <h3 className="text-5xl font-bold mt-3" style={{ color: 'var(--color-primary)' }}>{stats?.todayNotes || 0}</h3>
                                                </div>
                                                <div className="p-3 rounded-xl bg-background-secondary">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ stroke: 'var(--color-primary)' }} strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                                        </div>

                                        {/* Etiketler Card */}
                                        <div className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background p-6 rounded-2xl border border-border hover:border-border-strong transition-all hover:shadow-xl group">
                                            <div className="flex justify-between items-start relative z-10">
                                                <div>
                                                    <p className="text-text-secondary font-medium text-sm uppercase tracking-wide">{t('profile.tags')}</p>
                                                    <h3 className="text-5xl font-bold mt-3" style={{ color: 'var(--color-primary)' }}>{stats?.totalTags || 0}</h3>
                                                </div>
                                                <div className="p-3 rounded-xl bg-background-secondary">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ stroke: 'var(--color-primary)' }} strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                                        </div>
                                    </div>

                                    {/* Plan & Credits Card */}
                                    <div className="bg-gradient-to-br from-background-secondary to-background p-8 rounded-3xl border border-border shadow-lg">
                                        <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            {t('profile.planTitle')}
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Plan Details */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                                                        {t('profile.planName', { plan: subscription?.planType?.toUpperCase() || 'FREE' })}
                                                    </span>
                                                    {(!subscription || subscription.planType === 'free') && (
                                                        <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-background hover:bg-background-secondary border border-border transition-colors" style={{ color: 'var(--color-primary)' }}>
                                                            {t('profile.upgradeButton')}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-sm text-text-secondary font-medium">{t('profile.planFeatures')}</p>
                                                    <ul className="space-y-1.5">
                                                        <li className="flex items-center gap-2 text-sm text-text-secondary">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {t('profile.unlimitedNotes')}
                                                        </li>
                                                        <li className="flex items-center gap-2 text-sm text-text-secondary">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {subscription?.planType === 'pro' ? t('profile.proAI') : t('profile.basicAI')}
                                                        </li>
                                                        {subscription?.planType === 'pro' && (
                                                            <li className="flex items-center gap-2 text-sm text-text-secondary">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                {t('profile.prioritySupport')}
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* API Credits */}
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-text-primary">{t('profile.apiCredits')}</h4>
                                                {subscription ? (
                                                    <>
                                                        <div className="flex justify-between text-sm font-medium">
                                                            <span className="text-text-secondary">{t('profile.creditsRemaining', {
                                                                remaining: String(subscription.apiCreditsTotal - subscription.apiCreditsUsed),
                                                                total: String(subscription.apiCreditsTotal)
                                                            })}</span>
                                                            <span className="text-text-primary font-bold">{Math.round(((subscription.apiCreditsTotal - subscription.apiCreditsUsed) / subscription.apiCreditsTotal) * 100)}%</span>
                                                        </div>
                                                        <div className="h-3 rounded-full overflow-hidden bg-background shadow-inner">
                                                            <div
                                                                className="h-full transition-all duration-500 rounded-full"
                                                                style={{
                                                                    width: `${((subscription.apiCreditsTotal - subscription.apiCreditsUsed) / subscription.apiCreditsTotal) * 100}%`,
                                                                    background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-hover))'
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-text-secondary flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            {t('profile.renewsOn', { date: new Date(subscription.renewalDate).toLocaleDateString() })}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-text-secondary">No API credits information available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'settings' ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
                                    <div>
                                        <h2 className="text-2xl font-bold text-text-primary mb-1">{t('profile.preferencesTitle')}</h2>
                                        <p className="text-text-secondary">{t('profile.preferencesSubtitle')}</p>
                                    </div>

                                    {/* AI Platform Selection */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">{t('profile.aiPlatform') || 'AI Platformu'}</h3>
                                        <div className="bg-background-secondary p-4 rounded-xl border border-border">
                                            <div className="flex gap-4 mb-4">
                                                {providers.map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => handleProviderChange(p)}
                                                        className={`flex-1 py-3 px-4 rounded-lg capitalize font-medium transition-all ${localSettings.apiProvider === p
                                                            ? 'shadow-md transform scale-105'
                                                            : 'bg-background hover:bg-border text-text-secondary'
                                                            }`}
                                                        style={localSettings.apiProvider === p ? {
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'var(--color-primary-text)'
                                                        } : {}}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-sm text-text-secondary">
                                                {t('settings.apiProviderNote') || 'AI modeli abonelik planınıza göre otomatik belirlenir.'}
                                            </p>
                                        </div>
                                    </section>

                                    {/* AutoSave */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">{t('settings.autoSave')}</h3>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-background-secondary border border-border">
                                            <p className="text-text-secondary pr-4">{t('settings.autoSaveDescription')}</p>
                                            <label htmlFor="autoSaveToggle" className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id="autoSaveToggle"
                                                    className="sr-only peer"
                                                    name="autoSave"
                                                    checked={!!localSettings.autoSave}
                                                    onChange={handleSettingChange}
                                                />
                                                <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: localSettings.autoSave ? 'var(--color-primary)' : undefined }}></div>
                                            </label>
                                        </div>
                                    </section>

                                    {/* Export/Import */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">{t('settings.export.title')}</h3>
                                        <div className="space-y-3">
                                            <div className="p-4 rounded-xl bg-background-secondary border border-border">
                                                <h4 className="font-semibold text-text-primary mb-2">💾 {t('settings.export.backupTitle')}</h4>
                                                <p className="text-sm text-text-secondary mb-3">{t('settings.export.backupDescription')}</p>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                console.log('[ProfileDashboard] JSON Backup button clicked!');
                                                                try {
                                                                    console.log('[ProfileDashboard] Importing module...');
                                                                    const mod = await import('../utils/exportAll');
                                                                    console.log('[ProfileDashboard] Module loaded:', Object.keys(mod));
                                                                    console.log('[ProfileDashboard] Calling exportBackup...');
                                                                    const result = await mod.exportBackup();
                                                                    console.log('[ProfileDashboard] Result:', result);
                                                                    if (result.success) {
                                                                        alert(`✅ ${t('settings.export.backupSuccess') || 'JSON yedek indirildi!'}`);
                                                                    } else {
                                                                        alert(`❌ ${t('settings.export.backupError') || 'Yedek indirilemedi'}: ${result.error}`);
                                                                    }
                                                                } catch (error) {
                                                                    console.error('[ProfileDashboard] ERROR:', error);
                                                                    alert(`❌ ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                                                }
                                                            }}
                                                            className="flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm"
                                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
                                                            title="Metin + Ayarlar (resimler hariç)"
                                                        >
                                                            📄 JSON
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                console.log('[ProfileDashboard] HTML+Resim button clicked!');
                                                                try {
                                                                    console.log('[ProfileDashboard] Importing module...');
                                                                    const mod = await import('../utils/exportAll');
                                                                    console.log('[ProfileDashboard] Calling exportAll(html)...');
                                                                    await mod.exportAll('html');
                                                                    console.log('[ProfileDashboard] Export completed');
                                                                    alert(`✅ ${t('settings.export.backupSuccess') || 'HTML yedek indirildi!'}`);
                                                                } catch (error) {
                                                                    console.error('[ProfileDashboard] ERROR:', error);
                                                                    alert(`❌ ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                                                }
                                                            }}
                                                            className="flex-1 px-3 py-2 rounded-md font-semibold transition-colors text-sm"
                                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-text)' }}
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
                                                                console.log('[ProfileDashboard] File input triggered!');
                                                                const file = e.target.files?.[0];
                                                                if (!file) {
                                                                    console.log('[ProfileDashboard] No file selected');
                                                                    return;
                                                                }
                                                                console.log('[ProfileDashboard] File selected:', file.name);
                                                                try {
                                                                    const mod = await import('../utils/exportAll');
                                                                    console.log('[ProfileDashboard] Calling importBackup...');
                                                                    const result = await mod.importBackup(file);
                                                                    console.log('[ProfileDashboard] Import result:', result);
                                                                    if (result.success) {
                                                                        alert(`✅ ${t('settings.export.importSuccess', { count: String(result.notesCount) })}`);
                                                                        window.location.reload();
                                                                    } else {
                                                                        alert(`❌ ${t('settings.export.importError')}: ${result.error}`);
                                                                    }
                                                                } catch (error) {
                                                                    console.error('[ProfileDashboard] ERROR:', error);
                                                                    alert(`❌ ${error instanceof Error ? error.message : String(error)}`);
                                                                }
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <span className="w-full px-4 py-2 rounded-md font-semibold bg-background border-2 border-border hover:bg-border text-text-primary transition-colors cursor-pointer block text-center">
                                                            📥 {t('settings.export.restoreBackup')} (JSON)
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-background-secondary border border-border">
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
                                                        className="flex-1 px-3 py-2 rounded-md font-semibold bg-background border border-border hover:bg-border text-text-primary transition-colors"
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
                                                        className="flex-1 px-3 py-2 rounded-md font-semibold bg-background border border-border hover:bg-border text-text-primary transition-colors"
                                                    >{t('common.markdown')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Appearance */}
                                    <section className="space-y-4">
                                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">{t('profile.appearance')}</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {themes.map(theme => {
                                                const themeColors: Record<typeof theme, { primary: string; hover: string; bg: string }> = {
                                                    coral: { primary: '#ef4444', hover: '#dc2626', bg: '#1a0a0a' },
                                                    emerald: { primary: '#10b981', hover: '#059669', bg: '#0a1a14' },
                                                    gold: { primary: '#f59e0b', hover: '#d97706', bg: '#1a140a' },
                                                    teal: { primary: '#14b8a6', hover: '#0d9488', bg: '#0a1717' },
                                                    azure: { primary: '#3b82f6', hover: '#2563eb', bg: '#0a0f1a' },
                                                    midnight: { primary: '#71717a', hover: '#52525b', bg: '#09090b' },
                                                };
                                                const isSelected = (themeCtx?.theme || 'midnight') === theme;
                                                return (
                                                    <button
                                                        key={theme}
                                                        onClick={() => setThemeSafe(theme)}
                                                        className={`p-4 rounded-xl border-2 transition-all text-left capitalize ${isSelected
                                                            ? 'shadow-sm'
                                                            : 'border-border bg-background hover:border-border-strong'
                                                            }`}
                                                        style={isSelected ? {
                                                            borderColor: themeColors[theme].primary,
                                                            backgroundColor: `${themeColors[theme].primary}15`
                                                        } : {}}
                                                    >
                                                        <div className="w-full h-8 rounded-lg mb-2 border border-border shadow-sm overflow-hidden relative" style={{ backgroundColor: themeColors[theme].bg }}>
                                                            <div
                                                                className="absolute top-0 left-0 w-full h-2"
                                                                style={{
                                                                    background: `linear-gradient(to right, ${themeColors[theme].primary}, ${themeColors[theme].hover})`
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-medium text-text-primary">{themeNames[theme][language]}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-sm font-medium text-text-primary mb-2">{t('profile.languageOption')}</label>
                                            <div className="flex gap-4">
                                                {['tr', 'en'].map(lang => (
                                                    <button
                                                        key={lang}
                                                        onClick={() => setLanguage(lang as 'tr' | 'en')}
                                                        className={`px-6 py-2 rounded-lg font-medium transition-all ${language === lang
                                                            ? ''
                                                            : 'bg-background-secondary text-text-secondary hover:bg-border'
                                                            }`}
                                                        style={language === lang ? {
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'var(--color-primary-text)'
                                                        } : {}}
                                                    >
                                                        {lang === 'tr' ? 'Türkçe' : 'English'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Custom Patterns */}
                                    <section>
                                        <CustomPatternsSection
                                            patterns={localSettings.customPatterns || []}
                                            onChange={(patterns) => {
                                                const newSettings = { ...localSettings, customPatterns: patterns };
                                                setLocalSettings(newSettings);
                                                onSettingsChange(newSettings);
                                            }}
                                        />
                                    </section>
                                </div>
                            ) : activeTab === 'account' ? (
                                <div className="space-y-8 animate-in fade-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
                                    <h2 className="text-2xl font-bold text-text-primary">{t('profile.accountSettings')}</h2>

                                    {/* Email Change */}
                                    <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-2xl border border-border shadow-lg">
                                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            {t('profile.changeEmail')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    {t('profile.currentEmail')}
                                                </label>
                                                <input
                                                    type="email"
                                                    value={user.email || ''}
                                                    disabled
                                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-secondary cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    {t('profile.newEmail')}
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="new.email@example.com"
                                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary focus:border-coral-red focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <button className="w-full px-4 py-2 rounded-lg font-semibold bg-background hover:bg-background-secondary border border-border transition-colors" style={{ color: 'var(--color-primary)' }}>
                                                {t('profile.updateButton')}
                                            </button>
                                            <p className="text-xs text-text-secondary flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {t('profile.emailSent')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Password Change */}
                                    <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-2xl border border-border shadow-lg">
                                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            {t('profile.changePassword')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    {t('profile.currentPassword')}
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary focus:border-coral-red focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    {t('profile.newPassword')}
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary focus:border-coral-red focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                                    {t('profile.confirmPassword')}
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary focus:border-coral-red focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <p className="text-xs text-text-secondary flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {t('profile.passwordRequirements')}
                                            </p>
                                            <button className="w-full px-4 py-2 rounded-lg font-semibold bg-background hover:bg-background-secondary border border-border transition-colors" style={{ color: 'var(--color-primary)' }}>
                                                {t('profile.updateButton')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Logout Section */}
                                    <div className="bg-gradient-to-br from-background-secondary to-background p-6 rounded-2xl border border-border shadow-lg">
                                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('profile.logout') || 'Çıkış Yap'}
                                        </h3>
                                        <p className="text-sm text-text-secondary mb-4">{t('profile.logoutDescription') || 'Hesabınızdan güvenli bir şekilde çıkış yapın.'}</p>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                            style={{
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'var(--color-primary-text, white)'
                                            }}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            {t('profile.logoutButton') || 'Çıkış Yap'}
                                        </button>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="bg-gradient-to-br from-red-500/10 to-background p-6 rounded-2xl border-2 border-red-500/30 shadow-lg">
                                        <h3 className="text-lg font-semibold text-red-500 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            {t('profile.dangerZone')}
                                        </h3>
                                        <p className="text-sm text-text-secondary mb-4">{t('profile.deleteWarning')}</p>
                                        <button className="w-full px-4 py-3 rounded-lg font-semibold bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/50 text-red-500 transition-colors">
                                            {t('profile.deleteAccount')}
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
};

export default ProfileDashboard;
