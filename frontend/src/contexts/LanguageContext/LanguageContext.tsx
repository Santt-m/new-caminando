import { useState, useEffect, type ReactNode } from 'react';
import { LanguageContext, type Language } from './context';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        if (saved && ['es', 'en', 'pt'].includes(saved)) {
            return saved as Language;
        }

        // Detectar idioma del navegador
        const browserLang = navigator.language.split('-')[0];
        if (['es', 'en', 'pt'].includes(browserLang)) {
            return browserLang as Language;
        }

        return 'es'; // Idioma por defecto
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = (translations: { [key in Language]: any }, key: string): string => {
        const keys = key.split('.');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getNestedValue = (obj: any, pathKeys: string[]) => {
            return pathKeys.reduce((acc, current) => (acc && acc[current] !== undefined) ? acc[current] : undefined, obj);
        };

        const value = getNestedValue(translations[language], keys);
        if (value && typeof value === 'string') return value;

        const fallback = getNestedValue(translations.es, keys);
        return (typeof fallback === 'string' ? fallback : key);
    };

    const value = {
        language,
        setLanguage,
        t,
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
