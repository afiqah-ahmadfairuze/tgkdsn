import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageContextType, BilingualText } from '@/types/tgkdsn';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/*
 * Provides language state and translation function to the app
 * Persists language preference to localStorage
 */
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        // Get language from localStorage on initial load, default to 'en'
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('appLanguage') as Language;
            return savedLanguage || 'en';
        }
        return 'en';
    });

    // Save language to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('appLanguage', language);
        }
    }, [language]);

    /* Returns the text in the currently selected language */
    const t = (text: BilingualText): string => {
        return text[language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

/* Hook to access language context throughout the app */
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
