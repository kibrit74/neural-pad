import React from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';
import { BellIcon, CloseIcon } from './icons/Icons';

interface ReminderAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteTitle: string;
    noteId: number;
    onGoToNote: (noteId: number) => void;
    onDismiss: (noteId: number) => void;
}

const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
    isOpen, onClose, noteTitle, noteId, onGoToNote, onDismiss
}) => {
    const { t } = useTranslations();

    // Play notification sound
    React.useEffect(() => {
        if (isOpen) {
            playNotificationSound();
        }
    }, [isOpen]);

    const playNotificationSound = () => {
        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            // Play two beeps
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 300);
        } catch (e) {
            console.warn('Could not play notification sound:', e);
        }
    };

    const handleGoToNote = () => {
        onGoToNote(noteId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background-secondary rounded-2xl shadow-2xl border border-border-strong p-6 max-w-md w-full mx-4 animate-scale-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-border rounded-full transition-colors"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="text-center">
                    {/* Icon with animation */}
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <BellIcon className="w-10 h-10 text-primary" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-text-primary mb-2">
                        ⏰ Hatırlatıcı!
                    </h2>

                    {/* Note title */}
                    <p className="text-lg text-text-secondary mb-6 px-4">
                        "{noteTitle}"
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                onDismiss(noteId);
                                onClose();
                            }}
                            className="flex-1 py-3 px-4 bg-background border border-border rounded-lg text-text-primary hover:bg-border transition-colors font-medium"
                        >
                            Tamam, Anlaşıldı
                        </button>
                        <button
                            onClick={handleGoToNote}
                            className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-primary-text rounded-lg font-medium transition-colors"
                        >
                            Nota Git
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReminderAlertModal;
