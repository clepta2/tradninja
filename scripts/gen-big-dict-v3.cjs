// scripts/gen-big-dict-v3.cjs
// Gera big-dict OTIMIZADO — só PT→EN (mais usado)
// Compatto: 1 arquivo TS com ~2000 termos essenciais

const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));

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

const dicts = {};
['en','es','fr','de','it'].forEach(l => dicts[l] = loadDict(l));

// Pega todas as palavras do PT que têm tradução EN limpa
const seen = new Set();
const entries = [];

for (const [key, ptVal] of Object.entries(pt)) {
  const v = String(ptVal).trim();
  if (v.length < 2 || seen.has(v)) continue;
  seen.add(v);

  const en = dicts.en[v];
  if (!en) continue;

  // Filtra só traduções de 1-2 palavras (limpas)
  const words = en.split(' ');
  if (words.length > 2) continue;

  const entry = {};
  for (const lang of ['en','es','fr','de','it']) {
    entry[lang] = dicts[lang][v] || '';
  }
  entries.push({ pt: v, ...entry });
}

console.log(`Termos limpos (1-2 palavras EN): ${entries.length}`);

// Gera TS compacto
let ts = '// src/core/big-dict.ts\n';
ts += `// ${entries.length} termos word-to-word (PT→5 idiomas)\n`;
ts += `// Auto-gerado: só traduções de 1-2 palavras (qualidade alta)\n\n`;
ts += 'export const BIG_DICT: Record<string, Record<string, string>> = {\n';
for (const e of entries) {
  const obj = {};
  for (const lang of ['en','es','fr','de','it']) {
    if (e[lang]) obj[lang] = e[lang];
  }
  ts += JSON.stringify(e.pt) + ':' + JSON.stringify(obj) + ',\n';
}
ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/big-dict.ts'), ts, 'utf8');
console.log(`Gerado: ${entries.length} termos`);
console.log(`Linhas: ${ts.split('\n').length}`);

// Verifica cobertura
const testWords = ['governo','presidente','mercado','inflação','empresa','pesquisa','universidade','computador','software','internet','aplicativo','sensores','notícia','médico','advogado','professor','estudante','exército','imposto','economia','política','cultura','história','ciência','tecnologia','arte','música','filme','livro','jornal','revista','rádio','televisão','celular','ônibus','avião','trem','navio','bicicleta','hospital','clínica','farmácia','banco','loja','mercado','feira'];
let found = 0;
testWords.forEach(w => {
  const re = new RegExp('"' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"');
  if (re.test(ts)) found++;
});
console.log(`\nCobertura: ${found}/${testWords.length} (${(found/testWords.length*100).toFixed(0)}%)`);
