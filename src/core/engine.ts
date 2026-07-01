import type {
  Language,
  TranslateOptions,
  TranslationResult,
  ModuleConfig,
  TranslationKey,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { DICTIONARY } from './dictionary';
import { applyRules } from './rules';
import { PATTERNS, interpolatePattern } from './patterns';
import * as Cache from './cache';
import { resolveICU, hasICUMessages } from '../modules/icu';

interface Translator {
  translate(text: TranslationKey, options?: Partial<TranslateOptions>): TranslationResult;
  translateObject<T extends Record<string, unknown>>(
    obj: T,
    target: Language
  ): Record<string, string>;
  translateProject(
    dir: string,
    options: { source: Language; target: Language; dryRun?: boolean }
  ): TranslationResult[];
}

export function createTranslator(
  config?: Partial<ModuleConfig>
): Translator {
  const cfg: ModuleConfig = { ...DEFAULT_CONFIG, ...config };

  if (cfg.cacheEnabled) {
    Cache.configure({ maxSize: cfg.cacheMaxSize, ttlMs: cfg.cacheTtlMs });
  }

  function lookupInDict(
    text: string,
    target: Language
  ): string | null {
    const entry = DICTIONARY[text];
    if (!entry) return null;
    return entry[target] || null;
  }

  function interpolateParams(
    text: string,
    params?: Record<string, string | number>
  ): string {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, key) =>
      params[key] !== undefined ? String(params[key]) : `{${key}}`
    );
  }

  function tryPattern(
    text: string,
    target: Language
  ): string | null {
    const normalized = text.trim().toLowerCase();
    for (const [key, pattern] of Object.entries(PATTERNS)) {
      const ptLower = pattern.pt.toLowerCase();
      if (normalized === ptLower || text === pattern.pt) {
        return pattern[target];
      }
    }
    return null;
  }

  function translate(
    text: TranslationKey,
    options?: Partial<TranslateOptions>
  ): TranslationResult {
    const source = options?.source || cfg.defaultSource;
    const target = options?.target || cfg.defaultTarget;
    const params = options?.params;

    let resolved = text;
    if (hasICUMessages(text) && params) {
      resolved = resolveICU(text, params);
    }

    if (source === target) {
      const result = interpolateParams(resolved, params);
      return { text: result, source, target, fromCache: false, matched: true };
    }

    const ok = (t: string, fromCache: boolean): TranslationResult =>
      ({ text: interpolateParams(t, params), source, target, fromCache, matched: true });

    if (cfg.cacheEnabled) {
      const cached = Cache.get(source, target, text);
      if (cached) return ok(cached, true);
    }

    const dictResult = lookupInDict(text, target);
    if (dictResult) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, dictResult);
      return ok(dictResult, false);
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

  function translateObject<T extends Record<string, unknown>>(
    obj: T,
    target: Language
  ): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = translate(value, { target }).text;
      } else {
        result[key] = String(value);
      }
    }
    return result;
  }

  function translateProject(
    dir: string,
    options: { source: Language; target: Language; dryRun?: boolean }
  ): TranslationResult[] {
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
