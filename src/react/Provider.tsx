// src/react/Provider.tsx
// Provider de tradução para React/React Native

import React, { createContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Language } from '../core/types';
import { createTranslator } from '../core/engine';

export interface TranslationContextValue {
  /** Idioma atual */
  locale: Language;
  /** Alterar idioma */
  changeLocale: (lang: Language) => void;
  /** Traduzir texto por chave */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Traduzir texto livre */
  translate: (text: string, target?: Language) => string;
  /** Idiomas suportados */
  supportedLocales: Language[];
  /** Estatísticas do cache */
  cacheStats: { hits: number; misses: number; hitRate: number; size: number };
}

export const TranslationContext = createContext<TranslationContextValue>({
  locale: 'pt',
  changeLocale: () => {},
  t: (key) => key,
  translate: (text) => text,
  supportedLocales: ['pt', 'en', 'es'],
  cacheStats: { hits: 0, misses: 0, hitRate: 0, size: 0 },
});

interface ProviderProps {
  children: ReactNode;
  defaultLocale?: Language;
  supportedLocales?: Language[];
}

/**
 * Provider de tradução para React/React Native.
 *
 * @example
 * ```tsx
 * <TranslationProvider defaultLocale="pt">
 *   <App />
 * </TranslationProvider>
 * ```
 */
export function TranslationProvider({
  children,
  defaultLocale = 'pt',
  supportedLocales = ['pt', 'en', 'es'],
}: ProviderProps): React.JSX.Element {
  const [locale, setLocale] = useState<Language>(defaultLocale);
  const translator = useMemo(() => createTranslator(), []);

  const changeLocale = useCallback((lang: Language) => {
    if (!supportedLocales.includes(lang)) {
      console.warn(`[TradNinja] Idioma '${lang}' não suportado. Use: ${supportedLocales.join(', ')}`);
      return;
    }
    setLocale(lang);
  }, [supportedLocales]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const result = translator.translate(key, {
        source: 'pt',
        target: locale,
        params,
      });
      return result.text;
    },
    [locale, translator]
  );

  const translate = useCallback(
    (text: string, target?: Language): string => {
      const result = translator.translate(text, {
        source: 'pt',
        target: target || locale,
      });
      return result.text;
    },
    [locale, translator]
  );

  const cacheStats = useMemo(() => {
    try {
      const Cache = require('../core/cache');
      return Cache.getStats();
    } catch {
      return { hits: 0, misses: 0, hitRate: 0, size: 0 };
    }
  }, []);

  const value: TranslationContextValue = {
    locale,
    changeLocale,
    t,
    translate,
    supportedLocales,
    cacheStats,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
