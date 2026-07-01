import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import type { Language } from '../../core/types';
import { createTranslator } from '../../core/engine';

interface TranslationContextValue {
  locale: Language;
  changeLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translate: (text: string, target?: Language) => string;
  supportedLocales: Language[];
}

export const TranslationContext = createContext<TranslationContextValue>({
  locale: 'pt',
  changeLocale: () => {},
  t: (key) => key,
  translate: (text) => text,
  supportedLocales: ['pt', 'en', 'es'],
});

interface ProviderProps {
  children: ReactNode;
  defaultLocale?: Language;
  supportedLocales?: Language[];
}

const translator = createTranslator();

export function TranslationProvider({
  children,
  defaultLocale = 'pt',
  supportedLocales = ['pt', 'en', 'es'],
}: ProviderProps): React.JSX.Element {
  const [locale, setLocale] = useState<Language>(defaultLocale);

  const changeLocale = useCallback((lang: Language) => {
    setLocale(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const result = translator.translate(key, {
        source: 'pt',
        target: locale,
        params,
      });
      return result.text;
    },
    [locale]
  );

  const translate = useCallback(
    (text: string, target?: Language): string => {
      const result = translator.translate(text, {
        source: 'pt',
        target: target || locale,
      });
      return result.text;
    },
    [locale]
  );

  const value: TranslationContextValue = {
    locale,
    changeLocale,
    t,
    translate,
    supportedLocales,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
