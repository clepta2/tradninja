import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
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

const STRING_REGEX = /['"]([^'"]{2,}?)['"]/g;
const JSX_TEXT_REGEX = />\s*([^<{}]+?)\s*</g;

const translator = createTranslator();

export function scanForStrings(dir: string): ScanResult[] {
  const results: ScanResult[] = [];

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith('.tsx') && !entry.name.endsWith('.ts')) continue;
      if (extname(entry.name) === '.ts' && !entry.name.endsWith('.tsx')) continue;
      scanFile(fullPath);
    }
  }

  function scanFile(filePath: string): void {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments, imports, requires
      if (/^\s*(\/\/|\/\*|\*\/|import|from|export)/.test(line)) continue;

      let match: RegExpExecArray | null;
      const strRegex = /['"]([^'"]{2,}?)['"]/g;
      while ((match = strRegex.exec(line)) !== null) {
        const value = match[1];
        if (looksLikePortuguese(value)) {
          results.push({
            file: filePath,
            line: i + 1,
            column: match.index,
            original: value,
            context: line.trim(),
          });
        }
      }
    }
  }

  function looksLikePortuguese(text: string): boolean {
    if (/\d+/.test(text) && text.length < 5) return false;
    if (/\.(js|ts|json|png|jpg|svg)$/.test(text)) return false;
    if (/^(https?:|\/\/|@|#[\w-]+)/.test(text)) return false;
    if (/\{[\w.]+\}/.test(text)) return true; // interpolation strings

    const ptPatterns = [
      /[ãõçêêáéíóúàèìòùâêîôû]/i,
      /\b(de|da|do|das|dos|em|com|para|por|não|sim|que|uma?|os?|as?|isso|este|esta)\b/i,
    ];
    return ptPatterns.some((p) => p.test(text));
  }

  walk(dir);
  return results;
}

type TranslationDict = Record<string, Record<Language, string>>;

export function generateTranslations(
  strings: ScanResult[],
  dictionary: TranslationDict
): Record<Language, string[]> {
  const result: Record<Language, string[]> = {
    pt: [],
    en: [],
    es: [],
  };

  const targetLangs: Language[] = ['en', 'es'];

  for (const item of strings) {
    result.pt.push(item.original);

    for (const lang of targetLangs) {
      const dict = dictionary[item.original];
      if (dict && dict[lang]) {
        result[lang].push(dict[lang]);
      } else {
        const translated = translator.translate(item.original, {
          source: 'pt',
          target: lang,
        });
        result[lang].push(translated.matched ? translated.text : item.original);
      }
    }
  }

  return result;
}

export function exportTranslationFiles(
  translations: Record<Language, string[]>,
  outputDir: string
): void {
  for (const [lang, strings] of Object.entries(translations)) {
    const lines = strings.map((s, i) => `  "${i}": "${s}"`);
    const content = `{\n${lines.join(',\n')}\n}\n`;
    writeFileSync(join(outputDir, `${lang}.json`), content, 'utf-8');
  }
}
