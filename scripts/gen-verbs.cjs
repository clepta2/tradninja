// scripts/gen-verbs.cjs
// Gera verbs-data.ts com UTF-8 correto — 200 verbos × 31 idiomas
const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const LANGS = ['en','es','fr','de','it','ja','ko','zh','ar','ru','hi','nl','pl','sv','da','no','fi','cs','el','hu','ro','uk','id','ms','th','tr','he','bn','sw'];

const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));

function loadDict(lang) {
  try {
    const content = fs.readFileSync(path.join(DICT_DIR, `dictionary${lang}.ts`), 'utf8');
    const map = {};
    const re = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
    let m;
    while ((m = re.exec(content)) !== null) map[m[1]] = m[2];
    return map;
  } catch { return {}; }
}

const dicts = {};
for (const lang of LANGS) dicts[lang] = loadDict(lang);

const seen = new Set();
const skip = new Set(['onde','antes','depois','entre','sobre','contra','desde','ate','mais','menos','perto','longe','durante','segundo','apesar','ainda','assim','talvez','quando','enquanto','porque','portanto','tambem','mesmo','outro','outra','muito','pouco','tudo','nada','alguem','ninguem','cada','mulher','quer','sair']);

const verbs = [];
for (const [key, ptVal] of Object.entries(pt)) {
  const v = String(ptVal).trim();
  const lower = v.toLowerCase();
  if (v.length >= 4 && (lower.endsWith('ar') || lower.endsWith('er') || lower.endsWith('ir'))
      && !seen.has(lower) && !skip.has(lower)) {
    seen.add(lower);
    const entry = { pt: lower };
    for (const lang of LANGS) {
      entry[lang] = dicts[lang][lower] || dicts[lang][v] || '';
    }
    if (entry.en && entry.en.length > 1) verbs.push(entry);
  }
}

const top = verbs.slice(0, 200);

// Gera usando JSON.stringify que preserva UTF-8
let ts = '// src/core/verbs-data.ts\n';
ts += '// ' + top.length + ' verbos — auto-gerados do dicionario 25k\n';
ts += '// PT -> 31 idiomas (infinitivos)\n\n';
ts += 'export const LANGUAGES = ' + JSON.stringify(LANGS) + ' as const;\n';
ts += 'export type VerbLang = typeof LANGUAGES[number];\n';
ts += 'export const VERBS: Record<string, Record<string, string>> = {\n';

for (const v of top) {
  const obj = {};
  for (const lang of LANGS) {
    if (v[lang]) obj[lang] = v[lang];
  }
  ts += JSON.stringify(v.pt) + ': ' + JSON.stringify(obj) + ',\n';
}

ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/verbs-data.ts'), ts, 'utf8');
console.log('Gerado: ' + top.length + ' verbos x ' + LANGS.length + ' idiomas');
console.log('Primeiros 3:');
top.slice(0, 3).forEach(v => {
  const n = LANGS.filter(l => v[l]).length;
  console.log('  ' + v.pt + ' -> ' + n + ' idiomas (en=' + v.en + ', ja=' + v.ja + ', ar=' + v.ar + ')');
});
