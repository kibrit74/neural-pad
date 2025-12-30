import React, { useState } from 'react';
import { authService } from '../services/authService';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

type AuthMode = 'login' | 'register' | 'reset';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, addNotification }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === 'register') {
                const result = await authService.signUp(email, password, fullName);
                if (result.success) {
                    addNotification('Kayıt başarılı! Email adresinizi kontrol edin.', 'success');
                    setMode('login');
                } else {
                    addNotification(result.error || 'Kayıt başarısız', 'error');
                }
            } else if (mode === 'login') {
                const result = await authService.signIn(email, password);
                if (result.success) {
                    addNotification('Giriş başarılı!', 'success');
                    onSuccess();
                    onClose();
                } else {
                    addNotification(result.error || 'Giriş başarısız', 'error');
                }
            } else if (mode === 'reset') {
                const result = await authService.resetPassword(email);
                if (result.success) {
                    addNotification('Şifre sıfırlama linki email adresinize gönderildi.', 'success');
                    setMode('login');
                } else {
                    addNotification(result.error || 'İşlem başarısız', 'error');
                }
            }
        } catch (error) {
            addNotification('Bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
    };

    const switchMode = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 z-[150] animate-fadeIn"
            style={{
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md transform transition-all duration-300 animate-scaleIn"
                style={{
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                boxShadow: '0 10px 30px -5px rgba(239, 68, 68, 0.4)',
                            }}
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mode === 'login' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                ) : mode === 'register' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                )}
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Şifre Sıfırla'}
                        </h2>
                        <p className="text-gray-400">
                            {mode === 'login' ? 'Hesabınıza giriş yapın' : mode === 'register' ? 'Yeni hesap oluşturun' : 'Şifrenizi sıfırlayın'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                                    placeholder="Ad Soyad"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>

                        {mode !== 'reset' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-semibold text-white shadow-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            style={{
                                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                boxShadow: '0 10px 30px -5px rgba(239, 68, 68, 0.4)',
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Yükleniyor...
                                </span>
                            ) : (
                                mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Şifre Sıfırla'
                            )}
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="mt-6 text-center space-y-3">
                        {mode === 'login' && (
                            <>
                                <button
                                    onClick={() => switchMode('reset')}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Şifremi unuttum
                                </button>
                                <div className="text-sm text-gray-400">
                                    Hesabınız yok mu?{' '}
                                    <button
                                        onClick={() => switchMode('register')}
                                        className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                                    >
                                        Kayıt ol
                                    </button>
                                </div>
                            </>
                        )}

                        {mode === 'register' && (
                            <div className="text-sm text-gray-400">
                                Zaten hesabınız var mı?{' '}
                                <button
                                    onClick={() => switchMode('login')}
                                    className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                                >
                                    Giriş yap
                                </button>
                            </div>
                        )}

                        {mode === 'reset' && (
                            <div className="text-sm">
                                <button
                                    onClick={() => switchMode('login')}
                                    className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Giriş sayfasına dön
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}} />
        </div>
    );
};

export default AuthModal;
