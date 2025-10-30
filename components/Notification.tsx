
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/Icons';
import { useTranslations } from '../hooks/useTranslations';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning';
    onDismiss: () => void;
    persistent?: boolean;
    onClick?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss, persistent, onClick }) => {
    const { t } = useTranslations();
    const [visible, setVisible] = useState(true);

    const colorClasses = {
        success: 'bg-success-bg text-success-text',
        error: 'bg-error-bg text-error-text',
        warning: 'bg-warning-bg text-warning-text',
    }[type];

    useEffect(() => {
        if (persistent) return; // Don't auto-dismiss if persistent

        const timer = setTimeout(() => {
            handleDismiss();
        }, 4700);
        return () => clearTimeout(timer);
    }, [persistent]);
    
    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 300);
    };

    const ariaRole = type === 'error' || type === 'warning' ? 'alert' : 'status';
    const ariaLive = type === 'error' || type === 'warning' ? 'assertive' : 'polite';

    return (
        <div className={`
            p-4 rounded-md shadow-lg flex items-center justify-between gap-4
            transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 translate-x-4'}
            ${colorClasses}
            ${onClick ? 'cursor-pointer' : ''}
        `}
        role={ariaRole}
        aria-live={ariaLive}
        aria-atomic="true"
        onClick={onClick}
        >
            <span>{message}</span>
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Prevent the container's onClick
                    handleDismiss();
                }} 
                className="p-1 rounded-full hover:bg-white/20"
                aria-label={t('common.close')}
            >
                <CloseIcon />
            </button>
        </div>
    );
};

export default Notification;
