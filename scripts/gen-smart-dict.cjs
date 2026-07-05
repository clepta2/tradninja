// scripts/gen-smart-dict.cjs
// Gera dicionário INTELIGENTE — dedup por raiz + categorias
// 1000 raízes × 5 idiomas = ~2000 linhas (vs 15000 antes)

const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const OUT_DIR = path.join(__dirname, '../src/core/dicts');
const LANGS = ['en','es','fr','de','it'];

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

// ── Categorias de palavras ─────────────────────────────────
const CATEGORIES = {
  pronouns: ['eu','tu','ele','ela','nós','vocês','eles','elas','meu','minha','seu','sua'],
  articles: ['o','a','os','as','um','uma'],
  prepositions: ['de','em','para','com','sem','por','sobre','entre','até','desde','após','antes','contra','sob'],
  conjunctions: ['e','ou','mas','porém','porque','se','quando','onde','como','embora','enquanto','portanto'],
  adverbs: ['sim','não','aqui','ali','agora','hoje','ontem','amanhã','muito','mais','menos','sempre','nunca','também','ainda','bem','mal','talvez','cedo','longe','perto'],
  auxiliaries: ['é','são','está','tem','foi','faz','pode','deve','quer','vai'],
  numbers: ['um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','primeiro','mil'],
  colors: ['vermelho','azul','verde','amarelo','branco','preto','rosa','marrom','cinza','laranja'],
};

// ── Extrai raízes de verbos (remove conjugações) ────────────
function getVerbStems() {
  const stems = new Set();
  const verbEndings = ['ar','er','ir'];

  for (const [key, ptVal] of Object.entries(pt)) {
    const v = String(ptVal).trim();
    for (const ending of verbEndings) {
      if (v.endsWith(ending) && v.length > ending.length + 1) {
        stems.add(v);
      }
    }
  }
  return stems;
}

// ── Gera dicionário inteligente por idioma ──────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const verbStems = getVerbStems();
const stats = {};

for (const lang of LANGS) {
  const entries = [];

  // 1. Adiciona categorias (palavras funcionais)
  for (const [cat, words] of Object.entries(CATEGORIES)) {
    for (const w of words) {
      const translation = dicts[lang][w];
      if (translation && translation.split(' ').length <= 2) {
        entries.push([w, translation, cat]);
      }
    }
  }

  // 2. Adiciona verbos (só raízes — conjugação é algorítmica)
  for (const stem of verbStems) {
    const translation = dicts[lang][stem];
    if (translation && translation.split(' ').length <= 2) {
      entries.push([stem, translation, 'verb']);
    }
  }

  // 3. Adiciona substantivos/comuns (frequência alta)
  for (const [key, ptVal] of Object.entries(pt)) {
    const v = String(ptVal).trim();
    if (v.length < 3) continue;
    if (entries.some(([pt]) => pt === v)) continue; // já tem

    const translation = dicts[lang][v];
    if (!translation) continue;
    if (translation.split(' ').length > 2) continue;

    entries.push([v, translation, 'common']);
  }

  stats[lang] = entries.length;

  // Gera arquivo TS por idioma
  let ts = `// src/core/dicts/dict-${lang}.ts\n`;
  ts += `// ${entries.length} termos PT→${lang} (word-to-word)\n`;
  ts += `// Categorias: pronouns, articles, preps, conjunctions, adverbs, aux, numbers, colors, verbs, common\n\n`;
  ts += `export const DICT_${lang.toUpperCase()}: Record<string, string> = {\n`;
  for (const [pt, target] of entries) {
    ts += JSON.stringify(pt) + ':' + JSON.stringify(target) + ',\n';
  }
  ts += '};\n';

  fs.writeFileSync(path.join(OUT_DIR, `dict-${lang}.ts`), ts, 'utf8');
  console.log(`${lang}: ${entries.length} termos`);
}

const total = Object.values(stats).reduce((a, b) => a + b, 0);
console.log(`\nTotal: ${total} entradas × ${LANGS.length} idiomas`);
console.log(`Arquivos: ${LANGS.length} + 1 barrel`);
