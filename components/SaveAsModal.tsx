import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import Modal from './Modal';
import type { Note } from '../types';
import { exportNote, getFormatInfo, type ExportFormat } from '../utils/exportUtils';

// Modern SVG Icon Component for file formats
const FormatIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-6 h-6" }) => {
    const iconProps = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5
    };

    switch (type) {
        case 'txt':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            );
        case 'html':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
            );
        case 'md':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15l1.5-1.5L9 12m3 3v-3m3 3l-1.5-1.5L15 12" />
                </svg>
            );
        case 'pdf':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            );
        case 'json':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
            );
        case 'docx':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5h6m-6 3h6" />
                </svg>
            );
        case 'export':
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
            );
        default:
            return (
                <svg {...iconProps}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            );
    }
};

interface SaveAsModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note | null;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const SaveAsModal: React.FC<SaveAsModalProps> = ({ isOpen, onClose, note, addNotification }) => {
    const { t } = useTranslations();
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('txt');
    const [isExporting, setIsExporting] = useState(false);

    if (!note) return null;

    const availableFormats: ExportFormat[] = ['txt', 'html', 'md', 'pdf', 'json'];

    const handleSave = async () => {
        try {
            setIsExporting(true);
            await exportNote(note, selectedFormat);
            const formatInfo = getFormatInfo(selectedFormat);
            addNotification(
                t('notifications.exportSuccess', { format: formatInfo.name }) ||
                `Exported as ${formatInfo.name}`,
                'success'
            );
            onClose();
        } catch (error: any) {
            console.error('Export error:', error);
            addNotification(
                t('notifications.exportError', { message: error.message }) ||
                `Export failed: ${error.message}`,
                'error'
            );
        } finally {
            setIsExporting(false);
        }
    };

    const safeTitle = (note.title || 'Untitled').replace(/[^a-z0-9-_]+/gi, '_');
    const selectedFormatInfo = getFormatInfo(selectedFormat);
    const previewFilename = `${safeTitle}.${selectedFormatInfo.extension}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('saveAs.title') || 'Export Note'}>
            <div className="space-y-6">
                {/* Header with note info */}
                <div className="relative overflow-hidden p-5 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-xl border border-primary/20">
                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="font-semibold text-text-primary truncate">{note.title || 'Untitled Note'}</h3>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    {t('saveAs.selectFormat') || 'Choose your preferred export format'}
                                </p>
                            </div>
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                <FormatIcon type="export" className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>

                {/* Format selection grid */}
                <div>
                    <label className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {t('saveAs.format') || 'Export Format'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {availableFormats.map((format) => {
                            const formatInfo = getFormatInfo(format);
                            const isSelected = selectedFormat === format;
                            return (
                                <button
                                    key={format}
                                    onClick={() => setSelectedFormat(format)}
                                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]'
                                        : 'border-border hover:border-primary/40 hover:bg-background-secondary hover:scale-[1.01]'
                                        }`}
                                >
                                    {/* Selection indicator */}
                                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? 'border-primary bg-primary'
                                        : 'border-border group-hover:border-primary/40'
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Format icon */}
                                    <div className="mb-3">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${isSelected
                                            ? 'bg-primary/20 scale-110 text-primary'
                                            : 'bg-background-secondary text-text-secondary group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105'
                                            }`}>
                                            <FormatIcon type={formatInfo.iconType} className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* Format info */}
                                    <div className="pr-8">
                                        <div className="font-semibold text-text-primary mb-1 flex items-baseline gap-2">
                                            <span>{formatInfo.name}</span>
                                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isSelected
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-background-secondary text-text-secondary'
                                                }`}>
                                                {formatInfo.extension}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {formatInfo.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* File preview */}
                <div className="p-4 bg-background-secondary/50 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border text-primary">
                            <FormatIcon type={selectedFormatInfo.iconType} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-secondary mb-1">
                                {t('saveAs.filename') || 'Filename'}
                            </p>
                            <p className="text-sm font-mono text-text-primary truncate">
                                {previewFilename}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                <span className="text-xs font-semibold text-primary uppercase">
                                    {selectedFormatInfo.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        className="px-5 py-2.5 rounded-lg border-2 border-border text-text-primary font-medium hover:bg-background-secondary hover:border-text-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isExporting}
                        className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 overflow-hidden group"
                    >
                        {/* Loading overlay */}
                        {isExporting && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                            </div>
                        )}

                        {/* Button content */}
                        <div className="relative flex items-center gap-2">
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{t('common.loading') || 'Exporting...'}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>{t('saveAs.export') || 'Export'}</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </Modal>
    );
};

export default SaveAsModal;
