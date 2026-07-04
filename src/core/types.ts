// src/core/types.ts
// Tipos TypeScript para o TradNinja

/** Idiomas suportados */
export type Language = 'pt' | 'en' | 'es' | 'fr';

/** Entrada do dicionário (PT → todos os idiomas) */
export interface DictionaryEntry {
  pt: string;
  en: string;
  es: string;
  fr: string;
}

/** Opções de tradução */
export interface TranslateOptions {
  /** Idioma de origem (padrão: 'pt') */
  source?: Language;
  /** Idioma de destino (obrigatório) */
  target: Language;
  /** Parâmetros para interpolação: {name: 'João'} */
  params?: Record<string, string | number>;
  /** Texto fallback se não encontrar tradução */
  fallback?: string;
}

/** Resultado da tradução */
export interface TranslationResult {
  /** Texto traduzido */
  text: string;
  /** Idioma de origem */
  source: Language;
  /** Idioma de destino */
  target: Language;
  /** Se veio do cache */
  fromCache: boolean;
  /** Se encontrou tradução no dicionário */
  matched: boolean;
}

/** Configuração do módulo */
export interface ModuleConfig {
  /** Idioma padrão de origem */
  defaultSource: Language;
  /** Idioma padrão de destino */
  defaultTarget: Language;
  /** Habilitar cache de traduções */
  cacheEnabled: boolean;
  /** TTL do cache em ms (padrão: 1h) */
  cacheTtlMs: number;
  /** Tamanho máximo do cache */
  cacheMaxSize: number;
  /** Habilitar fallback se não encontrar tradução */
  fallbackEnabled: boolean;
}

/** Template de padrão de tradução */
export interface PatternTemplate {
  /** Texto PT */
  pt: string;
  /** Texto EN */
  en: string;
  /** Texto ES */
  es: string;
  /** Parâmetros do template */
  params: string[];
}

/** Regra gramatical */
export interface GrammarRule {
  /** ID único da regra */
  id: string;
  /** Idioma de origem */
  source: Language;
  /** Idioma de destino */
  target: Language;
  /** Regex para detectar o padrão */
  match: RegExp;
  /** Função que retorna o texto substituto */
  replace: (match: string) => string;
  /** Descrição da regra */
  description: string;
}

/** Configuração padrão */
export const DEFAULT_CONFIG: ModuleConfig = {
  defaultSource: 'pt',
  defaultTarget: 'en',
  cacheEnabled: true,
  cacheTtlMs: 3600000, // 1 hora
  cacheMaxSize: 5000,
  fallbackEnabled: true,
};

/** Mapa de traduções */
export type TranslationMap = Record<string, Record<Language, string>>;

/** Tipo para chaves de tradução com dot-notation */
type DictionaryShape = Record<string, Record<string, unknown>>;

type DeepPaths<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? `${K}` | `${K}.${DeepPaths<T[K]>}`
        : `${K}`
    }[keyof T & string]
  : '';

export type TranslationKey = DeepPaths<DictionaryShape> | string;
