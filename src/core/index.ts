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
} from './types';

export { DEFAULT_CONFIG } from './types';
export {
  lookupByText, lookupByKey, hasTranslation, getTranslations,
  getAvailableLanguages, crossTranslate, dictionarySize, loadedLanguages,
  clearLanguageCache, getDictionaryStats, translateBatch, initDictionary,
} from './dictionary';
export { GRAMMAR_RULES, applyRules, formatNumber, formatCurrency, getGenderMap } from './rules';
export { PATTERNS, interpolatePattern, getPattern } from './patterns';
export { createTranslator } from './engine';
