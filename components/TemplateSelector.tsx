import React, { useState, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { noteTemplates, categoryConfig, type TemplateCategory, type NoteTemplate } from '../utils/templates';
import { CloseIcon, NotesIcon, EditIcon, LockIcon } from './icons/Icons';

// SVG Icons for categories and templates
const ScaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path d="M12 3v18" />
        <path d="M16 6l-4-3-4 3" />
        <path d="M3 9l3 6h6l3-6" />
        <path d="M9 15l3 6 3-6" />
    </svg>
);

const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
    </svg>
);

const HeartPulseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
);

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const ClickIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} className={`w-10 h-10 ${props.className || ''}`}>
        <path d="M9 9l5 12 1.8-5.2L21 14Z" />
        <path d="M7.2 2.2L8 5.1" />
        <path d="M5.1 8L2.2 7.2" />
        <path d="M14 4.1L12 6" />
        <path d="M6 12L4.1 14" />
    </svg>
);

// Category icon mapping
const getCategoryIcon = (category: TemplateCategory | 'all') => {
    switch (category) {
        case 'legal': return <ScaleIcon />;
        case 'accounting': return <ChartIcon />;
        case 'medical': return <HeartPulseIcon />;
        case 'confidential': return <ShieldIcon />;
        default: return <FolderIcon />;
    }
};

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: NoteTemplate) => void;
    onCreateEmpty: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    isOpen,
    onClose,
    onSelectTemplate,
    onCreateEmpty
}) => {
    const { t } = useTranslations();
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null);

    const categories: (TemplateCategory | 'all')[] = ['all', 'legal', 'accounting', 'medical', 'confidential'];

    const filteredTemplates = useMemo(() => {
        if (selectedCategory === 'all') return noteTemplates;
        return noteTemplates.filter(t => t.category === selectedCategory);
    }, [selectedCategory]);

    const getCategoryLabel = (cat: TemplateCategory | 'all') => {
        return t(`templates.categories.${cat}`);
    };

    const getTemplateItemName = (template: NoteTemplate) => {
        const parts = template.nameKey.split('.');
        const itemKey = parts[2];
        return t(`templates.items.${itemKey}.name`);
    };

    const getTemplateItemDesc = (template: NoteTemplate) => {
        const parts = template.descriptionKey.split('.');
        const itemKey = parts[2];
        return t(`templates.items.${itemKey}.desc`);
    };

    const getCategoryColor = (category: TemplateCategory) => {
        return categoryConfig[category].color;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-background rounded-2xl shadow-2xl border border-border/30 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <NotesIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">
                            {t('templates.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 px-5 py-3 border-b border-border/20 overflow-x-auto">
                    {categories.map(cat => {
                        const isActive = selectedCategory === cat;
                        const color = cat === 'all' ? '#6b7280' : categoryConfig[cat].color;
                        return (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setSelectedTemplate(null);
                                }}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                                    ${isActive
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
                                    }
                                `}
                                style={isActive ? { backgroundColor: `${color}20`, color: color, borderColor: `${color}30` } : {}}
                            >
                                {getCategoryIcon(cat)}
                                <span>{getCategoryLabel(cat)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Template List */}
                    <div className="w-1/2 p-4 overflow-y-auto border-r border-border/20">
                        {/* Empty Note Option */}
                        <button
                            onClick={onCreateEmpty}
                            className="w-full mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <EditIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                                        {t('templates.emptyNote')}
                                    </h3>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        {t('templates.emptyNoteDesc')}
                                    </p>
                                </div>
                            </div>
                        </button>

                        <div className="space-y-2">
                            {filteredTemplates.map(template => {
                                const color = getCategoryColor(template.category);
                                const isSelected = selectedTemplate?.id === template.id;
                                return (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`
                                            w-full p-4 rounded-xl border transition-all text-left
                                            ${isSelected
                                                ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
                                                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${color}20` }}
                                            >
                                                <FileTextIcon style={{ color: color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                                                        {getTemplateItemName(template)}
                                                    </h3>
                                                    {template.isConfidential && (
                                                        <LockIcon className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                                                    {getTemplateItemDesc(template)}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <span
                                                        className="text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1"
                                                        style={{ backgroundColor: `${color}20`, color: color }}
                                                    >
                                                        {getCategoryIcon(template.category)}
                                                        {getCategoryLabel(template.category)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="w-1/2 p-4 overflow-y-auto bg-white/[0.02]">
                        {selectedTemplate ? (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                        <div
                                            className="p-1.5 rounded-lg"
                                            style={{ backgroundColor: `${getCategoryColor(selectedTemplate.category)}20` }}
                                        >
                                            <FileTextIcon style={{ color: getCategoryColor(selectedTemplate.category) }} />
                                        </div>
                                        {getTemplateItemName(selectedTemplate)}
                                    </h3>
                                    <button
                                        onClick={() => onSelectTemplate(selectedTemplate)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        {t('templates.create')}
                                    </button>
                                </div>
                                <div className="flex-1 p-4 bg-background rounded-xl border border-border/20 overflow-y-auto">
                                    <div
                                        className="prose prose-sm prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                                    />
                                </div>
                                {selectedTemplate.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {selectedTemplate.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/10 text-text-secondary">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center">
                                <div className="text-text-secondary">
                                    <ClickIcon className="mx-auto mb-3 opacity-50" />
                                    <p>{t('templates.preview')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;
