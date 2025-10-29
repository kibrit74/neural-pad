import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { CloseIcon, AddIcon, RemoveIcon, DownloadIcon, CopyIcon } from './icons/Icons';
import { generateMakeBlueprint, downloadBlueprint, copyBlueprintToClipboard } from '../services/makeBlueprintService';

interface MakeBlueprintModalProps {
    isOpen: boolean;
    selectedText: string;
    onClose: () => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

interface CustomField {
    key: string;
    value: string;
}

const MakeBlueprintModal: React.FC<MakeBlueprintModalProps> = ({ 
    isOpen, 
    selectedText, 
    onClose,
    addNotification 
}) => {
    const { t } = useTranslations();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [customFields, setCustomFields] = useState<CustomField[]>([
        { key: 'email', value: '' },
        { key: 'name', value: '' }
    ]);

    if (!isOpen) return null;

    const addField = () => {
        setCustomFields([...customFields, { key: '', value: '' }]);
    };

    const removeField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, key: string, value: string) => {
        const newFields = [...customFields];
        newFields[index] = { key, value };
        setCustomFields(newFields);
    };

    const handleDownload = () => {
        const userFields = customFields.reduce((acc, field) => {
            if (field.key) acc[field.key] = field.value;
            return acc;
        }, {} as Record<string, string>);

        const blueprint = generateMakeBlueprint({
            selectedText,
            userFields,
            webhookUrl: webhookUrl || undefined
        });

        downloadBlueprint(blueprint);
        addNotification('Blueprint downloaded successfully!', 'success');
        onClose();
    };

    const handleCopy = async () => {
        const userFields = customFields.reduce((acc, field) => {
            if (field.key) acc[field.key] = field.value;
            return acc;
        }, {} as Record<string, string>);

        const blueprint = generateMakeBlueprint({
            selectedText,
            userFields,
            webhookUrl: webhookUrl || undefined
        });

        try {
            await copyBlueprintToClipboard(blueprint);
            addNotification('Blueprint copied to clipboard!', 'success');
            onClose();
        } catch (error) {
            addNotification('Failed to copy blueprint', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-backdrop z-50 flex items-center justify-center p-4 animate-modal-enter">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-modal-content-enter">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-strong">
                    <h2 className="text-xl font-bold text-text-primary">Generate Make.com Blueprint</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-border rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Selected Text Preview */}
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Selected Text (Preview)
                        </label>
                        <div className="p-3 bg-background-secondary border border-border rounded-lg text-sm text-text-secondary max-h-32 overflow-y-auto">
                            {selectedText.substring(0, 200)}{selectedText.length > 200 ? '...' : ''}
                        </div>
                    </div>

                    {/* Webhook URL (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Webhook URL (Optional)
                        </label>
                        <input
                            type="text"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://hook.us1.make.com/..."
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                        />
                        <p className="mt-1 text-xs text-text-secondary">
                            Leave empty to configure later in Make.com
                        </p>
                    </div>

                    {/* Custom Fields */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-text-primary">
                                Custom Fields
                            </label>
                            <button
                                onClick={addField}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-text rounded hover:bg-primary-hover transition-colors"
                            >
                                <AddIcon width="14" height="14" />
                                Add Field
                            </button>
                        </div>

                        <div className="space-y-2">
                            {customFields.map((field, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={field.key}
                                        onChange={(e) => updateField(index, e.target.value, field.value)}
                                        placeholder="Field name (e.g., email)"
                                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.value}
                                        onChange={(e) => updateField(index, field.key, e.target.value)}
                                        placeholder="Example value"
                                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary text-sm"
                                    />
                                    <button
                                        onClick={() => removeField(index)}
                                        className="p-2 hover:bg-border rounded transition-colors"
                                        aria-label="Remove field"
                                    >
                                        <RemoveIcon width="16" height="16" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-text-secondary">
                            These fields will be available as variables in your Make.com scenario
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <h3 className="text-sm font-semibold text-primary mb-2">How to use:</h3>
                        <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
                            <li>Download or copy the blueprint JSON</li>
                            <li>Go to Make.com → Create new scenario</li>
                            <li>Click "..." menu → Import Blueprint</li>
                            <li>Paste or upload the JSON file</li>
                            <li>Configure your webhook and connections</li>
                        </ol>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border-strong">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-text-secondary hover:bg-border rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-background-secondary text-text-primary border border-border hover:bg-border rounded-lg transition-colors"
                    >
                        <CopyIcon width="16" height="16" />
                        Copy JSON
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-text rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        <DownloadIcon width="16" height="16" />
                        Download Blueprint
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MakeBlueprintModal;
