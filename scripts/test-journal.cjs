// scripts/test-journal.cjs
// Testa com parágrafo REAL de jornal

// Overrides + frases + big dict (via require do clean-dict)
let CLEAN = {};
let PHRASES = {};
try {
  // Extrai overrides do TS
  const fs = require('fs');
  const c = fs.readFileSync('src/core/clean-dict.ts', 'utf8');
  
  // Overrides simples: 'pt': { en: 'X', ... }
  const overRe = /'([^']+)':\s*\{\s*en:\s*'([^']+)'/g;
  let m;
  while ((m = overRe.exec(c)) !== null) CLEAN[m[1]] = m[2];
  
  // Frases: 'pt pt': { en: 'X Y', ... }
  const phraseRe = /'([^']+\s[^']+)':\s*\{\s*en:\s*'([^']+)'/g;
  while ((m = phraseRe.exec(c)) !== null) PHRASES[m[1]] = m[2];
} catch(e) { console.log('Erro:', e.message); }

// Dicionário EN
const EN = {};
try {
  const fs = require('fs');
  const c = fs.readFileSync('src/dictionaries/dictionaryen.ts', 'utf8');
  const re = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
  let m;
  while ((m = re.exec(c)) !== null) EN[m[1]] = m[2];
} catch {}

console.log('Overrides:', Object.keys(CLEAN).length);
console.log('Frases:', Object.keys(PHRASES).length);
console.log('Dict EN:', Object.keys(EN).length);

// Pipeline completo
function translate(text) {
  const words = text.split(/\s+/);
  return words.map(w => {
    const lower = w.toLowerCase().replace(/[.,!?;:]/g, '');
    const punct = w.slice(-1).match(/[.,!?;:]/) ? w.slice(-1) : '';
    
    // 1. Frase completa
    const phrase = PHRASES[lower];
    if (phrase) return phrase + punct;
    
    // 2. Override limpo
    if (CLEAN[lower]) return CLEAN[lower] + punct;
    
    // 3. Dicionário EN (pode ter erros contextuais)
    if (EN[lower]) return EN[lower] + punct;
    
    return '(' + lower + ')';
  }).join(' ');
}

// Parágrafo real de jornal
const journal = `O governo federal anunciou na segunda-feira novas medidas econômicas para conter a inflação que atingiu 5,8% nos últimos doze meses. O presidente da República discursou em cadeia nacional sobre a situação financeira do país e prometeu ajustes nos impostos. Economistas avaliam que as mudanças podem afetar o poder de compra da população nos próximos trimestres. A oposição criticou as propostas, afirmando que não resolverão os problemas estruturais da economia brasileira.`;

console.log('\n=== TRADUÇÃO DE JORNAL ===\n');
console.log('PT:', journal);
console.log('');

const sentences = journal.split(/\.\s+/);
let totalWords = 0;
let translatedWords = 0;

sentences.forEach((sentence, i) => {
  const result = translate(sentence);
  const words = result.split(/\s+/);
  const matched = words.filter(w => !w.startsWith('(')).length;
  const unknown = words.filter(w => w.startsWith('('));
  
  totalWords += words.length;
  translatedWords += matched;
  
  console.log(`[${i+1}] (${(matched/words.length*100).toFixed(0)}%) ${sentence.trim()}`);
  console.log(`    → ${result}`);
  if (unknown.length > 0) console.log(`    ❌ Faltam: ${unknown.map(w => w.replace(/[()]/g, '')).join(', ')}`);
  console.log('');
});

console.log('=== RESUMO ===');
console.log(`Palavras: ${translatedWords}/${totalWords} (${(translatedWords/totalWords*100).toFixed(1)}%)`);
console.log(`Frases: ${sentences.length}`);
