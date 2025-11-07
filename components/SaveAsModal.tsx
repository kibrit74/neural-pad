import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import Modal from './Modal';
import type { Note } from '../types';
import { exportNote, getFormatInfo, type ExportFormat } from '../utils/exportUtils';

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('saveAs.title') || 'Save As...'}>
            <div className="space-y-6">
                {/* Note info */}
                <div className="p-4 bg-background-secondary rounded-lg border border-border">
                    <h3 className="font-semibold text-text-primary mb-1">{note.title || 'Untitled Note'}</h3>
                    <p className="text-sm text-text-secondary">
                        {t('saveAs.selectFormat') || 'Select a format to export your note'}
                    </p>
                </div>

                {/* Format selection */}
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">
                        {t('saveAs.format') || 'Export Format'}
                    </label>
                    <div className="space-y-2">
                        {availableFormats.map((format) => {
                            const formatInfo = getFormatInfo(format);
                            return (
                                <label
                                    key={format}
                                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedFormat === format
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50 hover:bg-background-secondary'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="format"
                                        value={format}
                                        checked={selectedFormat === format}
                                        onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{formatInfo.icon}</span>
                                            <span className="font-semibold text-text-primary">
                                                {formatInfo.name} ({formatInfo.extension})
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">
                                            {formatInfo.description}
                                        </p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-background-secondary transition-colors"
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-primary text-primary-text font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                        disabled={isExporting}
                    >
                        <span>💾</span>
                        {isExporting ? (t('common.loading') || 'Loading...') : (t('saveAs.export') || 'Export')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SaveAsModal;
