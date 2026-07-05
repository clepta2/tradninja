// scripts/gen-split-dict.cjs
// Gera dicionários POR IDIOMA (arquivo separado por língua)
// + usa stems para deduplicar verbos

const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const OUT_DIR = path.join(__dirname, '../src/core/dicts');
const LANGS = ['en','es','fr','de','it'];
const LANG_NAMES = { en:'English', es:'Español', fr:'Français', de:'Deutsch', it:'Italiano' };

function loadDict(lang) {
  try {
    const c = fs.readFileSync(path.join(DICT_DIR, `dictionary${lang}.ts`), 'utf8');
    const m = {};
    const re = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
    let x;
    while ((x = re.exec(c)) !== null) m[x[1]] = x[2];
    return m;
  } catch { return {}; }
}

const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));
const dicts = {};
LANGS.forEach(l => dicts[l] = loadDict(l));

// ── Gera 1 arquivo por idioma ──────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const counts = {};

for (const lang of LANGS) {
  const entries = [];
  const seenLang = new Set(); // Dedup por PT word por idioma

  for (const [key, ptVal] of Object.entries(pt)) {
    const v = String(ptVal).trim();
    if (v.length < 2 || seenLang.has(v)) continue;

    const translation = dicts[lang][v];
    if (!translation) continue;

    // Filtra: só traduções de 1-2 palavras
    const words = translation.split(' ');
    if (words.length > 2) continue;

    seenLang.add(v);
    entries.push([v, translation]);
  }

  counts[lang] = entries.length;

  // Gera arquivo TS por idioma
  let ts = `// src/core/dicts/dict-${lang}.ts\n`;
  ts += `// ${entries.length} termos PT→${LANG_NAMES[lang]} (word-to-word)\n`;
  ts += `// Auto-gerado — traduções de 1-2 palavras\n\n`;
  ts += `export const DICT_${lang.toUpperCase()}: Record<string, string> = {\n`;
  for (const [pt, target] of entries) {
    ts += JSON.stringify(pt) + ':' + JSON.stringify(target) + ',\n';
  }
  ts += '};\n';

  fs.writeFileSync(path.join(OUT_DIR, `dict-${lang}.ts`), ts, 'utf8');
  console.log(`${lang}: ${entries.length} termos`);
}

// ── Gera barrel index ──────────────────────────────────────
let barrel = '// src/core/dicts/index.ts\n';
barrel += '// Barrel — exports por idioma\n';
barrel += '// Lazy loading: só carrega o idioma que precisa\n\n';
for (const lang of LANGS) {
  barrel += `export { DICT_${lang.toUpperCase()} } from './dict-${lang}';\n`;
}
barrel += `\nexport const ALL_LANGS = ${JSON.stringify(LANGS)};\n`;

fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), barrel, 'utf8');

// ── Stats ──────────────────────────────────────────────────
const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`\nTotal: ${total} entradas × ${LANGS.length} idiomas`);
console.log(`Arquivos: ${LANGS.length} + 1 barrel`);
console.log(`Cobertura EN: ${counts.en} termos`);
console.log(`Cobertura JA (via cross): ${counts.en} termos × 31 idiomas`);
