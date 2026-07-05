// scripts/test-numbers.cjs
// Testa tradução numérica com textos reais

const fs = require('fs');

// Overrides + dicionário EN
const OVR = {};
const EN = {};
try {
  const c = fs.readFileSync('src/core/clean-dict.ts', 'utf8');
  const re = /'([^']+)':\s*\{\s*en:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(c)) !== null) OVR[m[1]] = m[2];
  const ec = fs.readFileSync('src/dictionaries/dictionaryen.ts', 'utf8');
  const er = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
  while ((m = er.exec(ec)) !== null) EN[m[1]] = m[2];
} catch {}

// VERBS
const VERBS = {};
const vd = fs.readFileSync('src/core/verbs-data.ts', 'utf8');
const vr = /"([^"]+)":\s*\{\s*"en":\s*"([^"]+)"/g;
let vm;
while ((vm = vr.exec(vd)) !== null) VERBS[vm[1]] = vm[2];

function translate(text) {
  // Preserva números com vírgula/ponto como tokens únicos
  const numMap = {};
  let numIdx = 0;
  const cleaned = text.replace(/\d+(?:[.,]\d+)?%?(?:°[CFc]|mm|km\/h)?/g, match => {
    const key = `N${numIdx++}`;
    numMap[key] = match;
    return key;
  });

  return cleaned.split(/\s+/).map(w => {
    const lower = w.toLowerCase().replace(/[.,!?;:]/g, '');
    const punct = w.slice(-1).match(/[.,!?;:]/) ? w.slice(-1) : '';

    if (numMap[w]) return numMap[w] + punct;
    if (/^\d+$/.test(lower)) return lower + punct;
    if (OVR[lower]) return OVR[lower] + punct;
    if (EN[lower]) return EN[lower] + punct;
    if (VERBS[lower]) return VERBS[lower] + punct;
    for (const [verb, form] of Object.entries(VERBS)) {
      if (lower === verb) return form + punct;
    }
    return '(' + lower + ')';
  }).join(' ');
}

// Textos reais com números
const testTexts = [
  {
    name: 'Notícia econômica',
    text: 'O PIB brasileiro cresceu 2,8% no último trimestre. A inflação atingiu 4,5% ao ano. O dólar cotou a R$ 5,23. A taxa Selic está em 10,75% ao ano. O déficit público foi de R$ 150 bilhões.',
    expected: ['2,8%', '4,5%', '5,23', '10,75%', '150'],
  },
  {
    name: 'Resultados esportivos',
    text: 'O Brasil venceu por 3 a 1 naeliminatória. Neymar marcou 2 gols no primeiro tempo. O placar ficou 3-1 no final. O jogo durou 90 minutos.',
    expected: ['3', '1', '2', '3-1', '90'],
  },
  {
    name: 'Relatório financeiro',
    text: 'A empresa teve receita de R$ 4,2 bilhões no Q3. O lucro líquido foi de R$ 890 milhões. A margem de lucro foi de 21,2%. O ROI foi de 15,8%.',
    expected: ['4,2', '890', '21,2%', '15,8%'],
  },
  {
    name: 'Tempo/meteorologia',
    text: 'A temperatura máxima foi de 32,5°C e a mínima de 18°C. Chuva de 15mm. Umidade relativa: 78%. Velocidade do vento: 25 km/h.',
    expected: ['32,5°C', '18°C', '15mm', '78%', '25'],
  },
  {
    name: 'Estatísticas',
    text: 'O Brasil tem 214 milhões de habitantes. A taxa de desemprego é de 7,8%. A expectativa de vida é de 76,5 anos. O IDH é 0,754.',
    expected: ['214', '7,8%', '76,5', '0,754'],
  },
  {
    name: 'Texto misto (números + texto)',
    text: 'Em 2024, o governo investiu R$ 3,5 bilhões em educação. A taxa de aprovação foi de 62%. 15 milhões de alunos foram beneficiados. O orçamento de 2025 é R$ 4,1 bilhões.',
    expected: ['2024', '3,5', '62%', '15', '2025', '4,1'],
  },
];

let totalNums = 0;
let passedNums = 0;

console.log('=== TESTE DE TRADUÇÃO NUMÉRICA ===\n');

testTexts.forEach(({ name, text, expected }) => {
  const result = translate(text);
  
  let found = 0;
  expected.forEach(num => {
    if (result.includes(num)) found++;
    else console.log(`  ❌ "${num}" não encontrado`);
  });

  totalNums += expected.length;
  passedNums += found;

  const status = found === expected.length ? '✓' : '✗';
  console.log(`${status} ${name}`);
  console.log(`  PT: ${text}`);
  console.log(`  EN: ${result}`);
  console.log(`  Números: ${found}/${expected.length}`);
  console.log('');
});

console.log('=== RESUMO ===');
console.log(`Números preservados: ${passedNums}/${totalNums} (${(passedNums/totalNums*100).toFixed(1)}%)`);
console.log(`Textos: ${testTexts.length}`);
