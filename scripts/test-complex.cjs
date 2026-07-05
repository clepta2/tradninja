// scripts/test-complex.cjs
// Testa frases complexas com o pipeline real

const fs = require('fs');
const path = require('path');

// Carrega big-dict
let BIG_DICT = {};
try {
  const content = fs.readFileSync('src/core/big-dict.ts', 'utf8');
  const re = /"([^"]+)":\s*(\{[^}]+\})/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    try {
      BIG_DICT[m[1]] = JSON.parse(m[2]);
    } catch {}
  }
} catch {}

// Carrega clean-dict overrides
const OVR = {};
try {
  const content = fs.readFileSync('src/core/clean-dict.ts', 'utf8');
  // Extrai overrides simples
  const simpleRe = /'([^']+)':\s*\{\s*en:\s*'([^']+)'/g;
  let m;
  while ((m = simpleRe.exec(content)) !== null) OVR[m[1]] = m[2];
} catch {}

// Conjugação básica
const VERBS = {
  comer: { p1s: 'eat', p3s: 'eats', pt1s: 'ate', pt3s: 'ate' },
  beber: { p1s: 'drink', p3s: 'drinks', pt1s: 'drank', pt3s: 'drank' },
  correr: { p1s: 'run', p3s: 'runs', pt1s: 'ran', pt3s: 'ran' },
  treinar: { p1s: 'train', p3s: 'trains', pt1s: 'trained', pt3s: 'trained' },
  dormir: { p1s: 'sleep', p3s: 'sleeps', pt1s: 'slept', pt3s: 'slept' },
  falar: { p1s: 'speak', p3s: 'speaks', pt1s: 'spoke', pt3s: 'spoke' },
  pensar: { p1s: 'think', p3s: 'thinks', pt1s: 'thought', pt3s: 'thought' },
  estudar: { p1s: 'study', p3s: 'studies', pt1s: 'studied', pt3s: 'studied' },
  trabalhar: { p1s: 'work', p3s: 'works', pt1s: 'worked', pt3s: 'worked' },
  ajudar: { p1s: 'help', p3s: 'helps', pt1s: 'helped', pt3s: 'helped' },
  encontrar: { p1s: 'find', p3s: 'finds', pt1s: 'found', pt3s: 'found' },
  perder: { p1s: 'lose', p3s: 'loses', pt1s: 'lost', pt3s: 'lost' },
  ganhar: { p1s: 'win', p3s: 'wins', pt1s: 'won', pt3s: 'won' },
  fazer: { p1s: 'do', p3s: 'does', pt1s: 'did', pt3s: 'did' },
  ter: { p1s: 'have', p3s: 'has', pt1s: 'had', pt3s: 'had' },
  ser: { p1s: 'am', p3s: 'is', pt1s: 'was', pt3s: 'was' },
  estar: { p1s: 'am', p3s: 'is', pt1s: 'was', pt3s: 'was' },
  ir: { p1s: 'go', p3s: 'goes', pt1s: 'went', pt3s: 'went' },
  vir: { p1s: 'come', p3s: 'comes', pt1s: 'came', pt3s: 'came' },
  dar: { p1s: 'give', p3s: 'gives', pt1s: 'gave', pt3s: 'gave' },
  comprar: { p1s: 'buy', p3s: 'buys', pt1s: 'bought', pt3s: 'bought' },
  vender: { p1s: 'sell', p3s: 'sells', pt1s: 'sold', pt3s: 'sold' },
  pagar: { p1s: 'pay', p3s: 'pays', pt1s: 'paid', pt3s: 'paid' },
  enviar: { p1s: 'send', p3s: 'sends', pt1s: 'sent', pt3s: 'sent' },
  receber: { p1s: 'receive', p3s: 'receives', pt1s: 'received', pt3s: 'received' },
  salvar: { p1s: 'save', p3s: 'saves', pt1s: 'saved', pt3s: 'saved' },
  deletar: { p1s: 'delete', p3s: 'deletes', pt1s: 'deleted', pt3s: 'deleted' },
  editar: { p1s: 'edit', p3s: 'edits', pt1s: 'edited', pt3s: 'edited' },
  copiar: { p1s: 'copy', p3s: 'copies', pt1s: 'copied', pt3s: 'copied' },
  baixar: { p1s: 'download', p3s: 'downloads', pt1s: 'downloaded', pt3s: 'downloaded' },
  atualizar: { p1s: 'update', p3s: 'updates', pt1s: 'updated', pt3s: 'updated' },
  instalar: { p1s: 'install', p3s: 'installs', pt1s: 'installed', pt3s: 'installed' },
  remover: { p1s: 'remove', p3s: 'removes', pt1s: 'removed', pt3s: 'removed' },
  adicionar: { p1s: 'add', p3s: 'adds', pt1s: 'added', pt3s: 'added' },
  criar: { p1s: 'create', p3s: 'creates', pt1s: 'created', pt3s: 'created' },
  configurar: { p1s: 'configure', p3s: 'configures', pt1s: 'configured', pt3s: 'configured' },
  pesquisar: { p1s: 'research', p3s: 'researches', pt1s: 'researched', pt3s: 'researched' },
  observar: { p1s: 'observe', p3s: 'observes', pt1s: 'observed', pt3s: 'observed' },
  medir: { p1s: 'measure', p3s: 'measures', pt1s: 'measured', pt3s: 'measured' },
  calcular: { p1s: 'calculate', p3s: 'calculates', pt1s: 'calculated', pt3s: 'calculated' },
  comparar: { p1s: 'compare', p3s: 'compares', pt1s: 'compared', pt3s: 'compared' },
  avaliar: { p1s: 'evaluate', p3s: 'evaluates', pt1s: 'evaluated', pt3s: 'evaluated' },
  testar: { p1s: 'test', p3s: 'tests', pt1s: 'tested', pt3s: 'tested' },
  tentar: { p1s: 'try', p3s: 'tries', pt1s: 'tried', pt3s: 'tried' },
  viajar: { p1s: 'travel', p3s: 'travels', pt1s: 'traveled', pt3s: 'traveled' },
  visitar: { p1s: 'visit', p3s: 'visits', pt1s: 'visited', pt3s: 'visited' },
  dirigir: { p1s: 'drive', p3s: 'drives', pt1s: 'drove', pt3s: 'drove' },
  construir: { p1s: 'build', p3s: 'builds', pt1s: 'built', pt3s: 'built' },
  destruir: { p1s: 'destroy', p3s: 'destroys', pt1s: 'destroyed', pt3s: 'destroyed' },
  proteger: { p1s: 'protect', p3s: 'protects', pt1s: 'protected', pt3s: 'protected' },
  lutar: { p1s: 'fight', p3s: 'fights', pt1s: 'fought', pt3s: 'fought' },
  gritar: { p1s: 'shout', p3s: 'shouts', pt1s: 'shouted', pt3s: 'shouted' },
  cantar: { p1s: 'sing', p3s: 'sings', pt1s: 'sang', pt3s: 'sang' },
  rir: { p1s: 'laugh', p3s: 'laughs', pt1s: 'laughed', pt3s: 'laughed' },
  chorar: { p1s: 'cry', p3s: 'cries', pt1s: 'cried', pt3s: 'cried' },
  sorrir: { p1s: 'smile', p3s: 'smiles', pt1s: 'smiled', pt3s: 'smiled' },
  dormir: { p1s: 'sleep', p3s: 'sleeps', pt1s: 'slept', pt3s: 'slept' },
  acordar: { p1s: 'wake up', p3s: 'wakes up', pt1s: 'woke up', pt3s: 'woke up' },
  sentar: { p1s: 'sit down', p3s: 'sits down', pt1s: 'sat down', pt3s: 'sat down' },
  ficar: { p1s: 'stay', p3s: 'stays', pt1s: 'stayed', pt3s: 'stayed' },
  sair: { p1s: 'leave', p3s: 'leaves', pt1s: 'left', pt3s: 'left' },
  entrar: { p1s: 'enter', p3s: 'enters', pt1s: 'entered', pt3s: 'entered' },
  voltar: { p1s: 'return', p3s: 'returns', pt1s: 'returned', pt3s: 'returned' },
  parar: { p1s: 'stop', p3s: 'stops', pt1s: 'stopped', pt3s: 'stopped' },
  comecar: { p1s: 'start', p3s: 'starts', pt1s: 'started', pt3s: 'started' },
  terminar: { p1s: 'finish', p3s: 'finishes', pt1s: 'finished', pt3s: 'finished' },
  esperar: { p1s: 'wait', p3s: 'waits', pt1s: 'waited', pt3s: 'waited' },
  procurar: { p1s: 'search', p3s: 'searches', pt1s: 'searched', pt3s: 'searched' },
  abrir: { p1s: 'open', p3s: 'opens', pt1s: 'opened', pt3s: 'opened' },
  fechar: { p1s: 'close', p3s: 'closes', pt1s: 'closed', pt3s: 'closed' },
  copiar: { p1s: 'copy', p3s: 'copies', pt1s: 'copied', pt3s: 'copied' },
  colar: { p1s: 'paste', p3s: 'pastes', pt1s: 'pasted', pt3s: 'pasted' },
};

// Função de tradução
function translate(text) {
  const words = text.split(/\s+/);
  const result = words.map(w => {
    const lower = w.toLowerCase().replace(/[.,!?;:]/g, '');
    const punct = w.slice(-1).match(/[.,!?;:]/) ? w.slice(-1) : '';

    // 1. Big dict
    if (BIG_DICT[lower] && BIG_DICT[lower].en) return BIG_DICT[lower].en + punct;
    // 2. Overrides
    if (OVR[lower]) return OVR[lower] + punct;
    // 3. Verbos
    for (const [verb, tenses] of Object.entries(VERBS)) {
      if (lower === verb) return tenses.p1s + punct;
      for (const [tense, form] of Object.entries(tenses)) {
        if (lower === form) return form + punct;
      }
    }
    return '(' + lower + ')';
  });
  return result.join(' ');
}

// Frases complexas (não só dia a dia)
const complexPhrases = [
  // Textos de notícias
  'O governo federal anunciou novas medidas econômicas para o país',
  'A inflação aumentou nos últimos meses',
  'O presidente discursou sobre a situação atual',
  'Os ministros se reuniram para discutir o orçamento',
  'A oposição criticou as novas propostas do governo',
  'O Congresso aprovou a reforma tributária',
  
  // Textos acadêmicos
  'A pesquisa científica avançou significativamente',
  'Os pesquisadores descobriram uma nova espécie',
  'A universidade publicou um estudo sobre educação',
  'O estudo demonstrou que a tecnologia melhora o aprendizado',
  'Os dados coletados revelaram padrões interessantes',
  
  // Textos de negócios
  'A empresa aumentou seus lucros no último trimestre',
  'O mercado financeiro apresentou volatilidade',
  'Os investidores reagiram positivamente aos resultados',
  'A fusão entre as duas empresas foi aprovada',
  'O CEO anunciou mudanças na estrutura organizacional',
  
  // Textos literários
  'O sol se pôs lentamente atrás das montanhas',
  'A chuva começou a cair durante a noite',
  'As estrelas brilhavam no céu escuro',
  'O vento soprava forte pelas ruas da cidade',
  'O rio corria tranquilamente pelo vale',
  
  // Textos cotidianos complexos
  'Preciso ir ao mercado comprar frutas e legumes',
  'O médico receitou um remédio para minha alergia',
  'A escola anunciou férias para o próximo mês',
  'O ônibus atrasou devido ao trânsito intenso',
  'A loja está com desconto em todos os produtos',
  'O restaurante serve comida italiana e japonesa',
  
  // Textos técnicos
  'O computador processou os dados em tempo real',
  'O software foi atualizado com novas funcionalidades',
  'A rede de internet caiu em várias regiões',
  'O aplicativo permite gerenciar seus treinos',
  'Os sensores mediram a temperatura corporal',
  
  // Textos de sentimentos
  'Eu estou muito feliz com a notícia',
  'Ela ficou triste com a perda do animal',
  'Nós celebramos a conquista do time',
  'Eles expressaram gratidão pela ajuda recebida',
  'O filho escreveu uma carta para sua mãe',
  
  // Frases com estrutura complexa
  'Embora estivesse cansado, ele continuou trabalhando',
  'Enquanto eu estudava, minha irmã assistia televisão',
  'Depois de jantar, nós caminhamos pelo parque',
  'Antes de dormir, ela leu um capítulo do livro',
  'Como está chovendo, vou ficar em casa hoje',
  'Porque estava atrasado, ele correu para o trabalho',
  'Se tiver tempo, eu vou à academia',
  'Quando o sol nasce, os pássaros cantam',
  'Onde fica a estação de trem mais próxima?',
  'Como posso melhorar meu desempenho?',
];

let totalWords = 0;
let translatedWords = 0;
let failedWords = 0;
const failures = [];

console.log('=== Teste de Frases Complexas ===\n');

complexPhrases.forEach(phrase => {
  const result = translate(phrase);
  const words = result.split(/\s+/);
  const matched = words.filter(w => !w.startsWith('(')).length;
  const unknown = words.filter(w => w.startsWith('('));
  
  totalWords += words.length;
  translatedWords += matched;
  failedWords += unknown.length;
  
  if (unknown.length > 0) {
    failures.push({ phrase, unknown: unknown.map(w => w.replace(/[()]/g, '')) });
  }
  
  const conf = (matched / words.length * 100).toFixed(0);
  console.log(`[${conf}%] PT: ${phrase}`);
  console.log(`      EN: ${result}`);
  if (unknown.length > 0) console.log(`      ❌ ${unknown.join(', ')}`);
  console.log('');
});

console.log('=== RESUMO ===');
console.log(`Total de palavras: ${totalWords}`);
console.log(`Traduzidas: ${translatedWords} (${(translatedWords/totalWords*100).toFixed(1)}%)`);
console.log(`Falharam: ${failedWords}`);
console.log(`Frases com falha: ${failures.length}/${complexPhrases.length}`);
console.log('');
if (failures.length > 0) {
  console.log('Palavras que faltam:');
  const allFailed = {};
  failures.forEach(f => f.unknown.forEach(w => { allFailed[w] = (allFailed[w]||0)+1; }));
  Object.entries(allFailed).sort((a,b) => b[1]-a[1]).slice(0,20).forEach(([w,c]) => console.log(`  ${w} (${c}x)`));
}
