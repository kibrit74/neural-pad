import React, { useState } from 'react';
import { TrashIcon } from './icons/Icons';

interface CustomPattern {
    id: string;
    label: string;
    pattern: string;
    category: 'custom';
    isPlainText?: boolean;
}

interface CustomPatternsSectionProps {
    patterns: CustomPattern[];
    onChange: (patterns: CustomPattern[]) => void;
}

const CustomPatternsSection: React.FC<CustomPatternsSectionProps> = ({ patterns, onChange }) => {
    const [newLabel, setNewLabel] = useState('');
    const [newPattern, setNewPattern] = useState('');
    const [testText, setTestText] = useState('');
    const [testResults, setTestResults] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const addPattern = () => {
        if (!newLabel.trim() || !newPattern.trim()) return;

        // Validate regex
        try {
            new RegExp(newPattern);
        } catch (error) {
            alert('Geçersiz regex pattern! Lütfen kontrol edin.');
            return;
        }

        const newPatternObj: CustomPattern = {
            id: Date.now().toString(),
            label: newLabel.trim(),
            pattern: newPattern.trim(),
            category: 'custom',
        };

        onChange([...patterns, newPatternObj]);
        setNewLabel('');
        setNewPattern('');
    };

    const deletePattern = (id: string) => {
        onChange(patterns.filter(p => p.id !== id));
    };

    const updatePattern = (id: string, field: 'label' | 'pattern', value: string) => {
        onChange(patterns.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const testPattern = () => {
        const results: string[] = [];

        patterns.forEach(pattern => {
            try {
                const regex = new RegExp(pattern.pattern, 'gi');
                let match;
                while ((match = regex.exec(testText)) !== null) {
                    results.push(`${pattern.label}: ${match[1] || match[0]}`);
                }
            } catch (error) {
                results.push(`${pattern.label}: HATA - Geçersiz regex`);
            }
        });

        setTestResults(results);
    };

    return (
        <div className="space-y-6">
            {/* Description */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-text-secondary">
                    <strong>Özel Tarama Kalıpları:</strong> Notlarınızdan otomatik olarak çıkarmak istediğiniz özel veri türlerini tanımlayın.
                    Örnek: "Dosya Esas No", "Hasta Adı", "Karar No" gibi.
                </p>
                <p className="text-xs text-text-secondary mt-2">
                    <strong>Pattern Örneği:</strong> "Esas No[:\\s]+([\\d/]+)" → "Esas No: 2024/123" şeklindeki metinlerden "2024/123" değerini çıkarır.
                </p>
            </div>

            {/* Existing Patterns Table */}
            {patterns.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-background-secondary">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Etiket</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-text-primary">Pattern</th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-text-primary">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {patterns.map(pattern => (
                                <tr key={pattern.id} className="hover:bg-background-secondary/50">
                                    <td className="px-4 py-2">
                                        {editingId === pattern.id ? (
                                            <input
                                                type="text"
                                                value={pattern.label}
                                                onChange={(e) => updatePattern(pattern.id, 'label', e.target.value)}
                                                className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-primary"
                                            />
                                        ) : (
                                            <span className="text-sm text-text-primary font-medium">{pattern.label}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editingId === pattern.id ? (
                                            <input
                                                type="text"
                                                value={pattern.pattern}
                                                onChange={(e) => updatePattern(pattern.id, 'pattern', e.target.value)}
                                                className="w-full px-2 py-1 bg-background border border-border rounded text-sm text-text-primary font-mono"
                                            />
                                        ) : (
                                            <code className="text-xs text-text-secondary font-mono bg-background-secondary px-2 py-1 rounded">
                                                {pattern.pattern}
                                            </code>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingId(editingId === pattern.id ? null : pattern.id)}
                                                className="text-xs text-primary hover:text-primary-hover font-medium"
                                            >
                                                {editingId === pattern.id ? 'Kaydet' : 'Düzenle'}
                                            </button>
                                            <button
                                                onClick={() => deletePattern(pattern.id)}
                                                className="p-1 text-red-500 hover:text-red-600"
                                                title="Sil"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add New Pattern */}
            <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-primary">Yeni Kalıp Ekle</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Etiket</label>
                        <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Örn: Dosya Esas No"
                            className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">Regex Pattern</label>
                        <input
                            type="text"
                            value={newPattern}
                            onChange={(e) => setNewPattern(e.target.value)}
                            placeholder="Örn: Esas No[:\\s]+([\\d/]+)"
                            className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <button
                    onClick={addPattern}
                    disabled={!newLabel.trim() || !newPattern.trim()}
                    className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-text rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    + Kalıp Ekle
                </button>
            </div>

            {/* Test Section */}
            <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-primary">Pattern'leri Test Et</h3>
                <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Test metninizi buraya yapıştırın... (Örn: Bu dosyanın Esas No: 2024/123 olarak kayıtlıdır.)"
                    className="w-full h-24 px-3 py-2 bg-background border border-border rounded text-sm text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    onClick={testPattern}
                    disabled={!testText.trim() || patterns.length === 0}
                    className="w-full px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Test Et
                </button>
                {testResults.length > 0 && (
                    <div className="bg-background-secondary rounded p-3 space-y-1">
                        <p className="text-xs font-semibold text-text-secondary mb-2">Bulunan Veriler:</p>
                        {testResults.map((result, i) => (
                            <div key={i} className="text-sm text-text-primary font-mono bg-background px-2 py-1 rounded">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomPatternsSection;
