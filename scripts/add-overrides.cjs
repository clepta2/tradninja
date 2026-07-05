// scripts/add-overrides.cjs
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/core/clean-dict.ts');
let content = fs.readFileSync(file, 'utf8');

// Remove last };
content = content.replace(/\n\};\s*\n/, '\n');

// Adiciona overrides novos
const NEW_OVERRIDES = `
  // Verbos conjugados que faltavam
  'ajustes':{en:'adjustments',es:'ajustes',fr:'ajustements',de:'Anpassungen',it:'aggiustamenti'},
  'avaliam':{en:'assess',es:'evalúan',fr:'évaluent',de:'bewerten',it:'valutano'},
  'afetar':{en:'affect',es:'afectar',fr:'affecter',de:'beeinflussen',it:'affectare'},
  'trimestres':{en:'quarters',es:'trimestres',fr:'trimestres',de:'Quartale',it:'trimestri'},
  'afirmando':{en:'stating',es:'afirmando',fr:'affirmant',de:'bestätigend',it:'affermando'},
  'resolverão':{en:'will solve',es:'resolverán',fr:'résoudront',de:'werden lösen',it:'risolveranno'},
  // Advérbios compostos
  'significativamente':{en:'significantly',es:'significativamente',fr:'significativement',de:'bedeutend',it:'significativamente'},
  'particularmente':{en:'particularly',es:'particularmente',fr:'particulièrement',de:'insbesondere',it:'particolarmente'},
  'provavelmente':{en:'probably',es:'probablemente',fr:'probablement',de:'wahrscheinlich',it:'probabilmente'},
  'atualmente':{en:'currently',es:'actualmente',fr:'actuellement',de:'derzeit',it:'attualmente'},
  'recentemente':{en:'recently',es:'recientemente',fr:'récemment',de:'kürzlich',it:'recentemente'},
  'finalmente':{en:'finally',es:'finalmente',fr:'finalement',de:'endlich',it:'finalmente'},
  'imediatamente':{en:'immediately',es:'inmediatamente',fr:'immédiatement',de:'sofort',it:'immediatamente'},
  'principalmente':{en:'mainly',es:'principalmente',fr:'principalement',de:'hauptsächlich',it:'principalmente'},
  'essencialmente':{en:'essentially',es:'esencialmente',fr:'essentiellement',de:'im Wesentlichen',it:'essenzialmente'},
  'realmente':{en:'really',es:'realmente',fr:'réellement',de:'wirklich',it:'realmente'},
  'exatamente':{en:'exactly',es:'exactamente',fr:'exactement',de:'genau',it:'esattamente'},
  'absolutamente':{en:'absolutely',es:'absolutamente',fr:'absolument',de:'absolut',it:'assolutamente'},
  'totalmente':{en:'totally',es:'totalmente',fr:'totalement',de:'vollständig',it:'totalmente'},
  'parcialmente':{en:'partially',es:'parcialmente',fr:'partiellement',de:'teilweise',it:'parzialmente'},
  'relativamente':{en:'relatively',es:'relativamente',fr:'relativement',de:'relativ',it:'relativamente'},
  'completamente':{en:'completely',es:'completamente',fr:'complètement',de:'vollständig',it:'completamente'},
  'especialmente':{en:'especially',es:'especialmente',fr:'surtout',de:'besonders',it:'specialmente'},
  'infelizmente':{en:'unfortunately',es:'desafortunadamente',fr:'malheureusement',de:'leider',it:'sfortunatamente'},
  'felizmente':{en:'fortunately',es:'afortunadamente',fr:'heureusement',de:'glücklicherweise',it:'fortunatamente'},
  'inevitavelmente':{en:'inevitably',es:'inevitablemente',fr:'inévitablement',de:'unvermeidlich',it:'inevitabilmente'},
  'consequentemente':{en:'consequently',es:'consecuentemente',fr:'par conséquent',de:'folglich',it:'conseguentemente'},
  // Verbos comuns que faltavam
  'substituir':{en:'replace',es:'sustituir',fr:'remplacer',de:'ersetzen',it:'sostituire'},
  'estabelecer':{en:'establish',es:'establecer',fr:'établir',de:'festlegen',it:'stabilire'},
  'garantir':{en:'guarantee',es:'garantir',fr:'garantir',de:'garantieren',it:'garantire'},
  'assegurar':{en:'ensure',es:'asegurar',fr:'assurer',de:'sicherstellen',it:'assicurare'},
  'definir':{en:'define',es:'definir',fr:'définir',de:'definieren',it:'definire'},
  'considerar':{en:'consider',es:'considerar',fr:'considérer',de:'betrachten',it:'considerare'},
  'contribuir':{en:'contribute',es:'contribuir',fr:'contribuer',de:'beitragen',it:'contribuire'},
  'exigir':{en:'require',es:'exigir',fr:'exiger',de:'erfordern',it:'esigere'},
  'indicar':{en:'indicate',es:'indicar',fr:'indiquer',de:'angeben',it:'indicare'},
  'sugerir':{en:'suggest',es:'sugerir',fr:'suggérer',de:'vorschlagen',it:'suggerire'},
  'recomendar':{en:'recommend',es:'recomendar',fr:'recommander',de:'empfehlen',it:'raccomandare'},
  'solicitar':{en:'request',es:'solicitar',fr:'demander',de:'anfordern',it:'richiedere'},
  'permitir':{en:'allow',es:'permitir',fr:'permettre',de:'erlauben',it:'permettere'},
  'proibir':{en:'forbid',es:'prohibir',fr:'interdire',de:'verbieten',it:'proibire'},
  'negar':{en:'deny',es:'negar',fr:'nier',de:'leugnen',it:'negare'},
  'admitir':{en:'admit',es:'admitir',fr:'admettre',de:'zugeben',it:'ammettere'},
  'reconhecer':{en:'recognize',es:'reconocer',fr:'reconnaître',de:'anerkennen',it:'riconoscere'},
  'negociar':{en:'negotiate',es:'negociar',fr:'négocier',de:'verhandeln',it:'negoziare'},
  'medir':{en:'measure',es:'medir',fr:'mesurer',de:'messen',it:'misurare'},
  'avaliar':{en:'evaluate',es:'evaluar',fr:'évaluer',de:'bewerten',it:'valutare'},
  'calcular':{en:'calculate',es:'calcular',fr:'calculer',de:'berechnen',it:'calcolare'},
  'analisar':{en:'analyze',es:'analizar',fr:'analyser',de:'analysieren',it:'analizzare'},
  'interpretar':{en:'interpret',es:'interpretar',fr:'interpréter',de:'interpretieren',it:'interpretare'},
  'descrever':{en:'describe',es:'describir',fr:'décrire',de:'beschreiben',it:'descrivere'},
  'explicar':{en:'explain',es:'explicar',fr:'expliquer',de:'erklären',it:'spiegare'},
  'defender':{en:'defend',es:'defender',fr:'défendre',de:'verteidigen',it:'difendere'},
  'apoiar':{en:'support',es:'apoyar',fr:'soutenir',de:'unterstützen',it:'appoggiare'},
  'competir':{en:'compete',es:'competir',fr:'concourir',de:'konkurrieren',it:'competere'},
  'comparar':{en:'compare',es:'comparar',fr:'comparer',de:'vergleichen',it:'confrontare'},
  'construir':{en:'build',es:'construir',fr:'construire',de:'bauen',it:'costruire'},
  'produzir':{en:'produce',es:'producir',fr:'produire',de:'produzieren',it:'produrre'},
  'distribuir':{en:'distribute',es:'distribuir',fr:'distribuer',de:'verteilen',it:'distribuire'},
  'exportar':{en:'export',es:'exportar',fr:'exporter',de:'exportieren',it:'esportare'},
  'importar':{en:'import',es:'importar',fr:'importer',de:'importieren',it:'importare'},
  'fabricar':{en:'manufacture',es:'fabricar',fr:'fabriquer',de:'herstellen',it:'fabbricare'},
  // Adjetivos compostos que faltavam
  'econômico':{en:'economic',es:'económico',fr:'économique',de:'wirtschaftlich',it:'economico'},
  'financeiro':{en:'financial',es:'financiero',fr:'financier',de:'finanziell',it:'finanziario'},
  'internacional':{en:'international',es:'internacional',fr:'international',de:'international',it:'internazionale'},
  'ambiental':{en:'environmental',es:'ambiental',fr:'environnemental',de:'umweltbezogen',it:'ambientale'},
  'sistêmico':{en:'systemic',es:'sistémico',fr:'systémique',de:'systemisch',it:'sistemico'},
  'fundamental':{en:'fundamental',es:'fundamental',fr:'fondamental',de:'grundlegend',it:'fondamentale'},
  // Substantivos abstratos
  'economia':{en:'economy',es:'economía',fr:'économie',de:'Wirtschaft',it:'economia'},
  'política':{en:'policy',es:'política',fr:'politique',de:'Politik',it:'politica'},
  'cultura':{en:'culture',es:'cultura',fr:'culture',de:'Kultur',it:'cultura'},
  'história':{en:'history',es:'historia',fr:'histoire',de:'Geschichte',it:'storia'},
  'ciência':{en:'science',es:'ciencia',fr:'science',de:'Wissenschaft',it:'scienza'},
  'tecnologia':{en:'technology',es:'tecnología',fr:'technologie',de:'Technologie',it:'tecnologia'},
  'inflação':{en:'inflation',es:'inflación',fr:'inflation',de:'Inflation',it:'inflazione'},
  'impostos':{en:'taxes',es:'impuestos',fr:'impôts',de:'Steuern',it:'tasse'},
  'medidas':{en:'measures',es:'medidas',fr:'mesures',de:'Maßnahmen',it:'misure'},
  'propostas':{en:'proposals',es:'propuestas',fr:'propositions',de:'Vorschläge',it:'proposte'},
  'mudanças':{en:'changes',es:'cambios',fr:'changements',de:'Änderungen',it:'cambi'},
  'problemas':{en:'problems',es:'problemas',fr:'problèmes',de:'Probleme',it:'problemi'},
  'poder':{en:'power',es:'poder',fr:'pouvoir',de:'Macht',it:'potere'},
  'compra':{en:'purchase',es:'compra',fr:'achat',de:'Kauf',it:'acquisto'},
  'população':{en:'population',es:'población',fr:'population',de:'Bevölkerung',it:'popolazione'},
  'oposição':{en:'opposition',es:'oposición',fr:'opposition',de:'Opposition',it:'opposizione'},
  'economistas':{en:'economists',es:'economistas',fr:'économistes',de:'Ökonomen',it:'economisti'},
  'governo':{en:'government',es:'gobierno',fr:'gouvernement',de:'Regierung',it:'governo'},
  'presidente':{en:'president',es:'presidente',fr:'président',de:'Präsident',it:'presidente'},
  'república':{en:'republic',es:'república',fr:'république',de:'Republik',it:'repubblica'},
  'situação':{en:'situation',es:'situación',fr:'situation',de:'Lage',it:'situazione'},
  'mercado':{en:'market',es:'mercado',fr:'marché',de:'Markt',it:'mercato'},
  'empresa':{en:'company',es:'empresa',fr:'entreprise',de:'Unternehmen',it:'azienda'},
  'médico':{en:'doctor',es:'médico',fr:'médecin',de:'Arzt',it:'medico'},
  'advogado':{en:'lawyer',es:'abogado',fr:'avocat',de:'Anwalt',it:'avvocato'},
  'professor':{en:'teacher',es:'profesor',fr:'professeur',de:'Lehrer',it:'professore'},
  'estudante':{en:'student',es:'estudiante',fr:'étudiant',de:'Student',it:'studente'},
  'computador':{en:'computer',es:'ordenador',fr:'ordinateur',de:'Computer',it:'computer'},
  'internet':{en:'internet',es:'internet',fr:'internet',de:'Internet',it:'internet'},
  'aplicativo':{en:'app',es:'aplicación',fr:'application',de:'App',it:'app'},
  'notícia':{en:'news',es:'noticia',fr:'nouvelle',de:'Nachricht',it:'notizia'},
  'pesquisa':{en:'research',es:'investigación',fr:'recherche',de:'Forschung',it:'ricerca'},
  'universidade':{en:'university',es:'universidad',fr:'université',de:'Universität',it:'università'},
  // Verbos conjugados que faltavam
  'discursou':{en:'spoke',es:'discurse',fr:'discourut',de:'hielt eine Rede',it:'tenne un discorso'},
  'criticou':{en:'criticized',es:'criticó',fr:'critiqua',de:'kritisierte',it:'criticò'},
  'aprovou':{en:'approved',es:'aprobó',fr:'approuva',de:'genehmigte',it:'approvò'},
  'aumentou':{en:'increased',es:'aumentó',fr:'augmenta',de:'erhöhte',it:'aumentò'},
  'demonstrou':{en:'demonstrated',es:'demostró',fr:'démontra',de:'bewies',it:'dimostrò'},
  'anunciou':{en:'announced',es:'anunció',fr:'annonça',de:'kündigte an',it:'annunciò'},
  'publicou':{en:'published',es:'publicó',fr:'publia',de:'veröffentlichte',it:'pubblicò'},
  'confirmou':{en:'confirmed',es:'confirmó',fr:'confirma',de:'bestätigte',it:'confermò'},
  'observou':{en:'observed',es:'observó',fr:'observa',de:'beobachtete',it:'osservò'},
  'desenvolveu':{en:'developed',es:'desarrolló',fr:'développa',de:'entwickelte',it:'sviluppò'},
  'negociou':{en:'negotiated',es:'negoció',fr:'négocia',de:'verhandelte',it:'negoziò'},
  'assinou':{en:'signed',es:'firmó',fr:'signa',de:'unterzeichnete',it:'firmò'},
  'implementou':{en:'implemented',es:'implementó',fr:'met en oeuvre',de:'implementierte',it:'implementò'},
  'planejou':{en:'planned',es:'planeó',fr:'planifia',de:'plante',it:'pianificò'},
  'organizou':{en:'organized',es:'organizó',fr:'organisa',de:'organisierte',it:'organizzò'},
  'transformou':{en:'transformed',es:'transformó',fr:'transforma',de:'veränderte',it:'trasformò'},
  'modernizou':{en:'modernized',es:'modernizó',fr:'modernisa',de:'modernisierte',it:'modernizzò'},
  'digitalizou':{en:'digitalized',es:'digitalizó',fr:'numérise',de:'digitalisierte',it:'digitalizzò'},
  // Verbos infinitivos comuns
  'discutir':{en:'discuss',es:'discutir',fr:'discuter',de:'diskutieren',it:'discutere'},
  'avaliar':{en:'evaluate',es:'evaluar',fr:'évaluer',de:'bewerten',it:'valutare'},
  'aprovar':{en:'approve',es:'aprobar',fr:'approuver',de:'genehmigen',it:'approvare'},
  'criticar':{en:'criticize',es:'criticar',fr:'critiquer',de:'kritisieren',it:'criticare'},
  'afirmar':{en:'affirm',es:'afirmar',fr:'affirmer',de:'bestätigen',it:'affermare'},
  'reagir':{en:'react',es:'reaccionar',fr:'réagir',de:'reagieren',it:'reagire'},
  'publicar':{en:'publish',es:'publicar',fr:'publier',de:'veröffentlichen',it:'pubblicare'},
  'anunciar':{en:'announce',es:'anunciar',fr:'annoncer',de:'ankündigen',it:'annunciare'},
  'confirmar':{en:'confirm',es:'confirmar',fr:'confirmer',de:'bestätigen',it:'confermare'},
  'negociar':{en:'negotiate',es:'negociar',fr:'négocier',de:'verhandeln',it:'negoziare'},
  'produzir':{en:'produce',es:'producir',fr:'produire',de:'produzieren',it:'produrre'},
  'consumir':{en:'consume',es:'consumir',fr:'consommer',de:'konsumieren',it:'consumare'},
  'investir':{en:'invest',es:'invertir',fr:'investir',de:'investieren',it:'investire'},
  'exportar':{en:'export',es:'exportar',fr:'exporter',de:'exportieren',it:'esportare'},
  'importar':{en:'import',es:'importar',fr:'importer',de:'importieren',it:'importare'},
  'construir':{en:'build',es:'construir',fr:'construire',de:'bauen',it:'costruire'},
  'distribuir':{en:'distribute',es:'distribuir',fr:'distribuer',de:'verteilen',it:'distribuire'},
  'fabricar':{en:'manufacture',es:'fabricar',fr:'fabriquer',de:'herstellen',it:'fabbricare'},
  'definir':{en:'define',es:'definir',fr:'définir',de:'definieren',it:'definire'},
  'estabelecer':{en:'establish',es:'establecer',fr:'établir',de:'festlegen',it:'stabilire'},
  'garantir':{en:'guarantee',es:'garantir',fr:'garantir',de:'garantieren',it:'garantire'},
  'permitir':{en:'allow',es:'permitir',fr:'permettre',de:'erlauben',it:'permettere'},
  'proibir':{en:'forbid',es:'prohibir',fr:'interdire',de:'verbieten',it:'proibire'},
  'reconhecer':{en:'recognize',es:'reconocer',fr:'reconnaître',de:'anerkennen',it:'riconoscere'},
  'medir':{en:'measure',es:'medir',fr:'mesurer',de:'messen',it:'misurare'},
  'calcular':{en:'calculate',es:'calcular',fr:'calculer',de:'berechnen',it:'calcolare'},
  'analisar':{en:'analyze',es:'analizar',fr:'analyser',de:'analysieren',it:'analizzare'},
  'descrever':{en:'describe',es:'describir',fr:'décrire',de:'beschreiben',it:'descrivere'},
  'explicar':{en:'explain',es:'explicar',fr:'expliquer',de:'erklären',it:'spiegare'},
  'defender':{en:'defend',es:'defender',fr:'défendre',de:'verteidigen',it:'difendere'},
  'apoiar':{en:'support',es:'apoyar',fr:'soutenir',de:'unterstützen',it:'appoggiare'},
  'competir':{en:'compete',es:'competir',fr:'concourir',de:'konkurrieren',it:'competere'},
  'construir':{en:'build',es:'construir',fr:'construire',de:'bauen',it:'costruire'},
  'produzir':{en:'produce',es:'producir',fr:'produire',de:'produzieren',it:'produrre'},
  'exportar':{en:'export',es:'exportar',fr:'exporter',de:'exportieren',it:'esportare'},
  'importar':{en:'import',es:'importar',fr:'importer',de:'importieren',it:'importare'},
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

// Find last entry before }; and add new overrides
let insertIdx = deduped.length - 1;
while (insertIdx >= 0 && !deduped[insertIdx].includes('};')) insertIdx--;
deduped.splice(insertIdx, 0, NEW_OVERRIDES);

fs.writeFileSync(file, deduped.join('\n'), 'utf8');
console.log('Overrides adicionados. Total linhas:', deduped.length);
