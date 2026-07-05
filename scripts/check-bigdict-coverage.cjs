// scripts/check-bigdict-coverage.cjs
const f = require('fs').readFileSync('src/core/big-dict.ts', 'utf8');
const words = ['governo','presidente','mercado','inflação','empresa','pesquisa','universidade','computador','software','internet','aplicativo','sensores','notícia','trabalho','escola','mulher','homem','médico','advogado','professor','estudante','polícia','exército','imposto','economia','política','cultura','história','geografia','ciência','tecnologia','arte','música','filme','livro','jornal','revista','rádio','televisão','computador','celular','carro','ônibus','avião','trem','navio','bicicleta','hospital','clínica','farmácia','banco','loja','mercado','feira'];

console.log('Palavras no big-dict:', f.split('\n').filter(l => l.includes('":')).length);
console.log('\nCobertura das palavras de teste:');

let found = 0;
let missing = 0;
const missingList = [];

words.forEach(w => {
  const re = new RegExp('"' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"');
  if (re.test(f)) {
    found++;
  } else {
    missing++;
    missingList.push(w);
  }
});

console.log(`  Encontradas: ${found}/${words.length}`);
console.log(`  Faltando: ${missing}/${words.length}`);
if (missingList.length > 0) {
  console.log(`  Faltam: ${missingList.join(', ')}`);
}
