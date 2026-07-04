// src/core/engine.ts
// Motor de tradução TradNinja — API principal

import type { Language, TranslateOptions, TranslationResult, ModuleConfig, TranslationKey } from './types';
import { DEFAULT_CONFIG } from './types';
import { lookupByKey, lookupByText, translateBatch, crossTranslate, initDictionary } from './dictionary';
import { applyRules } from './rules';
import { PATTERNS } from './patterns';
import * as Cache from './cache';
import { resolveICU, hasICUMessages } from '../modules/icu';

// ── Pré-computados ─────────────────────────────────────────
const INTERPOLATE_REGEX = /\{(\w+)\}/g;

const PATTERN_BY_PT = new Map<string, Record<string, string>>();
for (const pattern of Object.values(PATTERNS)) {
  PATTERN_BY_PT.set(pattern.pt.toLowerCase(), pattern as Record<string, string>);
  if (pattern.pt !== pattern.pt.toLowerCase()) PATTERN_BY_PT.set(pattern.pt, pattern as Record<string, string>);
}

function interpolateParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(INTERPOLATE_REGEX, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

// ── Helpers ─────────────────────────────────────────────────
function flattenObj(obj: Record<string, unknown>, prefix: string, out: Record<string, string>): void {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) flattenObj(v as Record<string, unknown>, key, out);
    else out[key] = String(v);
  }
}

// ── Interface ───────────────────────────────────────────────
interface Translator {
  translate(text: TranslationKey, options?: Partial<TranslateOptions>): TranslationResult;
  translateObject<T extends Record<string, unknown>>(obj: T, target: Language): Record<string, string>;
  translateProject(dir: string, options: { source: Language; target: Language; dryRun?: boolean }): TranslationResult[];
  translateBatch(texts: string[], target: Language): Promise<string[]>;
  crossTranslate(text: string, source: Language, target: Language, pivot?: Language): Promise<string>;
}

/**
 * Cria um tradutor TradNinja.
 *
 * @example
 * ```ts
 * const t = createTranslator({ defaultTarget: 'en' });
 * t.translate('Salvar').text;                    // "Save"
 * t.translate('Oi, {name}!', { params: { name: 'João' } }).text; // "Hi, João!"
 * t.translateObject({ title: 'Início' }, 'es');  // { title: 'Inicio' }
 * ```
 */
export function createTranslator(config?: Partial<ModuleConfig>): Translator {
  const cfg: ModuleConfig = { ...DEFAULT_CONFIG, ...config };

  if (cfg.cacheEnabled) Cache.configure({ maxSize: cfg.cacheMaxSize, ttlMs: cfg.cacheTtlMs });
  initDictionary(cfg.defaultTarget).catch(() => {});

  // Pipeline de tradução: cache → dict → patterns → rules → fallback
  function translate(text: TranslationKey, options?: Partial<TranslateOptions>): TranslationResult {
    const source = options?.source || cfg.defaultSource;
    const target = options?.target || cfg.defaultTarget;
    const params = options?.params;

    let resolved = text;
    if (hasICUMessages(text) && params) resolved = resolveICU(text, params);

    if (source === target) return { text: interpolateParams(resolved, params), source, target, fromCache: false, matched: true };

    const ok = (t: string, fromCache: boolean): TranslationResult =>
      ({ text: interpolateParams(t, params), source, target, fromCache, matched: true });

    // 1. Cache
    if (cfg.cacheEnabled) {
      const cached = Cache.get(source, target, text);
      if (cached) return ok(cached, true);
    }

    // 2. Dictionary (by text then by key)
    const dictHit = lookupByText(text, target) || lookupByKey(text, target);
    if (dictHit) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, dictHit);
      return ok(dictHit, false);
    }

    // 3. Patterns (O(1) Map lookup)
    const patternHit = PATTERN_BY_PT.get(text.trim().toLowerCase())?.[target] || PATTERN_BY_PT.get(text)?.[target];
    if (patternHit) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, patternHit);
      return ok(patternHit, false);
    }

    // 4. Grammar rules
    const ruleHit = applyRules(text, source, target);
    if (ruleHit !== text) {
      if (cfg.cacheEnabled) Cache.set(source, target, text, ruleHit);
      return ok(ruleHit, false);
    }

    // 5. Fallback
    if (cfg.fallbackEnabled && options?.fallback) return { text: interpolateParams(options.fallback, params), source, target, fromCache: false, matched: false };
    return { text: interpolateParams(text, params), source, target, fromCache: false, matched: false };
  }

  function translateObject<T extends Record<string, unknown>>(obj: T, target: Language): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      try { result[key] = typeof value === 'string' ? translate(value, { target }).text : String(value); }
      catch { result[key] = typeof value === 'string' ? value : String(value); }
    }
    return result;
  }

  async function translateBatchLocal(texts: string[], target: Language): Promise<string[]> {
    try { return await translateBatch(texts, target); } catch { return texts; }
  }

  function translateProject(dir: string, options: { source: Language; target: Language; dryRun?: boolean }): TranslationResult[] {
    const results: TranslationResult[] = [];
    const fs = require('fs') as typeof import('fs');
    const pathMod = require('path') as typeof import('path');

    function walk(d: string): void {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = pathMod.join(d, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!entry.name.endsWith('.json')) continue;
        const flat: Record<string, string> = {};
        flattenObj(JSON.parse(fs.readFileSync(full, 'utf-8')), '', flat);
        for (const val of Object.values(flat)) {
          results.push(translate(val as TranslationKey, { source: options.source, target: options.target }));
        }
      }
    }

    walk(dir);
    return results;
  }

  return { translate, translateObject, translateProject, translateBatch: translateBatchLocal, crossTranslate };
}
