import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslations } from '../hooks/useTranslations';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteTitle: string;
    eventTitle: string; // Note title for calendar event title
    eventDetails: string; // Selected text for calendar event description
    currentReminder: Date | null | undefined;
    onSave: (reminder: Date | null) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
    isOpen, onClose, noteTitle, eventTitle, eventDetails, currentReminder, onSave, addNotification
}) => {
    const { t } = useTranslations();

    const formatDateForInput = (date: Date | null | undefined): string => {
        if (!date) return '';
        const d = new Date(date);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    };

    const [selectedDate, setSelectedDate] = useState(formatDateForInput(currentReminder));

    const quickOptions = [
        {
            id: '1h',
            label: '1 saat sonra',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            hours: 1
        },
        {
            id: '3h',
            label: '3 saat sonra',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            hours: 3
        },
        {
            id: 'tomorrow',
            label: 'Yarın sabah',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
            hours: 24
        },
        {
            id: 'week',
            label: '1 hafta sonra',
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            hours: 168
        },
    ];

    const handleQuickOption = (hours: number) => {
        const date = new Date();
        date.setHours(date.getHours() + hours);
        if (hours === 24) {
            date.setHours(9, 0, 0, 0);
        }
        setSelectedDate(formatDateForInput(date));
    };

    const handleSave = () => {
        if (selectedDate) {
            const reminder = new Date(selectedDate);
            console.log('[ReminderModal] Saving reminder:', {
                selectedDate,
                reminderDate: reminder,
                now: new Date(),
                isPast: reminder <= new Date()
            });

            if (reminder <= new Date()) {
                addNotification('Geçmiş bir tarih seçemezsiniz', 'error');
                return;
            }
            onSave(reminder);
            addNotification('Hatırlatıcı ayarlandı!', 'success');
        }
        onClose();
    };

    const handleRemove = () => {
        onSave(null);
        addNotification('Hatırlatıcı kaldırıldı', 'success');
        onClose();
    };

    const handleAddToCalendar = (type: 'google' | 'outlook') => {
        if (!selectedDate) {
            addNotification('Önce bir tarih seçin', 'warning');
            return;
        }

        const date = new Date(selectedDate);
        const endDate = new Date(date.getTime() + 30 * 60000);

        const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const formatOutlookDate = (d: Date) => d.toISOString();

        let calendarUrl = '';

        if (type === 'google') {
            calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatGoogleDate(date)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(eventDetails)}`;
        } else {
            calendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&startdt=${formatOutlookDate(date)}&enddt=${formatOutlookDate(endDate)}&body=${encodeURIComponent(eventDetails)}`;
        }

        window.open(calendarUrl, '_blank');
        addNotification('Takvim açıldı', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🔔 Hatırlatıcı Ayarla">
            <div className="space-y-6 p-2">
                {/* Hero Icon */}
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                        <div className="relative p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Options */}
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-3">HIZLI SEÇENEKLER</label>
                    <div className="grid grid-cols-2 gap-3">
                        {quickOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleQuickOption(opt.hours)}
                                className="group relative bg-gradient-to-br from-background-secondary to-background-secondary/50 hover:from-primary/5 hover:to-accent/5 text-text-primary py-4 px-4 rounded-2xl text-sm font-medium transition-all duration-300 border border-border hover:border-primary/30 shadow-sm hover:shadow-md overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                <div className="relative flex flex-col items-center gap-2">
                                    <span className="text-2xl">{opt.icon}</span>
                                    <span className="text-xs font-semibold">{opt.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Picker */}
                <div className="bg-gradient-to-br from-background-secondary/50 to-background-secondary p-4 rounded-2xl border border-border shadow-inner">
                    <label className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        ÖZEL TARİH/SAAT
                    </label>
                    <input
                        type="datetime-local"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full p-3.5 bg-background border-2 border-border rounded-xl text-text-primary focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all text-base font-medium"
                    />
                </div>

                {/* Calendar Integration */}
                <div>
                    <label className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        TAKVİME EKLE
                    </label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleAddToCalendar('google')}
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                            Google
                        </button>
                        <button
                            onClick={() => handleAddToCalendar('outlook')}
                            className="flex-1 bg-[#0078D4] hover:bg-[#006cbd] text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M1 18l9 3V3L1 6v12zm22-9.1c0-.5-.4-.9-.9-.9H11v8h11.1c.5 0 .9-.4.9-.9V8.9zM11 20l12-2v-4H11v6zM23 4.9c0-.5-.4-.9-.9-.9H11v4h12V4.9z" /></svg>
                            Outlook
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    {currentReminder && (
                        <button
                            onClick={handleRemove}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-3.5 px-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
                        >
                            🗑️ Kaldır
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!selectedDate}
                        className="flex-[2] bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white py-3.5 px-6 rounded-xl font-bold text-base transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shadow-lg disabled:shadow-none"
                    >
                        ✅ Kaydet
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReminderModal;
