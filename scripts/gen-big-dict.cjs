// scripts/gen-big-dict.cjs
// Gera overrides massivos a partir dos 25k termos
// Cruza PT com todos os idiomas, filtra por qualidade

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

// Carrega todos os dicts
const dicts = {};
for (const lang of LANGS) dicts[lang] = loadDict(lang);

// PT dictionary
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));

// Filtra: só termos com tradução EN de 1 palavra
const cleanEntries = {};
let count = 0;

for (const [key, ptVal] of Object.entries(pt)) {
  if (count >= 500) break; // Top 500 termos mais usados
  const v = String(ptVal).trim();
  if (v.length < 2) continue;
  
  const en = dicts.en[v];
  if (!en || en.length < 1) continue;
  
  // Filtra traduções contextuais óbvias
  if (en.includes(' ') && en.split(' ').length > 2) continue; // Frases longas são contextuais
  if (/^(the|a|an|is|are|was|were|have|has|had|do|does|did|will|would|could|should|can|may|must)$/i.test(en)) {
    // Esses são artigos/auxiliares — ok manter
  }
  
  const entry = { pt: v };
  for (const lang of LANGS) {
    entry[lang] = dicts[lang][v] || '';
  }
  
  cleanEntries[v] = entry;
  count++;
}

console.log(`Termos limpos: ${count}`);

// Gera arquivo TS compacto
let ts = '// src/core/big-dict.ts\n';
ts += `// ${count} termos limpos word-to-word\n`;
ts += `// Gerado automaticamente a partir dos 25k termos\n\n`;

ts += 'export const BIG_DICT: Record<string, Record<string, string>> = {\n';
for (const [ptWord, langs] of Object.entries(cleanEntries)) {
  const obj = {};
  for (const lang of LANGS) {
    if (langs[lang]) obj[lang] = langs[lang];
  }
  ts += JSON.stringify(ptWord) + ':' + JSON.stringify(obj) + ',\n';
}
ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/big-dict.ts'), ts, 'utf8');
console.log(`Gerado big-dict.ts com ${count} termos × ${LANGS.length} idiomas`);
console.log(`Arquivo: ${ts.split('\n').length} linhas`);
