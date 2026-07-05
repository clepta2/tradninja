// scripts/test-pipeline.cjs
// Testa o pipeline cascata com frases que NÃO estão no dicionário
// Node -e não funciona com ESM, então usamos .cjs

const fs = require('fs');
const path = require('path');

// Carrega dicionário
const enDict = {};
try {
  const content = fs.readFileSync('src/dictionaries/dictionaryen.ts', 'utf8');
  const re = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
  let m;
  while ((m = re.exec(content)) !== null) enDict[m[1]] = m[2];
} catch(e) { console.log('Erro ao carregar dict EN:', e.message); }

// Carrega verbos
let VERBS = {};
try {
  // Lê o arquivo verbs-data.ts como texto e extrai
  const vd = fs.readFileSync('src/core/verbs-data.ts', 'utf8');
  // Extrai pares PT→EN do JSON gerado
  const re = /"([^"]+)":\s*\{[^}]*"en":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(vd)) !== null) VERBS[m[1]] = m[2];
} catch(e) { console.log('Erro ao carregar verbos:', e.message); }

// Carrega PT dictionary
const ptDict = {};
try {
  const pt = JSON.parse(fs.readFileSync('src/i18n/pt.json', 'utf8'));
  for (const [k, v] of Object.entries(pt)) ptDict[String(v)] = k;
} catch(e) { console.log('Erro ao carregar dict PT:', e.message); }

console.log('=== Teste Pipeline: frases FORA do dicionário ===');
console.log('Dicionário EN:', Object.keys(enDict).length, 'termos');
console.log('Verbos:', Object.keys(VERBS).length);
console.log('Dicionário PT:', Object.keys(ptDict).length, 'termos\n');

// ── Stopwords PT ──────────────────────────────────────────
const PT_STOP = new Set(['eu','tu','ele','ela','nos','eles','elas','o','a','os','as','um','uma','uns','umas','é','são','está','estão','ser','estar','ter','fazer','ir','vir','dar','poder','querer','de','do','da','em','para','por','com','sem','sobre','entre','e','ou','não','mas','que','como','se','meu','minha','seu','sua','muito','pouco','todo','nada','algo','outro','esta','este','isso']);

// ── Stopwords EN ──────────────────────────────────────────
const EN_STOP = new Set(['i','you','he','she','it','we','they','the','a','an','is','are','was','were','have','has','had','do','does','did','will','would','could','should','can','may','might','must','to','of','in','for','on','with','at','by','from','as','into','and','but','or','not','no','so','if','then','than','that','this','my','your','his','her','its','our','their']);

// ── Regras gramaticais PT→EN ──────────────────────────────
const ARTICLES = { 'o':'the', 'a':'the', 'um':'a', 'uma':'a', 'os':'the', 'as':'the' };
const PREPOSITIONS = { 'de':'of', 'em':'in', 'para':'for', 'com':'with', 'sem':'without', 'por':'by', 'sobre':'about', 'entre':'between' };
const POSSESSIVES = { 'meu':'my', 'minha':'my', 'seu':'your', 'sua':'your', 'nosso':'our', 'nossa':'our' };

// ── Testa pipeline manual ──────────────────────────────────
const testPhrases = [
  'O gato preto sentou no sofá',
  'Ela correu muito rápido hoje',
  'Nós compramos uma casa nova ontem',
  'O médico examinou o paciente',
  'Eles viajaram para o Japão no verão',
  'A chuva forte caiu a noite toda',
  'Meu filho gosta de jogar futebol',
  'O professor explicou a matéria',
  'Nós treinamos todos os dias',
  'Ela comeu uma salada saudável',
];

testPhrases.forEach(phrase => {
  // Verifica se está no dicionário
  const inDict = enDict[phrase] || ptDict[phrase];
  const status = inDict ? 'NO_DICT' : 'UNKNOWN';

  // Pipeline manual
  const words = phrase.split(/\s+/);
  const translated = words.map(word => {
    const lower = word.toLowerCase();
    // 1. Dicionário direto
    if (enDict[lower]) return enDict[lower];
    // 2. Artigos
    if (ARTICLES[lower]) return ARTICLES[lower];
    // 3. Preposições
    if (PREPOSITIONS[lower]) return PREPOSITIONS[lower];
    // 4. Possessivos
    if (POSSESSIVES[lower]) return POSSESSIVES[lower];
    // 5. Verbos (stem match)
    for (const [verb, en] of Object.entries(VERBS)) {
      if (lower === verb || lower === verb + 'u' || lower === verb + 'i' ||
          lower === verb + 'o' || lower === verb + 'e' || lower === verb + 'a') {
        return en;
      }
    }
    // 6. Não encontrado
    return '(' + lower + ')';
  });

  const result = translated.join(' ');
  const matched = translated.filter(t => !t.startsWith('(')).length;
  const confidence = (matched / words.length * 100).toFixed(0);

  console.log(status + ' | confiança: ' + confidence + '%');
  console.log('  PT: ' + phrase);
  console.log('  EN: ' + result);
  console.log('  Palavras traduzidas: ' + matched + '/' + words.length);
  console.log('');
});
