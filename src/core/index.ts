export type {
  Language,
  DictionaryEntry,
  TranslateOptions,
  TranslationResult,
  ModuleConfig,
  PatternTemplate,
  GrammarRule,
  TranslationMap,
  TranslationKey,
} from './types';

export { DEFAULT_CONFIG } from './types';
export { DICTIONARY } from './dictionary';
export { GRAMMAR_RULES, applyRules } from './rules';
export { PATTERNS, interpolatePattern } from './patterns';
export { get, set, clear, size, configure, getStats } from './cache';
export { createTranslator } from './engine';
