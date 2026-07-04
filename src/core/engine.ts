// src/core/engine.ts
// Motor de tradução otimizado — regex pré-compilados, patterns pré-computados

import type {
  Language,
  TranslateOptions,
  TranslationResult,
  ModuleConfig,
  TranslationKey,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { lookupByKey, lookupByText } from './dictionary';
import { applyRules } from './rules';
import { PATTERNS } from './patterns';
import * as Cache from './cache';
import { resolveICU, hasICUMessages } from '../modules/icu';

// ── Regex de interpolação (pré-compilado) ──────────────────
const INTERPOLATE_REGEX = /\{(\w+)\}/g;

// ── Patterns pré-computados (lowercase calculado uma vez) ──
const PRECOMPUTED_PATTERNS = Object.entries(PATTERNS).map(([key, pattern]) => ({
  key,
  ptLower: pattern.pt.toLowerCase(),
  ptOriginal: pattern.pt,
  translations: pattern as Record<string, string>,
}));

// ── Interpolação reutilizável ──────────────────────────────
function interpolateParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(INTERPOLATE_REGEX, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

interface Translator {
  translate(text: TranslationKey, options?: Partial<TranslateOptions>): TranslationResult;
  translateObject<T extends Record<string, unknown>>(obj: T, target: Language): Record<string, string>;
  translateProject(dir: string, options: { source: Language; target: Language; dryRun?: boolean }): TranslationResult[];
}

export function createTranslator(config?: Partial<ModuleConfig>): Translator {
  const cfg: ModuleConfig = { ...DEFAULT_CONFIG, ...config };

  if (cfg.cacheEnabled) {
    Cache.configure({ maxSize: cfg.cacheMaxSize, ttlMs: cfg.cacheTtlMs });
  }

  function tryPattern(text: string, target: Language): string | null {
    const normalized = text.trim().toLowerCase();
    for (const pattern of PRECOMPUTED_PATTERNS) {
      if (normalized === pattern.ptLower || text === pattern.ptOriginal) {
        return pattern.translations[target];
      }
    }
    return null;
  }

  function translate(text: TranslationKey, options?: Partial<TranslateOptions>): TranslationResult {
    const source = options?.source || cfg.defaultSource;
    const target = options?.target || cfg.defaultTarget;
    const params = options?.params;

    let resolved = text;
    if (hasICUMessages(text) && params) {
      resolved = resolveICU(text, params);
    }

    if (source === target) {
      return { text: interpolateParams(resolved, params), source, target, fromCache: false, matched: true };
    }

    const ok = (t: string, fromCache: boolean): TranslationResult =>
      ({ text: interpolateParams(t, params), source, target, fromCache, matched: true });

    if (cfg.cacheEnabled) {
      const cached = Cache.get(source, target, text);
      if (cached) return ok(cached, true);
    }

    // Lookup por texto (O(1) com Map)
    const dictByText = lookupByText(text, target);
    if (dictByText) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, dictByText);
      return ok(dictByText, false);
    }

    // Lookup por chave (O(1))
    const dictByKey = lookupByKey(text, target);
    if (dictByKey) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, dictByKey);
      return ok(dictByKey, false);
    }

    const patternResult = tryPattern(text, target);
    if (patternResult) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, patternResult);
      return ok(patternResult, false);
    }

    const ruleResult = applyRules(text, source, target);
    if (ruleResult !== text) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, ruleResult);
      return ok(ruleResult, false);
    }

    if (cfg.fallbackEnabled && options?.fallback) {
      return { text: interpolateParams(options.fallback, params), source, target, fromCache: false, matched: false };
    }

    return { text: interpolateParams(text, params), source, target, fromCache: false, matched: false };
  }

  function translateObject<T extends Record<string, unknown>>(obj: T, target: Language): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'string' ? translate(value, { target }).text : String(value);
    }
    return result;
  }

  function translateProject(dir: string, options: { source: Language; target: Language; dryRun?: boolean }): TranslationResult[] {
    const results: TranslationResult[] = [];
    const fs = require('fs');
    const path = require('path');

    function walk(currentDir: string): void {
      for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
        const full = path.join(currentDir, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!entry.name.endsWith('.json')) continue;
        const flat: Record<string, string> = {};
        flattenObj(JSON.parse(fs.readFileSync(full, 'utf-8')), '', flat);
        for (const val of Object.values(flat)) {
          results.push(translate(val as TranslationKey, { source: options.source, target: options.target }));
        }
      }
    }

    function flattenObj(obj: Record<string, unknown>, prefix: string, out: Record<string, string>): void {
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null) flattenObj(v as Record<string, unknown>, key, out);
        else out[key] = String(v);
      }
    }

    walk(dir);
    return results;
  }

  return { translate, translateObject, translateProject };
}
