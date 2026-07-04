/**
 * Script para dividir dicionários grandes em arquivos menores por faixa alfabética.
 *
 * Uso:
 *   npx tsx scripts/split-dictionaries.ts
 *
 * Lê os arquivos em src/i18n/*.json e gera arquivos divididos em:
 *   src/i18n/split/{lang}/{prefix}.ts
 *
 * Cada arquivo contém um pedaço do dicionário (ex: a-d.json, e-h.json, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_DIR = path.resolve(__dirname, '../src/i18n');
const OUTPUT_DIR = path.resolve(__dirname, '../src/i18n/split');

// Faixas alfabéticas
const RANGES: [string, string[]][] = [
  ['a-d', ['a', 'b', 'c', 'd']],
  ['e-h', ['e', 'f', 'g', 'h']],
  ['i-l', ['i', 'j', 'k', 'l']],
  ['m-p', ['m', 'n', 'o', 'p']],
  ['q-t', ['q', 'r', 's', 't']],
  ['u-z', ['u', 'v', 'w', 'x', 'y', 'z']],
  ['0-9', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']],
  ['special', []], // caracteres que não começam com a-z0-9
];

const LANGS = ['pt', 'en', 'es', 'fr'] as const;

function getRangeForChar(char: string): string {
  const lower = char.toLowerCase();
  for (const [range, letters] of RANGES) {
    if (range === 'special') continue;
    if (letters.includes(lower)) return range;
  }
  return 'special';
}

function splitEntries(entries: Record<string, string>): Map<string, Record<string, string>> {
  const buckets = new Map<string, Record<string, string>>();

  for (const [range] of RANGES) {
    buckets.set(range, {});
  }

  for (const [key, value] of Object.entries(entries)) {
    const firstChar = key.charAt(0);
    const range = getRangeForChar(firstChar);
    buckets.get(range)![key] = value;
  }

  return buckets;
}

function generateRangeFile(
  lang: string,
  rangeName: string,
  entries: Record<string, string>
): string {
  const lines: string[] = [];
  lines.push(`// ${lang.toUpperCase()} - Faixa ${rangeName}`);
  lines.push(`// Gerado automaticamente por split-dictionaries.ts`);
  lines.push(`// Total: ${Object.keys(entries).length} entradas`);
  lines.push('');
  lines.push(`export const DICT_${lang.toUpperCase()}_${rangeName.replace('-', '_')}: Record<string, string> = {`);

  const keys = Object.keys(entries).sort();
  for (const key of keys) {
    const escaped = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const val = entries[key].replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`  '${escaped}': '${val}',`);
  }

  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

function generateIndexFile(lang: string, ranges: string[], counts: Record<string, number>): string {
  const lines: string[] = [];
  lines.push(`// ${lang.toUpperCase()} - Índice de todos os ranges`);
  lines.push(`// Gerado automaticamente por split-dictionaries.ts`);
  lines.push('');
  lines.push(`import { DICT_${lang.toUpperCase()}_${ranges[0].replace('-', '_')} } from './${ranges[0]}';`);

  for (let i = 1; i < ranges.length; i++) {
    const importName = `DICT_${lang.toUpperCase()}_${ranges[i].replace('-', '_')}`;
    lines.push(`import { ${importName} } from './${ranges[i]}';`);
  }

  lines.push('');
  lines.push(`export type Dict${lang.charAt(0).toUpperCase() + lang.slice(1)}Range =`);

  for (const range of ranges) {
    lines.push(`  | typeof DICT_${lang.toUpperCase()}_${range.replace('-', '_')}`);
  }
  lines.push(';');
  lines.push('');

  lines.push(`export const ALL_${lang.toUpperCase()}_RANGES: Dict${lang.charAt(0).toUpperCase() + lang.slice(1)}Range[] = [`);
  for (const range of ranges) {
    lines.push(`  DICT_${lang.toUpperCase()}_${range.replace('-', '_')},`);
  }
  lines.push('];');
  lines.push('');

  lines.push(`export const TOTAL_${lang.toUpperCase()}_ENTRIES = ${Object.values(counts).reduce((a, b) => a + b, 0)};`);
  lines.push('');

  return lines.join('\n');
}

function generateSummary(allCounts: Record<string, Record<string, number>>): string {
  const lines: string[] = [];
  lines.push('// Resumo da divisão dos dicionários');
  lines.push('// Gerado automaticamente por split-dictionaries.ts');
  lines.push('');
  lines.push('export const DICTIONARY_SPLIT_SUMMARY = {');

  for (const [lang, counts] of Object.entries(allCounts)) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    lines.push(`  ${lang}: {`);
    lines.push(`    total: ${total},`);
    for (const [range, count] of Object.entries(counts)) {
      lines.push(`    '${range}': ${count},`);
    }
    lines.push('  },');
  }

  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

function main() {
  console.log('🔄 Dividindo dicionários em faixas alfabéticas...\n');

  const allCounts: Record<string, Record<string, number>> = {};

  for (const lang of LANGS) {
    const jsonPath = path.join(I18N_DIR, `${lang}.json`);

    if (!fs.existsSync(jsonPath)) {
      console.log(`  ⏭️  ${lang}.json não encontrado, pulando...`);
      continue;
    }

    console.log(`📂 Processando ${lang.toUpperCase()}...`);

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const entries: Record<string, string> = JSON.parse(raw);
    const totalOriginal = Object.keys(entries).length;

    console.log(`   Total original: ${totalOriginal} entradas`);

    // Dividir em faixas
    const buckets = splitEntries(entries);

    // Criar diretório de saída
    const langDir = path.join(OUTPUT_DIR, lang);
    fs.mkdirSync(langDir, { recursive: true });

    const rangeNames: string[] = [];
    const counts: Record<string, number> = {};

    // Gerar arquivos de cada faixa
    for (const [rangeName, rangeEntries] of buckets) {
      const count = Object.keys(rangeEntries).length;
      if (count === 0) continue;

      rangeNames.push(rangeName);
      counts[rangeName] = count;

      const content = generateRangeFile(lang, rangeName, rangeEntries);
      const outPath = path.join(langDir, `${rangeName}.ts`);
      fs.writeFileSync(outPath, content, 'utf-8');
      console.log(`   ✅ ${rangeName}.ts: ${count} entradas`);
    }

    // Gerar índice
    const indexContent = generateIndexFile(lang, rangeNames, counts);
    fs.writeFileSync(path.join(langDir, 'index.ts'), indexContent, 'utf-8');

    allCounts[lang] = counts;
    console.log(`   📄 index.ts gerado com ${rangeNames.length} ranges\n`);
  }

  // Gerar resumo
  const summaryPath = path.join(OUTPUT_DIR, 'summary.ts');
  fs.writeFileSync(summaryPath, generateSummary(allCounts), 'utf-8');
  console.log(`📊 Resumo salvo em ${summaryPath}`);

  console.log('\n✨ Divisão concluída!');
  console.log(`   Arquivos gerados em: ${OUTPUT_DIR}`);
}

main();
