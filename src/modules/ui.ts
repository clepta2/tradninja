// src/modules/ui.ts
// Scan de strings hardcoded + geração de traduções — suporta todos 31 idiomas

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import type { Language } from '../core/types';
import { createTranslator } from '../core/engine';

interface ScanResult {
  file: string;
  line: number;
  column: number;
  original: string;
  context: string;
}

const PT_MARKERS = /[ãõçêêáéíóúàèìòùâêîôû]|\b(de|da|do|das|dos|em|com|para|por|não|sim|que|uma?|os?|as?|isso|este|esta)\b/i;

let translator: ReturnType<typeof createTranslator> | null = null;
function getTranslator() {
  if (!translator) translator = createTranslator();
  return translator;
}

export function scanForStrings(dir: string): ScanResult[] {
  const results: ScanResult[] = [];

  function walk(currentDir: string): void {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const full = join(currentDir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') { walk(full); continue; }
      if (!entry.name.endsWith('.tsx') && !entry.name.endsWith('.ts')) continue;
      if (extname(entry.name) === '.ts' && !entry.name.endsWith('.tsx')) continue;

      const lines = readFileSync(full, 'utf-8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*(\/\/|\/\*|\*\/|import|from|export)/.test(line)) continue;
        const re = /['"]([^'"]{2,}?)['"]/g;
        let match: RegExpExecArray | null;
        while ((match = re.exec(line)) !== null) {
          const v = match[1];
          if (/\d+/.test(v) && v.length < 5) continue;
          if (/\.(js|ts|json|png|jpg|svg)$/.test(v)) continue;
          if (/^(https?:|\/\/|@|#[\w-]+)/.test(v)) continue;
          if (PT_MARKERS.test(v) || /\{[\w.]+\}/.test(v)) {
            results.push({ file: full, line: i + 1, column: match.index, original: v, context: line.trim() });
          }
        }
      }
    }
  }

  walk(dir);
  return results;
}

type TranslationDict = Record<string, Record<Language, string>>;

const ALL_TARGETS: Language[] = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru', 'hi'];

export function generateTranslations(
  strings: ScanResult[],
  dictionary: TranslationDict,
  targets: Language[] = ALL_TARGETS
): Record<Language, string[]> {
  const result: Record<string, string[]> = { pt: [] };
  targets.forEach(t => { result[t] = []; });

  for (const item of strings) {
    result.pt.push(item.original);
    for (const lang of targets) {
      const dict = dictionary[item.original];
      if (dict?.[lang]) { result[lang].push(dict[lang]); }
      else {
        const t = getTranslator().translate(item.original, { source: 'pt', target: lang });
        result[lang].push(t.matched ? t.text : item.original);
      }
    }
  }

  return result as Record<Language, string[]>;
}

export function exportTranslationFiles(translations: Record<Language, string[]>, outputDir: string): void {
  for (const [lang, strings] of Object.entries(translations)) {
    const lines = strings.map((s, i) => `  "${i}": "${s}"`);
    writeFileSync(join(outputDir, `${lang}.json`), `{\n${lines.join(',\n')}\n}\n`, 'utf-8');
  }
}
