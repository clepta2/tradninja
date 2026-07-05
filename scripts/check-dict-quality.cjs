// scripts/check-dict-quality.cjs
const fs = require('fs');
const en = fs.readFileSync('src/dictionaries/dictionaryen.ts', 'utf8');

const samples = ['gato', 'preto', 'casa', 'nova', 'médico', 'professor', 'chuva', 'forte', 'meu', 'filho', 'mulher', 'homem', 'comer', 'beber', 'correr', 'treinar', 'bom', 'grande', 'pequeno'];

console.log('=== Qualidade do dicionário EN ===\n');
console.log('PT       → EN (contextual do dict)');
console.log('─'.repeat(45));

samples.forEach(w => {
  const re = new RegExp("'" + w + "':\\s*\\{\\s*en:\\s*'([^']+)'");
  const m = en.match(re);
  const val = m ? m[1] : '???';
  console.log(w.padEnd(12) + ' → ' + val);
});

console.log('\n=== Problemas encontrados ===');
console.log('gato   → "man" (deveria ser "cat")');
console.log('preto  → "nigger" (contexto ruim do dataset)');
console.log('mulher → "woman" (correto para contexto)');
console.log('filho  → "bitch" (contexto ruim do dataset)');
console.log('');
console.log('CONCLUSÃO: O dicionário tem traduções CONTEXTUAIS');
console.log('baseadas em texto real, não word-to-word.');
console.log('Para word-by-word, precisamos de um dicionário LIMPO.');
