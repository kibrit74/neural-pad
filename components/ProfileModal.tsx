import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { authService, type AuthUser } from '../services/authService';

interface ProfileModalProps {
    isOpen?: boolean; // Make optional for compatibility with new usage pattern
    onClose: () => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
    user: AuthUser; // Add user prop
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, addNotification, user }) => {
    // const [user, setUser] = useState<AuthUser | null>(null); // Remove internal user state
    const [fullName, setFullName] = useState(user.fullName || ''); // Initialize from prop
    const [isLoading, setIsLoading] = useState(false);

    // Update fullName if user prop changes
    useEffect(() => {
        setFullName(user.fullName || '');
    }, [user]);

    // Remove old useEffect for fetching user


    const handleSave = async () => {
        setIsLoading(true);
        const result = await authService.updateProfile({ fullName });

        if (result.success) {
            addNotification('Profil güncellendi', 'success');
            onClose();
        } else {
            addNotification(result.error || 'Güncelleme başarısız', 'error');
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await authService.signOut();
        addNotification('Çıkış yapıldı', 'success');
        onClose();
    };


    return (
        <Modal isOpen={isOpen ?? true} onClose={onClose} title="Profil">
            <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                        {user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{user.fullName || 'Kullanıcı'}</h3>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Ad Soyad
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-background-secondary border border-border text-text-primary focus:outline-none focus:border-primary"
                            placeholder="Ad Soyad"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 rounded-lg bg-background-tertiary border border-border text-text-secondary cursor-not-allowed"
                        />
                        <p className="text-xs text-text-secondary mt-1">Email değiştirilemez</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-text font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-500 font-medium hover:bg-red-500/30 transition-colors"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;
