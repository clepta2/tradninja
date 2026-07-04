// ── Core ──────────────────────────────────────────────────────────
export type {
  Language,
  DictionaryEntry,
  TranslateOptions,
  TranslationResult,
  ModuleConfig,
  PatternTemplate,
  GrammarRule,
  TranslationKey,
  TranslationMap,
} from './core/types';
export { DEFAULT_CONFIG } from './core/types';
export {
  lookupByText, lookupByKey, hasTranslation, getTranslations,
  getAvailableLanguages, crossTranslate, dictionarySize, loadedLanguages,
  clearLanguageCache, getDictionaryStats, translateBatch, initDictionary,
} from './core/dictionary';
export { GRAMMAR_RULES, applyRules, formatNumber, formatCurrency, getGenderMap } from './core/rules';
export { PATTERNS, interpolatePattern, getPattern } from './core/patterns';
export * as Cache from './core/cache';
export { createTranslator } from './core/engine';

// ── Modules ───────────────────────────────────────────────────────
export { scanForStrings, generateTranslations } from './modules/ui';
export { extractComments, translateComments } from './modules/comments';
export { translateSEO, generateMetaFiles } from './modules/seo';
export { translateVideoMetadata } from './modules/video';
export { translateContent } from './modules/content';
export {
  pseudoLocalize, generatePseudoLanguage, getPseudoLocale, isPseudoLocale,
} from './modules/pseudo';
export { resolveICU, hasICUMessages, extractICUKeys } from './modules/icu';
export {
  isRTLLanguage, getRTLConfig, applyRTLLayout, getRTLanguages, mirrorIfNeeded,
} from './modules/rtl';

// ── React ─────────────────────────────────────────────────────────
export { T, Trans, TranslationProvider, useTranslation, TranslationContext } from './react';
