import type { TranslatedField } from '../services/types';
import type { Language } from '../contexts/LanguageContext';

/**
 * Gets the translated value from a field that can be either a string or a TranslatedField
 * @param field - The field to translate (string or TranslatedField object)
 * @param language - The target language ('es', 'en', or 'pt')
 * @returns The translated string
 */
export const getTranslatedValue = (
  field: string | TranslatedField | undefined,
  language: Language = 'es'
): string => {
  if (!field) return '';
  
  // If it's already a string, return it
  if (typeof field === 'string') return field;
  
  // If it's a TranslatedField object, get the language value with fallback
  return field[language] || field.es || '';
};
