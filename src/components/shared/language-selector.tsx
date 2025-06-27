'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type Language } from './code-editor';

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  noFocusRing?: boolean;
}

export function LanguageSelector({
  value,
  onValueChange,
  className,
  noFocusRing = false,
}: LanguageSelectorProps) {
  const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.value === value);

  const triggerClasses = noFocusRing
    ? `focus:ring-0 focus:ring-offset-0 ${className || 'w-[140px]'}`
    : `focus:ring-1 focus:ring-offset-0 focus:ring-blue-300 ${className || 'w-[140px]'}`;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClasses}>
        <SelectValue placeholder="Select language">{selectedLanguage?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map(lang => (
          <SelectItem key={lang.value} value={lang.value}>
            <span>{lang.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface LanguageSelectorWithLabelProps extends LanguageSelectorProps {
  label?: string;
  showIcon?: boolean;
}

export function LanguageSelectorWithLabel({
  value,
  onValueChange,
  className,
  noFocusRing,
  label = 'Language:',
  showIcon = true,
}: LanguageSelectorWithLabelProps) {
  return (
    <div className="flex items-center gap-3">
      {showIcon && <Code2 className="w-4 h-4 text-gray-500" />}
      <label className="text-sm font-medium">{label}</label>
      <LanguageSelector
        value={value}
        onValueChange={onValueChange}
        className={className}
        noFocusRing={noFocusRing}
      />
    </div>
  );
}
