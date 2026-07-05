// scripts/gen-big-dict-v2.cjs
// Gera overrides word-to-word SEM filtro agressivo
// Pega TODAS as palavras do dicionário EN

const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const LANGS = ['en','es','fr','de','it','ja','ko','zh','ar','ru','hi','nl','pl','sv','da','no','fi','cs','el','hu','ro','uk','id','ms','th','tr','he','bn','sw'];

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

// Carrega dicts
const dicts = {};
for (const lang of LANGS) dicts[lang] = loadDict(lang);

// PT dictionary
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));

// Override manual para palavras que o dicionário contextual erra
const MANUAL_FIXES = {
  'preto': { en: 'black', es: 'negro', fr: 'noir', de: 'schwarz' },
  'filho': { en: 'son', es: 'hijo', fr: 'fils', de: 'Sohn' },
  'casa': { en: 'house', es: 'casa', fr: 'maison', de: 'Haus' },
  'mulher': { en: 'woman', es: 'mujer', fr: 'femme', de: 'Frau' },
  'homem': { en: 'man', es: 'hombre', fr: 'homme', de: 'Mann' },
  'gato': { en: 'cat', es: 'gato', fr: 'chat', de: 'Katze' },
  'coração': { en: 'heart', es: 'corazón', fr: 'coeur', de: 'Herz' },
};

// Gera dicionário limpo
const entries = {};
const seen = new Set();
let count = 0;

for (const [key, ptVal] of Object.entries(pt)) {
  const v = String(ptVal).trim();
  if (v.length < 2 || seen.has(v)) continue;
  seen.add(v);

  const entry = { pt: v };

  // Aplica fixes manuais se existem
  if (MANUAL_FIXES[v]) {
    for (const lang of LANGS) {
      entry[lang] = MANUAL_FIXES[v][lang] || '';
    }
  } else {
    for (const lang of LANGS) {
      entry[lang] = dicts[lang][v] || '';
    }
  }

  // Só inclui se tem EN
  if (entry.en && entry.en.length > 0) {
    entries[v] = entry;
    count++;
  }
}

console.log(`Termos: ${count}`);

// Gera arquivo TS
let ts = '// src/core/big-dict.ts\n';
ts += `// ${count} termos word-to-word limpos\n`;
ts += `// PT → 29 idiomas (auto-gerado)\n\n`;

ts += 'export const BIG_DICT: Record<string, Record<string, string>> = {\n';
for (const [ptWord, langs] of Object.entries(entries)) {
  const obj = {};
  for (const lang of LANGS) {
    if (langs[lang]) obj[lang] = langs[lang];
  }
  ts += JSON.stringify(ptWord) + ':' + JSON.stringify(obj) + ',\n';
}
ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/big-dict.ts'), ts, 'utf8');
console.log(`Gerado: ${count} termos × ${LANGS.length} idiomas`);
console.log(`Linhas: ${ts.split('\n').length}`);

// Verifica cobertura das palavras que faltavam
const missing = ['governo','presidente','mercado','inflação','empresa','pesquisa','universidade','computador','software','internet','aplicativo','sensores','notícia','médico','advogado','professor','estudante'];
console.log('\nCobertura das palavras que faltavam:');
missing.forEach(w => {
  const re = new RegExp('"' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"');
  console.log(`  ${w}: ${re.test(ts) ? '✓' : '✗'}`);
});
