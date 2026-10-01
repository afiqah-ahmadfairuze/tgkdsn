export type Language = 'en' | 'bm';

export interface BilingualText {
    en: string;
    bm: string;
}

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (text: BilingualText) => string;
}
