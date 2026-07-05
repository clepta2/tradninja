// scripts/test-clean-pipeline.cjs
const fs = require('fs');
const path = require('path');

// Dicionário EN
const enDict = {};
try {
  const c = fs.readFileSync('src/dictionaries/dictionaryen.ts', 'utf8');
  const re = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
  let m; while ((m = re.exec(c)) !== null) enDict[m[1]] = m[2];
} catch {}

// PT dictionary
const ptDict = {};
try {
  const pt = JSON.parse(fs.readFileSync('src/i18n/pt.json', 'utf8'));
  for (const [k, v] of Object.entries(pt)) ptDict[String(v)] = k;
} catch {}

// Overrides limpos
const OVERRIDES = {
  'preto': { en: 'black' }, 'filho': { en: 'son' }, 'casa': { en: 'house' },
  'mulher': { en: 'woman' }, 'homem': { en: 'man' }, 'criança': { en: 'child' },
  'água': { en: 'water' }, 'comida': { en: 'food' }, 'dinheiro': { en: 'money' },
  'carne': { en: 'meat' }, 'fruta': { en: 'fruit' }, 'pão': { en: 'bread' },
  'leite': { en: 'milk' }, 'ovo': { en: 'egg' }, 'queijo': { en: 'cheese' },
  'frango': { en: 'chicken' }, 'peixe': { en: 'fish' }, 'café': { en: 'coffee' },
  'vinho': { en: 'wine' }, 'cerveja': { en: 'beer' }, 'porta': { en: 'door' },
  'mesa': { en: 'table' }, 'cadeira': { en: 'chair' }, 'cama': { en: 'bed' },
  'carro': { en: 'car' }, 'rua': { en: 'street' }, 'sapato': { en: 'shoe' },
  'camisa': { en: 'shirt' }, 'livro': { en: 'book' }, 'vida': { en: 'life' },
  'trabalho': { en: 'work' }, 'escola': { en: 'school' }, 'tempo': { en: 'time' },
  'olho': { en: 'eye' }, 'mão': { en: 'hand' }, 'cérebro': { en: 'brain' },
  'sangue': { en: 'blood' }, 'osso': { en: 'bone' }, 'músculo': { en: 'muscle' },
  'sol': { en: 'sun' }, 'lua': { en: 'moon' }, 'vento': { en: 'wind' },
  'chuva': { en: 'rain' }, 'neve': { en: 'snow' }, 'pedra': { en: 'stone' },
  'fogo': { en: 'fire' }, 'terra': { en: 'earth' }, 'pedra': { en: 'rock' },
  'carne': { en: 'meat' }, 'fruta': { en: 'fruit' }, 'legume': { en: 'vegetable' },
  'sal': { en: 'salt' }, 'açúcar': { en: 'sugar' }, 'arroz': { en: 'rice' },
  'feijão': { en: 'beans' }, 'frango': { en: 'chicken' }, 'peixe': { en: 'fish' },
  'café': { en: 'coffee' }, 'vinho': { en: 'wine' }, 'cerveja': { en: 'beer' },
};

function lookupClean(word, target) {
  const lower = word.toLowerCase();
  // 1. Override limpo
  if (OVERRIDES[lower] && OVERRIDES[lower][target]) return OVERRIDES[lower][target];
  // 2. Dicionário EN
  if (target === 'en' && enDict[lower]) return enDict[lower];
  return null;
}

const testPhrases = [
  'O gato preto sentou no sofá',
  'Ela correu muito rápido hoje',
  'Nós compramos uma casa nova ontem',
  'O médico examinou o paciente',
  'Meu filho gosta de jogar futebol',
  'A chuva forte caiu a noite toda',
  'Eu como uma maçã',
  'Nós treinamos todos os dias',
  'Ela comeu uma salada saudável',
  'O professor explicou a matéria',
];

console.log('=== Pipeline com dicionário LIMPO ===\n');

testPhrases.forEach(phrase => {
  const words = phrase.split(/\s+/);
  const translated = words.map(w => {
    const clean = lookupClean(w, 'en');
    if (clean) return clean;
    // Fallback: mantém original
    return '(' + w.toLowerCase() + ')';
  });

  const matched = translated.filter(t => !t.startsWith('(')).length;
  const confidence = (matched / words.length * 100).toFixed(0);

  console.log('confiança: ' + confidence + '%');
  console.log('  PT: ' + phrase);
  console.log('  EN: ' + translated.join(' '));
  console.log('  Match: ' + matched + '/' + words.length);
  console.log('');
});
