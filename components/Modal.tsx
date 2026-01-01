import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons/Icons';
import { useTranslations } from '../hooks/useTranslations';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl';
    zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg', zIndex = 50 }) => {
    const { t } = useTranslations();
    const [isRendered, setIsRendered] = useState(isOpen);
    const modalContentRef = useRef<HTMLDivElement>(null);

    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    }[size];

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => setIsRendered(false), 200); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            modalContentRef.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isRendered) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center p-4 ${isOpen ? 'modal-enter' : 'modal-exit'}`}
            style={{ zIndex }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="absolute inset-0 bg-backdrop backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={modalContentRef}
                tabIndex={-1}
                className={`
                    relative bg-background-secondary text-text-primary shadow-2xl 
                    flex flex-col focus:outline-none 
                    max-h-screen md:max-h-[90vh]
                    w-full md:${sizeClasses}
                    rounded-none md:rounded-lg
                    ${isOpen ? 'modal-content-enter' : 'modal-content-exit'}
                `}
            >
                <div className="flex items-center justify-between p-4 border-b border-border-strong flex-shrink-0">
                    <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-border text-text-secondary hover:text-text-primary"
                        aria-label={t('common.close')}
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-2 p-4 border-t border-border-strong flex-shrink-0 bg-background">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;