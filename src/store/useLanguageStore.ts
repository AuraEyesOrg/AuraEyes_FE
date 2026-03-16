import { create } from 'zustand';
import { getItem, setItem } from '@/lib/local-storage';

export type Language = 'en' | 'vi';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', flag: '🇻🇳' },
];

const LANGUAGE_KEY = 'app_language';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getItem<Language>(LANGUAGE_KEY) ?? 'en',
  setLanguage: (lang) => {
    setItem(LANGUAGE_KEY, lang);
    set({ language: lang });
  },
}));
