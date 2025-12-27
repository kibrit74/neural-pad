import React, { useState, useEffect } from 'react';
import { CustomPattern } from '../utils/dataExtractor';

interface CustomPatternManagerProps {
    isOpen: boolean;
    onClose: () => void;
    patterns: CustomPattern[];
    onPatternsChange: (patterns: CustomPattern[]) => void;
}

const STORAGE_KEY = 'neural-pad-custom-patterns';

const CustomPatternManager: React.FC<CustomPatternManagerProps> = ({
    isOpen,
    onClose,
    patterns,
    onPatternsChange
}) => {
    const [newLabel, setNewLabel] = useState('');
    const [newPattern, setNewPattern] = useState('');
    const [isPlainText, setIsPlainText] = useState(true); // Default to plain text for easier use
    const [testText, setTestText] = useState('');
    const [testResults, setTestResults] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Load patterns from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    onPatternsChange(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load custom patterns:', e);
        }
    }, []);

    // Save patterns to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
        } catch (e) {
            console.error('Failed to save custom patterns:', e);
        }
    }, [patterns]);

    const validatePattern = (pattern: string): boolean => {
        try {
            new RegExp(pattern, 'gi');
            return true;
        } catch {
            return false;
        }
    };

    const handleTestPattern = () => {
        setError('');
        setTestResults([]);

        if (!newPattern) {
            setError('Lütfen bir desen girin');
            return;
        }

        // Skip regex validation for plain text mode
        if (!isPlainText && !validatePattern(newPattern)) {
            setError('Geçersiz regex deseni');
            return;
        }

        if (!testText) {
            setError('Lütfen test metni girin');
            return;
        }

        try {
            // Escape regex special chars for plain text mode
            const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const patternToUse = isPlainText ? escapeRegex(newPattern) : newPattern;
            const regex = new RegExp(patternToUse, 'gi');
            const matches: string[] = [];
            let match;

            while ((match = regex.exec(testText)) !== null) {
                matches.push(match[1] || match[0]);
            }

            setTestResults(matches);
            if (matches.length === 0) {
                setError('Eşleşme bulunamadı');
            }
        } catch (e: any) {
            setError(`Hata: ${e.message}`);
        }
    };

    const handleAddPattern = () => {
        setError('');

        if (!newLabel.trim()) {
            setError('Lütfen bir etiket girin');
            return;
        }

        if (!newPattern.trim()) {
            setError('Lütfen bir desen girin');
            return;
        }

        // Skip regex validation for plain text mode
        if (!isPlainText && !validatePattern(newPattern)) {
            setError('Geçersiz regex deseni');
            return;
        }

        if (editingId) {
            // Update existing pattern
            onPatternsChange(patterns.map(p =>
                p.id === editingId
                    ? { ...p, label: newLabel.trim(), pattern: newPattern.trim(), category: 'custom' as const, isPlainText }
                    : p
            ));
            setEditingId(null);
        } else {
            // Add new pattern
            const newId = `custom_${Date.now()}`;
            onPatternsChange([
                ...patterns,
                {
                    id: newId,
                    label: newLabel.trim(),
                    pattern: newPattern.trim(),
                    category: 'custom',
                    isPlainText
                }
            ]);
        }

        setNewLabel('');
        setNewPattern('');
        setIsPlainText(true);
        setTestText('');
        setTestResults([]);
    };

    const handleEditPattern = (pattern: CustomPattern) => {
        setEditingId(pattern.id);
        setNewLabel(pattern.label);
        setNewPattern(pattern.pattern);
        setIsPlainText(pattern.isPlainText ?? true);
        setError('');
        setTestResults([]);
    };

    const handleDeletePattern = (id: string) => {
        onPatternsChange(patterns.filter(p => p.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setNewLabel('');
            setNewPattern('');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setNewLabel('');
        setNewPattern('');
        setIsPlainText(true);
        setTestText('');
        setTestResults([]);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-bold text-text-primary">Özel Desen Yöneticisi</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-border rounded transition-colors"
                    >
                        <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Add/Edit Form */}
                    <div className="bg-background-secondary rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-sm text-text-primary">
                            {editingId ? 'Deseni Düzenle' : 'Yeni Desen Ekle'}
                        </h3>

                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Etiket</label>
                            <input
                                type="text"
                                value={newLabel}
                                onChange={e => setNewLabel(e.target.value)}
                                placeholder="Örn: Dosya No, Esas No"
                                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-text-primary placeholder:text-text-secondary/50"
                            />
                        </div>

                        {/* Plain Text Toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="plainTextToggle"
                                checked={isPlainText}
                                onChange={e => setIsPlainText(e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <label htmlFor="plainTextToggle" className="text-sm text-text-primary">
                                Düz metin ara <span className="text-text-secondary">(regex yerine)</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs text-text-secondary mb-1">
                                {isPlainText ? 'Aranacak Metin' : 'Regex Deseni'}
                                {!isPlainText && <span className="text-text-secondary/50"> (parantez içi yakalanır)</span>}
                            </label>
                            <input
                                type="text"
                                value={newPattern}
                                onChange={e => setNewPattern(e.target.value)}
                                placeholder={isPlainText ? "Örn: 2024/123, Esas No" : "Örn: Esas\\s*No[:\\s]*(\\d{4}/\\d+)"}
                                className="w-full px-3 py-2 bg-background border border-border rounded text-sm font-mono text-text-primary placeholder:text-text-secondary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Test Metni</label>
                            <textarea
                                value={testText}
                                onChange={e => setTestText(e.target.value)}
                                placeholder="Deseni test etmek için metin girin..."
                                rows={2}
                                className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-text-primary placeholder:text-text-secondary/50 resize-none"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-red-500">{error}</p>
                        )}

                        {testResults.length > 0 && (
                            <div className="bg-green-500/10 rounded p-2">
                                <p className="text-xs text-green-600 font-semibold mb-1">
                                    {testResults.length} eşleşme bulundu:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {testResults.map((result, idx) => (
                                        <code key={idx} className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded">
                                            {result}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleTestPattern}
                                className="flex-1 px-3 py-2 bg-border hover:bg-border/80 text-text-primary rounded text-sm transition-colors"
                            >
                                Test Et
                            </button>
                            <button
                                onClick={handleAddPattern}
                                className="flex-1 px-3 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded text-sm transition-colors"
                            >
                                {editingId ? 'Güncelle' : 'Ekle'}
                            </button>
                            {editingId && (
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-sm transition-colors"
                                >
                                    İptal
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Existing Patterns */}
                    <div>
                        <h3 className="font-semibold text-sm text-text-primary mb-2">
                            Kayıtlı Desenler ({patterns.length})
                        </h3>

                        {patterns.length === 0 ? (
                            <p className="text-xs text-text-secondary text-center py-4">
                                Henüz özel desen eklenmedi
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {patterns.map(pattern => (
                                    <div
                                        key={pattern.id}
                                        className={`bg-background-secondary rounded-lg p-3 ${editingId === pattern.id ? 'ring-2 ring-primary' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-text-primary truncate">
                                                    🎯 {pattern.label}
                                                </p>
                                                <code className="text-xs text-text-secondary font-mono block truncate">
                                                    {pattern.pattern}
                                                </code>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEditPattern(pattern)}
                                                    className="p-1 hover:bg-border rounded transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePattern(pattern.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                                    title="Sil"
                                                >
                                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Help Section */}
                    <div className="bg-blue-500/10 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-blue-600 mb-1">💡 İpuçları</h4>
                        <ul className="text-xs text-blue-600/80 space-y-1">
                            <li>• <code className="bg-blue-500/20 px-1 rounded">(\d+)</code> - Sayıları yakalar</li>
                            <li>• <code className="bg-blue-500/20 px-1 rounded">([A-Za-z]+)</code> - Harfleri yakalar</li>
                            <li>• <code className="bg-blue-500/20 px-1 rounded">Dosya No[:\s]*(.+)</code> - "Dosya No:" sonrasını yakalar</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded font-medium text-sm transition-colors"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomPatternManager;
