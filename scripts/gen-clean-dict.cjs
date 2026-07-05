// scripts/gen-clean-dict.cjs
// Gera dicionário limpo word-to-word a partir dos 25k termos contextuais
// Estratégia: usa PT como chave canônica, cruza com todos os idiomas

const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const LANGS = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru', 'hi',
  'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'el', 'hu', 'ro', 'uk', 'id',
  'ms', 'th', 'tr', 'he', 'bn', 'sw'];

// Lista de palavras PT que têm traduções contextuais ERRADAS no dicionário
// Essas serão sobrescritas com traduções word-to-word corretas
const OVERRIDES = {
  'preto':    { en: 'black', es: 'negro', fr: 'noir', de: 'schwarz' },
  'filho':    { en: 'son', es: 'hijo', fr: 'fils', de: 'Sohn' },
  'casa':     { en: 'house', es: 'casa', fr: 'maison', de: 'Haus' },
  'mulher':   { en: 'woman', es: 'mujer', fr: 'femme', de: 'Frau' },
  'homem':    { en: 'man', es: 'hombre', fr: 'homme', de: 'Mann' },
  'criança':  { en: 'child', es: 'niño', fr: 'enfant', de: 'Kind' },
  'velho':    { en: 'old', es: 'viejo', fr: 'vieux', de: 'alt' },
  'jovem':    { en: 'young', es: 'joven', fr: 'jeune', de: 'jung' },
  'água':     { en: 'water', es: 'agua', fr: 'eau', de: 'Wasser' },
  'comida':   { en: 'food', es: 'comida', fr: 'nourriture', de: 'Essen' },
  'dinheiro': { en: 'money', es: 'dinero', fr: 'argent', de: 'Geld' },
  'tempo':    { en: 'time', es: 'tiempo', fr: 'temps', de: 'Zeit' },
  'lugar':    { en: 'place', es: 'lugar', fr: 'lieu', de: 'Ort' },
  'vida':     { en: 'life', es: 'vida', fr: 'vie', de: 'Leben' },
  'morte':    { en: 'death', es: 'muerte', fr: 'mort', de: 'Tod' },
  'amor':     { en: 'love', es: 'amor', fr: 'amour', de: 'Liebe' },
  'trabalho': { en: 'work', es: 'trabajo', fr: 'travail', de: 'Arbeit' },
  'escola':   { en: 'school', es: 'escuela', fr: 'école', de: 'Schule' },
  'livro':    { en: 'book', es: 'libro', fr: 'livre', de: 'Buch' },
  'mão':      { en: 'hand', es: 'mano', fr: 'main', de: 'Hand' },
  'olho':     { en: 'eye', es: 'ojo', fr: 'œil', de: 'Auge' },
  'coração':  { en: 'heart', es: 'corazón', fr: 'coeur', de: 'Herz' },
  'cérebro':  { en: 'brain', es: 'cerebro', fr: 'cerveau', de: 'Gehirn' },
  'músculo':  { en: 'muscle', es: 'músculo', fr: 'muscle', de: 'Muskel' },
  'osso':     { en: 'bone', es: 'hueso', fr: 'os', de: 'Knochen' },
  'sangue':   { en: 'blood', es: 'sangre', fr: 'sang', de: 'Blut' },
  'carne':    { en: 'meat', es: 'carne', fr: 'viande', de: 'Fleisch' },
  'fruta':    { en: 'fruit', es: 'fruta', fr: 'fruit', de: 'Obst' },
  'legume':   { en: 'vegetable', es: 'vegetal', fr: 'légume', de: 'Gemüse' },
  'pão':      { en: 'bread', es: 'pan', fr: 'pain', de: 'Brot' },
  'leite':    { en: 'milk', es: 'leche', fr: 'lait', de: 'Milch' },
  'ovo':      { en: 'egg', es: 'huevo', fr: 'œuf', de: 'Ei' },
  'arroz':    { en: 'rice', es: 'arroz', fr: 'riz', de: 'Reis' },
  'feijão':   { en: 'beans', es: 'frijoles', fr: 'haricots', de: 'Bohnen' },
  'queijo':   { en: 'cheese', es: 'queso', fr: 'fromage', de: 'Käse' },
  'frango':   { en: 'chicken', es: 'pollo', fr: 'poulet', de: 'Hähnchen' },
  'peixe':    { en: 'fish', es: 'pescado', fr: 'poisson', de: 'Fisch' },
  'sal':      { en: 'salt', es: 'sal', fr: 'sel', de: 'Salz' },
  'açúcar':   { en: 'sugar', es: 'azúcar', fr: 'sucre', de: 'Zucker' },
  'azeite':   { en: 'olive oil', es: 'aceite', fr: 'huile d\'olive', de: 'Olivenöl' },
  'vinho':    { en: 'wine', es: 'vino', fr: 'vin', de: 'Wein' },
  'cerveja':  { en: 'beer', es: 'cerveza', fr: 'bière', de: 'Bier' },
  'café':     { en: 'coffee', es: 'café', fr: 'café', de: 'Kaffee' },
  'cha':      { en: 'tea', es: 'té', fr: 'thé', de: 'Tee' },
  'suco':     { en: 'juice', es: 'jugo', fr: 'jus', de: 'Saft' },
  'sapato':   { en: 'shoe', es: 'zapato', fr: 'chaussure', de: 'Schuh' },
  'camisa':   { en: 'shirt', es: 'camisa', fr: 'chemise', de: 'Hemd' },
  'calça':    { en: 'pants', es: 'pantalónes', fr: 'pantalon', de: 'Hose' },
  'chapéu':   { en: 'hat', es: 'sombrero', fr: 'chapeau', de: 'Hut' },
  'porta':    { en: 'door', es: 'puerta', fr: 'porte', de: 'Tür' },
  'janela':   { en: 'window', es: 'ventana', fr: 'fenêtre', de: 'Fenster' },
  'mesa':     { en: 'table', es: 'mesa', fr: 'table', de: 'Tisch' },
  'cadeira':  { en: 'chair', es: 'silla', fr: 'chaise', de: 'Stuhl' },
  'cama':     { en: 'bed', es: 'cama', fr: 'lit', de: 'Bett' },
  'carro':    { en: 'car', es: 'coche', fr: 'voiture', de: 'Auto' },
  'ônibus':   { en: 'bus', es: 'autobús', fr: 'bus', de: 'Bus' },
  'trem':     { en: 'train', es: 'tren', fr: 'train', de: 'Zug' },
  'avião':    { en: 'airplane', es: 'avión', fr: 'avion', de: 'Flugzeug' },
  'barco':    { en: 'boat', es: 'barco', fr: 'bateau', de: 'Boot' },
  'bicicleta':{ en: 'bicycle', es: 'bicicleta', fr: 'vélo', de: 'Fahrrad' },
  'rua':      { en: 'street', es: 'calle', fr: 'rue', de: 'Straße' },
  'praça':    { en: 'square', es: 'plaza', fr: 'place', de: 'Platz' },
  'parque':   { en: 'park', es: 'parque', fr: 'parc', de: 'Park' },
  'praia':    { en: 'beach', es: 'playa', fr: 'plage', de: 'Strand' },
  'montanha': { en: 'mountain', es: 'montaña', fr: 'montagne', de: 'Berg' },
  'rio':      { en: 'river', es: 'río', fr: 'rivière', de: 'Fluss' },
  'mar':      { en: 'sea', es: 'mar', fr: 'mer', de: 'Meer' },
  'sol':      { en: 'sun', es: 'sol', fr: 'soleil', de: 'Sonne' },
  'lua':      { en: 'moon', es: 'luna', fr: 'lune', de: 'Mond' },
  'estrela':  { en: 'star', es: 'estrella', fr: 'étoile', de: 'Stern' },
  'nuvem':    { en: 'cloud', es: 'nube', fr: 'nuage', de: 'Wolke' },
  'vento':    { en: 'wind', es: 'viento', fr: 'vent', de: 'Wind' },
  'chuva':    { en: 'rain', es: 'lluvia', fr: 'pluie', de: 'Regen' },
  'neve':     { en: 'snow', es: 'nieve', fr: 'neige', de: 'Schnee' },
  'trovão':   { en: 'thunder', es: 'trueno', fr: 'tonnerre', de: 'Donner' },
  'relâmpago':{ en: 'lightning', es: 'relámpago', fr: 'éclair', de: 'Blitz' },
  'arco-íris':{ en: 'rainbow', es: 'arcoíris', fr: 'arc-en-ciel', de: 'Regenbogen' },
  'fogo':     { en: 'fire', es: 'fuego', fr: 'feu', de: 'Feuer' },
  'terra':    { en: 'earth', es: 'tierra', fr: 'terre', de: 'Erde' },
  'pedra':    { en: 'stone', es: 'piedra', fr: 'pierre', de: 'Stein' },
  'madeira':  { en: 'wood', es: 'madera', fr: 'bois', de: 'Holz' },
  'ferro':    { en: 'iron', es: 'hierro', fr: 'fer', de: 'Eisen' },
  'ouro':     { en: 'gold', es: 'oro', fr: 'or', de: 'Gold' },
  'prata':    { en: 'silver', es: 'plata', fr: 'argent', de: 'Silber' },
  'cobre':    { en: 'copper', es: 'cobre', fr: 'cuivre', de: 'Kupfer' },
};

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
for (const lang of LANGS) {
  dicts[lang] = loadDict(lang);
  console.log(`${lang}: ${Object.keys(dicts[lang]).length} terms`);
}

// Carrega PT
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));

// ── Gera dicionário limpo ──────────────────────────────────
const cleanDict = {};
const seen = new Set();

for (const [key, ptVal] of Object.entries(pt)) {
  const v = String(ptVal).trim();
  if (v.length < 2 || seen.has(v)) continue;
  seen.add(v);

  const entry = { pt: v };

  // Aplica overrides se existem
  const overrides = OVERRIDES[v];
  if (overrides) {
    for (const lang of LANGS) {
      entry[lang] = overrides[lang] || '';
    }
  } else {
    // Usa dicionário original
    for (const lang of LANGS) {
      entry[lang] = dicts[lang][v] || '';
    }
  }

  // Só inclui se tem pelo menos 1 tradução
  const hasTranslation = LANGS.some(l => entry[l] && entry[l].length > 0);
  if (hasTranslation) {
    cleanDict[v] = entry;
  }
}

const totalTerms = Object.keys(cleanDict).length;
console.log(`\nDicionário limpo: ${totalTerms} termos`);

// ── Gera arquivo TS ────────────────────────────────────────
let ts = '// src/core/clean-dict.ts\n';
ts += `// Dicionário limpo word-to-word — ${totalTerms} termos × ${LANGS.length} idiomas\n`;
ts += `// Gerado a partir dos 25k termos contextuais + overrides corrigidos\n\n`;

ts += 'export const LANGUAGES = ' + JSON.stringify(LANGS) + ' as const;\n';
ts += 'export type CleanLang = typeof LANGUAGES[number];\n';
ts += `export const CLEAN_DICT: Record<string, Record<string, string>> = {\n`;

const entries = Object.entries(cleanDict);
for (const [ptWord, langs] of entries) {
  const obj = {};
  for (const lang of LANGS) {
    if (langs[lang]) obj[lang] = langs[lang];
  }
  ts += JSON.stringify(ptWord) + ': ' + JSON.stringify(obj) + ',\n';
}

ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/clean-dict.ts'), ts, 'utf8');

// ── Stats ──────────────────────────────────────────────────
console.log(`\nEstatísticas:`);
console.log(`  Termos PT: ${totalTerms}`);
console.log(`  Idiomas: ${LANGS.length}`);
console.log(`  Overrides aplicados: ${Object.keys(OVERRIDES).length}`);

// Verifica cobertura
const enCoverage = entries.filter(([, e]) => e.en).length;
const jaCoverage = entries.filter(([, e]) => e.ja).length;
const arCoverage = entries.filter(([, e]) => e.ar).length;
console.log(`  Cobertura EN: ${enCoverage}/${totalTerms} (${(enCoverage/totalTerms*100).toFixed(0)}%)`);
console.log(`  Cobertura JA: ${jaCoverage}/${totalTerms} (${(jaCoverage/totalTerms*100).toFixed(0)}%)`);
console.log(`  Cobertura AR: ${arCoverage}/${totalTerms} (${(arCoverage/totalTerms*100).toFixed(0)}%)`);

// Mostra exemplos limpos
console.log(`\nExemplos limpos:`);
['preto', 'casa', 'filho', 'mulher', 'gato', 'água', 'comida'].forEach(w => {
  const e = cleanDict[w];
  if (e) console.log(`  ${w} → en:${e.en} es:${e.es} ja:${e.ja}`);
});
