import React, { useMemo, useRef, useState, useEffect } from 'react';
import { CloseIcon } from './icons/Icons';
import { useTranslations } from '../hooks/useTranslations';

interface TagInputProps {
  tags: string[];
  allTags?: string[];
  onChange: (newTags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, allTags = [], onChange }) => {
  const { t } = useTranslations();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure cursor stays visible when tags grow
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [tags.length]);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [] as string[];
    return allTags
      .filter(tag => !tags.includes(tag))
      .filter(tag => tag.toLowerCase().includes(q))
      .slice(0, 6);
  }, [input, allTags, tags]);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      setInput('');
      return;
    }
    onChange([...tags, tag]);
    setInput('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
      return;
    }
    // Allow comma to create a tag quickly
    if (e.key === ',' ) {
      e.preventDefault();
      addTag(input);
      return;
    }
    // Backspace on empty input removes last tag
    if (e.key === 'Backspace' && input.trim() === '' && tags.length > 0) {
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
      return;
    }
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map(tag => (
          <span key={tag} className="flex items-center bg-border text-text-secondary text-xs font-semibold px-2 py-1 rounded-full">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-background"
              aria-label={`Remove tag ${tag}`}
            >
              <CloseIcon width="12" height="12" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('addTag') || 'Add tag...'}
          className="flex-1 min-w-[140px] max-w-[220px] bg-transparent text-xs text-text-primary placeholder:text-text-secondary border-b border-border focus:border-border-strong focus:outline-none py-1"
          aria-label="Add tag"
        />
      </div>
      {isFocused && suggestions.length > 0 && (
        <div className="mt-2 bg-background border border-border rounded shadow-sm max-w-xs">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-border"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;