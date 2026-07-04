// scripts/analyze.cjs
const f = require('fs').readFileSync('src/core/verbs-data.ts', 'utf8');
const verbCount = (f.match(/^\s+"[^"]+"/gm) || []).length;

const langs = ['en','es','fr','de','it','ja','ko','zh','ar','ru','hi','nl','pl','sv','da','no','fi','cs','el','hu','ro','uk','id','ms','th','tr','he','bn','sw'];
const lines = f.split('\n').filter(l => l.includes('":'));
const counts = {};
langs.forEach(l => counts[l] = 0);
lines.forEach(l => {
  langs.forEach(lang => {
    if (l.includes('"' + lang + '":"')) counts[lang]++;
  });
});

console.log('Verbos:', verbCount);
console.log('\nCobertura por idioma:');
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([l, c]) => console.log('  ' + l + ': ' + c + '/200'));

// Verifica tradução de exemplo
const fazerMatch = f.match(/"fazer":\s*\{([^}]+)\}/);
if (fazerMatch) console.log('\nExemplo fazer:', fazerMatch[1].substring(0, 150));
