// scripts/add-slang.cjs
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/core/clean-dict.ts');
let content = fs.readFileSync(file, 'utf8');

// Remove último };
content = content.replace(/\n\};\s*\n/, '\n');

const SLANG = `
  // ── Gírias e linguagem informal brasileira ──
  'bora':{en:"let's go",es:'vamos',fr:'allons-y',de:'los geht\'s',it:'andiamo'},
  'tô':{en:'I am',es:'estoy',fr:'je suis',de:'ich bin',it:'sono'},
  'tá':{en:'is',es:'está',fr:'est',de:'ist',it:'è'},
  'cara':{en:'dude',es:'carnal',fr:'mec',de:'Typ',it:'ragazzo'},
  'mano':{en:'bro',es:'carnal',fr:'frère',de:'Bruder',it:'fratello'},
  'véi':{en:'old man',es:'viejo',fr:'vieux',de:'alter Mann',it:'vecchio'},
  'pô':{en:'man',es:'hombre',fr:'homme',de:'Mann',it:'uomo'},
  'beleza':{en:'alright',es:'belleza',fr:'beauté',de:'Schönheit',it:'bellezza'},
  'legal':{en:'cool',es:'legal',fr:'sympa',de:'cool',it:'figo'},
  'massinha':{en:'awesome',es:'increíble',fr:'génial',de:'großartig',it:'fantastico'},
  'dahora':{en:'awesome',es:'genial',fr:'génial',de:'großartig',it:'fantastico'},
  'sacar':{en:'understand',es:'entender',fr:'comprendre',de:'begreifen',it:'capire'},
  'manter':{en:'keep',es:'mantener',fr:'garder',de:'halten',it:'mantenere'},
  'tipo':{en:'like',es:'tipo',fr:'comme',de:'wie',it:'tipo'},
  'sabe':{en:'you know',es:'sabes',fr:'tu sais',de:'weißt du',it:'sai'},
  'entendeu':{en:'understood',es:'entendido',fr:'compris',de:'verstanden',it:'capito'},
  'uai':{en:'wow',es:'vaya',fr:'oh là là',de:'wow',it:'wow'},
  'oxe':{en:'wow',es:'vaya',fr:'oh là là',de:'wow',it:'wow'},
  'oba':{en:'yay',es:'guau',fr:'ouais',de:'juhu',it:'evviva'},
  'eita':{en:'wow',es:'vaya',fr:'oh la la',de:'wow',it:'wow'},
  'rapaz':{en:'wow',es:'vaya',fr:'oh là là',de:'wow',it:'wow'},
  'caraca':{en:'wow',es:'vaya',fr:'oh là là',de:'wow',it:'wow'},
  'puxa':{en:'wow',es:'vaya',fr:'oh là là',de:'wow',it:'wow'},
  'bro':{en:'bro',es:'carnal',fr:'frère',de:'Bruder',it:'fratello'},
  'dude':{en:'dude',es:'carnal',fr:'mec',de:'Typ',it:'ragazzo'},
  'maneiro':{en:'cool',es:'genial',fr:'génial',de:'cool',it:'figo'},
  'top':{en:'top',es:'genial',fr:'génial',de:'top',it:'top'},
  'show':{en:'awesome',es:'genial',fr:'génial',de:'super',it:'fantastico'},
  'irado':{en:'awesome',es:'increíble',fr:'génial',de:'großartig',it:'fantastico'},
  'bacana':{en:'cool',es:'genial',fr:'sympa',de:'cool',it:'figo'},
  'sinistro':{en:'awesome',es:'increíble',fr:'génial',de:'großartig',it:'fantastico'},
  'zica':{en:'bad luck',es:'mala suerte',fr:'mauvaise chance',de:'Pech',it:'sfortuna'},
  'fraco':{en:'weak',es:'débil',fr:'faible',de:'schwach',it:'debole'},
  'fortão':{en:'strong guy',es:'tipazo',fr:'costaud',de:'starker Typ',it:'fattone'},
  'marronzão':{en:'cool thing',es:'genial',fr:'chouette',de:'cool',it:'figo'},
  'mohó':{en:'lame',es:'aburrido',fr:'nul',de:'lahm',it:'noioso'},
  'broca':{en:'boring',es:'aburrido',fr:'ennuyeux',de:'langweilig',it:'noioso'},
  'mó':{en:'very',es:'muy',fr:'très',de:'sehr',it:'molto'},
  'uai':{en:'well',es:'pues',fr:'eh bien',de:'naja',it:'beh'},
  'oxe':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'oba':{en:'yay',es:'guau',fr:'ouais',de:'juhu',it:'evviva'},
  'eita':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'rapaz':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'caraca':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'puxa':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'mano':{en:'bro',es:'carnal',fr:'frère',de:'Bruder',it:'fratello'},
  'véi':{en:'dude',es:'viejo',fr:'vieux',de:'Alter',it:'vecchio'},
  'mermão':{en:'bro',es:'carnal',fr:'frère',de:'Bruder',it:'fratello'},
  'broca':{en:'boring',es:'aburrido',fr:'ennuyeux',de:'langweilig',it:'noioso'},
  'mó':{en:'very',es:'muy',fr:'très',de:'sehr',it:'molto'},
  'uai':{en:'well',es:'pues',fr:'alors',de:'naja',it:'beh'},
  'oxe':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'oba':{en:'yay',es:'guau',fr:'ouais',de:'juhu',it:'evviva'},
  'eita':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'rapaz':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'caraca':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
  'puxa':{en:'wow',es:'vaya',fr:'wow',de:'wow',it:'wow'},
};`;

// Remove duplicate keys
const lines = content.split('\n');
const seen = new Set();
const deduped = [];
for (const line of lines) {
  const keyMatch = line.match(/'([^']+)':/);
  if (keyMatch) {
    if (seen.has(keyMatch[1])) continue;
    seen.add(keyMatch[1]);
  }
  deduped.push(line);
}

// Find last entry before }; and add slang
let insertIdx = deduped.length - 1;
while (insertIdx >= 0 && !deduped[insertIdx].includes('};')) insertIdx--;
deduped.splice(insertIdx, 0, SLANG);

fs.writeFileSync(file, deduped.join('\n'), 'utf8');
console.log('Gírias adicionadas. Total linhas:', deduped.length);
