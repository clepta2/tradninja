export type Language = 'pt' | 'en' | 'es';

export interface DictionaryEntry {
  pt: string;
  en: string;
  es: string;
}

export interface TranslateOptions {
  source?: Language;
  target: Language;
  params?: Record<string, string | number>;
  fallback?: string;
}

export interface TranslationResult {
  text: string;
  source: Language;
  target: Language;
  fromCache: boolean;
  matched: boolean;
}

export interface ModuleConfig {
  defaultSource: Language;
  defaultTarget: Language;
  cacheEnabled: boolean;
  cacheTtlMs: number;
  cacheMaxSize: number;
  fallbackEnabled: boolean;
}

export interface PatternTemplate {
  pt: string;
  en: string;
  es: string;
  params: string[];
}

export interface GrammarRule {
  id: string;
  source: Language;
  target: Language;
  match: RegExp;
  replace: (match: string) => string;
  description: string;
}

export const DEFAULT_CONFIG: ModuleConfig = {
  defaultSource: 'pt',
  defaultTarget: 'en',
  cacheEnabled: true,
  cacheTtlMs: 3600000,
  cacheMaxSize: 5000,
  fallbackEnabled: true,
};

export type TranslationMap = Record<string, Record<Language, string>>;

// ── Template literal type utilities for dot-notation keys ────────

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Paths<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? T[K] extends object
          ? `${K}` | Join<K, Paths<T[K]>>
          : `${K}`
        : never
    }[keyof T]
  : '';

type DictionaryShape = Record<string, Record<string, unknown>>;

type DeepPaths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? `${K}` | Join<K, DeepPaths<T[K]>>
        : `${K}`
    }[keyof T & string]
  : '';

export type TranslationKey = DeepPaths<DictionaryShape> | string;
