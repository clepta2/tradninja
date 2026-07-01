import { useContext, useCallback } from 'react';
import { TranslationContext, type TranslationContextValue } from './Provider';
import type { Language } from '../core/types';

interface UseTranslationReturn extends TranslationContextValue {
  locale: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  translate: (text: string, target?: Language) => string;
  changeLocale: (lang: Language) => void;
  supportedLocales: Language[];
}

export function useTranslation(): UseTranslationReturn {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error(
      'useTranslation must be used within a TranslationProvider'
    );
  }

  return context;
}
