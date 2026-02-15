import { createContext } from 'react';

export type Language = 'es' | 'en' | 'pt';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ITranslation = { [key in Language]: any };

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (translations: ITranslation, key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

