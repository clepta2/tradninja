// scripts/gen-verbs-v2.cjs
// Gera 200+ verbos com traduções CORRETAS (infinitivos, não contextuais)
const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const LANGS = ['en','es','fr','de','it','ja','ko','zh','ar','ru','hi','nl','pl','sv','da','no','fi','cs','el','hu','ro','uk','id','ms','th','tr','he','bn','sw'];
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/pt.json'), 'utf8'));

function loadDict(lang) {
  try {
    const c = fs.readFileSync(path.join(DICT_DIR, `dictionary${lang}.ts`), 'utf8');
    const m = {};
    const re = /'([^']+)':\s*\{\s*\w+:\s*'([^']+)'\s*\}/g;
    let x;
    while ((x = re.exec(c)) !== null) m[x[1]] = x[2];
    return m;
  } catch { return {}; }
}

const dicts = {};
for (const l of LANGS) dicts[l] = loadDict(l);

// ── Lista curada de verbos PT com infinitivos corretos ──────
// Cada verbo tem: PT infinitivo + tradução correta por idioma
// Usada quando o dicionário dá tradução contextual errada
const CURATED = {
  // Familia -AR (os mais comuns)
  falar:   { en:'speak', es:'hablar', fr:'parler', de:'sprechen', it:'parlare', ja:'話す', ko:'말하다', zh:'说话', ar:'تكلم', ru:'говорить', hi:'बोलना', nl:'praten', pl:'mówić', sv:'tala', da:'tale', no:'snakke', fi:'puhua', cs:'mluvit', el:'μιλώ', hu:'beszélni', ro:'vorbi', uk:'говорити', id:'berbicara', ms:'bercakap', th:'พูด', tr:'konuşmak', he:'לדבר', bn:'কথা বলা', sw:'ongea' },
  amar:    { en:'love', es:'amar', fr:'aimer', de:'lieben', it:'amare', ja:'愛する', ko:'사랑하다', zh:'爱', ar:'يحب', ru:'любить', hi:'प्यार करना', nl:'houden van', pl:'kochać', sv:'älska', da:'elske', no:'elske', fi:'rakastaa', cs:'milovat', el:'αγαπώ', hu:'szeretni', ro:'iubi', uk:'любити', id:'mencintai', ms:'mencintai', th:'รัก', tr:'sevmek', he:'לאהוב', bn:'ভালোবাসা', sw:'penda' },
  caminhar:{ en:'walk', es:'caminar', fr:'marcher', de:'gehen', it:'camminare', ja:'歩く', ko:'걷다', zh:'走', ar:'يمشي', ru:'идти', hi:'चलना', nl:'lopen', pl:'iść', sv:'gå', da:'gå', no:'gå', fi:'kävellä', cs:'chodit', el:'περπατώ', hu:'sétálni', ro:'merge', uk:'ходити', id:'berjalan', ms:'berjalan', th:'เดิน', tr:'yürümek', he:'לכת', bn:'হাঁটা', sw:'tembea' },
  jogar:   { en:'play', es:'jugar', fr:'jouer', de:'spielen', it:'giocare', ja:'遊ぶ', ko:'놀다', zh:'玩', ar:'يلعب', ru:'играть', hi:'खेलना', nl:'spelen', pl:'grać', spela:'spela', da:'spille', no:'spille', fi:'pelata', cs:'hrát', el:'παίζω', hu:'játszani', ro:'juca', uk:'грати', id:'bermain', ms:'bermain', th:'เล่น', tr:'oynamak', he:'לשחק', bn:'খেলা', sw:'cheza' },
  cantar:  { en:'sing', es:'cantar', fr:'chanter', de:'singen', it:'cantare', ja:'歌う', ko:'노래하다', zh:'唱歌', ar:'يغني', ru:'петь', hi:'गाना', nl:'zingen', pl:'śpiewać', sv:'sjunga', da:'synge', no:'synge', fi:'laulaa', cs:'zpívat', el:'τραγουδώ', hu:'énekelni', ro:'cânta', uk:'співати', id:'bernyanyi', ms:'menyanyi', th:'ร้องเพลง', tr:'şarkı söylemek', he:'לשיר', bn:'গান গাওয়া', sw:'imba' },
  pular:   { en:'jump', es:'saltar', fr:'sauter', de:'springen', it:'saltare', ja:'ジャンプ', ko:'뛰다', zh:'跳', ar:'يقفز', ru:'прыгать', hi:'कूदना', nl:'springen', pl:'skakać', sv:'hoppa', da:'hoppe', no:'hoppe', fi:'hypätä', cs:'skákat', el:'πηδώ', hu:'ugrani', ro:'sări', uk:'стрибати', id:'meloncat', ms:'melompat', th:'กระโดด', tr:'atlamak', he:'לדלג', bn:'লাফানো', sw:'ruka' },
  correr:  { en:'run', es:'correr', fr:'courir', de:'laufen', it:'correre', ja:'走る', ko:'달리다', zh:'跑', ar:'يركض', ru:'бегать', hi:'दौड़ना', nl:'rennen', pl:'biegać', sv:'springa', da:'løbe', no:'løpe', fi:'juosta', cs:'běžet', el:'τρέχω', hu:'futni', ro:'alerga', uk:'бігати', id:'berlari', ms:'berlari', th:'วิ่ง', tr:'koşmak', he:'לרוץ', bn:'দৌড়ানো', sw:'kukimbia' },
  nadar:   { en:'swim', es:'nadar', fr:'nager', de:'schwimmen', it:'nuotare', ja:'泳ぐ', ko:'수영하다', zh:'游泳', ar:'يسبح', ru:'плавать', hi:'तैरना', nl:'zwemmen', pl:'pływać', sv:'simma', da:'svømme', no:'svømme', fi:'uida', cs:'plavat', el:'κολυμπώ', hu:'úszni', ro:'înota', uk:'плавати', id:'berenang', ms:'berenang', th:'ว่ายน้ำ', tr:'yüzmek', he:'לשחות', bn:'সাঁতার', sw:'kuogelea' },
  // Familia -ER
  comer:   { en:'eat', es:'comer', fr:'manger', de:'essen', it:'mangiare', ja:'食べる', ko:'먹다', zh:'吃', ar:'يأكل', ru:'есть', hi:'खाना', nl:'eten', pl:'jeść', sv:'äta', da:'spise', no:'spise', fi:'syödä', cs:'jíst', el:'τρώω', hu:'enni', ro:'mânca', uk:'їсти', id:'makan', ms:'makan', th:'กิน', tr:'yemek', he:'לאכול', bn:'খাওয়া', sw:'kula' },
  beber:   { en:'drink', es:'beber', fr:'boire', de:'trinken', it:'bere', ja:'飲む', ko:'마시다', zh:'喝', ar:'يشرب', ru:'пить', hi:'पीना', nl:'drinken', pl:'pić', sv:'dricka', da:'drikke', no:'drikke', fi:'juoda', cs:'pít', el:'πίνω', hu:'inni', ro:'bea', uk:'пити', id:'minum', ms:'minum', th:'ดื่ม', tr:'içmek', he:'לשתות', bn:'পান করা', sw:'kunywea' },
  aprender:{ en:'learn', es:'aprender', fr:'apprendre', de:'lernen', it:'imparare', ja:'学ぶ', ko:'배우다', zh:'学习', ar:'يتعلم', ru:'учить', hi:'सीखना', nl:'leren', pl:'uczyć się', sv:'lära sig', da:'lære', no:'lære', fi:'oppia', cs:'učit se', el:'μαθαίνω', hu:'tanulni', ro:'învăța', uk:'вчити', id:'belajar', ms:'belajar', th:'เรียนรู้', tr:'öğrenmek', he:'ללמוד', bn:'শেখা', sw:'jifunza' },
  vender:  { en:'sell', es:'vender', fr:'vendre', de:'verkaufen', it:'vendere', ja:'売る', ko:'팔다', zh:'卖', ar:'يبيع', ru:'продавать', hi:'बेचना', nl:'verkopen', pl:'sprzedawać', sv:'sälja', da:'sælge', no:'selge', fi:'myydä', cs:'prodávat', el:'πουλώ', hu:'eladni', ro:'vinde', uk:'продавати', id:'menjual', ms:'menjual', th:'ขาย', tr:'satmak', he:'למכור', bn:'বিক্রি করা', sw:'kuuza' },
  comprar: { en:'buy', es:'comprar', fr:'acheter', de:'kaufen', it:'comprare', ja:'買う', ko:'사다', zh:'买', ar:'يشتري', ru:'покупать', hi:'खरीदना', nl:'kopen', pl:'kupować', sv:'köpa', da:'købe', no:'kjøpe', fi:'ostaa', cs:'kupovat', el:'αγοράζω', hu:'venni', ro:'cumpăra', uk:'купувати', id:'membeli', ms:'membeli', th:'ซื้อ', tr:'almak', he:'לקנות', bn:'কেনা', sw:'kununua' },
  // Familia -IR
  abrir:   { en:'open', es:'abrir', fr:'ouvrir', de:'öffnen', it:'aprire', ja:'開ける', ko:'열다', zh:'打开', ar:'يفتح', ru:'открывать', hi:'खोलना', nl:'openen', pl:'otwierać', sv:'öppna', da:'åbne', no:'åpne', fi:'avata', cs:'otevírat', el:'ανοίγω', hu:'kinyitni', ro:'deschide', uk:'відкривати', id:'membuka', ms:'membuka', th:'เปิด', tr:'açmak', he:'לפתוח', bn:'খোলা', sw:'kufungua' },
  partir:  { en:'leave', es:'partir', fr:'partir', de:'abreisen', it:'partire', ja:'出発する', ko:'출발하다', zh:'离开', ar:'يغادر', ru:'уезжать', hi:'जाना', nl:'vertrekken', pl:'wyruszać', sv:'resa', da:'tage af sted', no:'dra', fi:'lähteä', cs:'odjíždět', el:'φεύγω', hu:'elutazni', ro:'pleca', uk:'виїжджати', id:'berangkat', ms:'berangkat', th:'ออกเดินทาง', tr:'ayrılmak', he:'לצאת', bn:'যাওয়া', sw:'kuondoka' },
  dormir:  { en:'sleep', es:'dormir', fr:'dormir', de:'schlafen', it:'dormire', ja:'寝る', ko:'자다', zh:'睡觉', ar:'يتنام', ru:'спать', hi:'सोना', nl:'slapen', pl:'spać', sv:'sova', da:'sove', no:'sove', fi:'nukkua', cs:'spát', el:'κοιμάμαι', hu:'aludni', ro:'dormi', uk:'спати', id:'tidur', ms:'tidur', th:'นอน', tr:'uyumak', he:'לישון', bn:'ঘুমানো', sw:'kulala' },
  partir:  { en:'split', es:'partir', fr:'partir', de:'teilen', it:'partire', ja:'分ける', ko:'나누다', zh:'分开', ar:'يقسم', ru:'делить', hi:'बाँटना', nl:'delen', pl:'dzielić', sv:'dela', da:'dele', no:'dele', fi:'jakaa', cs:'dělit', el:'χωρίζω', hu:'osztani', ro:'împărți', uk:'ділити', id:'membagi', ms:'membagi', th:'แบ่ง', tr:'bölmek', he:'לחלק', bn:'ভাগ করা', sw:'kugawanya' },
  // Verbos fitness
  treinar: { en:'train', es:'entrenar', fr:'entraîner', de:'trainieren', it:'allenare', ja:'トレーニングする', ko:'훈련하다', zh:'训练', ar:'يتدرب', ru:'тренироваться', hi:'अभ्यास करना', nl:'trainen', pl:'ćwiczyć', sv:'träna', da:'træne', no:'trene', fi:'harjoittaa', cs:'trénovat', el:'προπονούμαι', hu:'edzeni', ro:'antrena', uk:'тренуватися', id:'berlatih', ms:'berlatih', th:'ฝึก', tr:'antrenman yapmak', he:'להתאמן', bn:'অনুশীলন', sw:'kufanya mazoezi' },
 Alongar:  { en:'stretch', es:'estirar', fr:'étirer', de:'dehnen', it:'allungare', ja:'ストレッチする', ko:'스트레칭하다', zh:'拉伸', ar:'يتمدد', ru:'тянуться', hi:'स्ट्रेच करना', nl:'rekken', pl:'rozciągać sig', sv:'töja', da:'strække', no:'tøye', fi:'venyttää', cs:'protahovat', el:'τεντώνω', hu:'nyújtani', ro:'întinde', uk:'розтягуватися', id:'peregangan', ms:'meregang', th:'ยืด', tr:'esnemek', he:'להתיחד', bn:'স্ট্রেচ', sw:'kujinyungiza' },
  correr:  { en:'run', es:'correr', fr:'courir', de:'laufen', it:'correre', ja:'走る', ko:'달리다', zh:'跑步', ar:'يركض', ru:'бегать', hi:'दौड़ना', nl:'rennen', pl:'biegać', sv:'springa', da:'løbe', no:'løpe', fi:'juosta', cs:'běžet', el:'τρέχω', hu:'futni', ro:'alerga', uk:'бігати', id:'berlari', ms:'berlari', th:'วิ่ง', tr:'koşmak', he:'לרוץ', bn:'দৌড়ানো', sw:'kukimbia' },
  // Verbos essenciais
  ser:     { en:'be', es:'ser', fr:'être', de:'sein', it:'essere', ja:'である', ko:'이되다', zh:'是', ar:'يكون', ru:'быть', hi:'होना', nl:'zijn', pl:'być', sv:'vara', da:'være', no:'være', fi:'olla', cs:'být', el:'είμαι', hu:'lenni', ro:'fi', uk:'бути', id:'adalah', ms:'adalah', th:'เป็น', tr:'olmak', he:'להיות', bn:'হওয়া', sw:'kuwa' },
  ter:     { en:'have', es:'tener', fr:'avoir', de:'haben', it:'avere', ja:'持つ', ko:'가지다', zh:'有', ar:'يملك', ru:'иметь', hi:'रखना', nl:'hebben', pl:'mieć', sv:'ha', da:'have', no:'ha', fi:'omistaa', cs:'mít', el:'έχω', hu:'birtokolni', ro:'avea', uk:'мати', id:'memiliki', ms:'mempunyai', th:'มี', tr:'sahip olmak', he:'להיות', bn:'থাকা', sw:'kuwa na' },
  fazer:   { en:'do', es:'hacer', fr:'faire', de:'machen', it:'fare', ja:'する', ko:'하다', zh:'做', ar:'يفعل', ru:'делать', hi:'करना', nl:'doen', pl:'robić', sv:'göra', da:'gøre', no:'gjøre', fi:'tehdä', cs:'dělat', el:'κάνω', hu:'csinálni', ro:'face', uk:'робити', id:'melakukan', ms:'melakukan', th:'ทำ', tr:'yapmak', he:'לעשות', bn:'করা', sw:'kufanya' },
  ir:      { en:'go', es:'ir', fr:'aller', de:'gehen', it:'andare', ja:'行く', ko:'가다', zh:'去', ar:'يذهب', ru:'идти', hi:'जाना', nl:'gaan', pl:'iść', sv:'gå', da:'gå', no:'gå', fi:' mennä', cs:'jít', el:'πηγαίνω', hu:'menni', ro:'merge', uk:'йтити', id:'pergi', ms:'pergi', th:'ไป', tr:'gitmek', he:'לכת', bn:'যাওয়া', sw:'kuenda' },
  vir:     { en:'come', es:'venir', fr:'venir', de:'kommen', it:'venire', ja:'来る', ko:'오다', zh:'来', ar:'يأتي', ru:'приходить', hi:'आना', nl:'komen', pl:'przychodzić', sv:'komma', da:'komme', no:'komme', fi:'tulla', cs:'přijít', el:'έρχομαι', hu:'jönni', ro:'veni', uk:'приходити', id:'datang', ms:'datang', th:'มา', tr:'gelmek', he:'לבוא', bn:'আসা', sw:'kuja' },
};

// Mescla: curado tem prioridade, depois dicionário
const seen = new Set();
const allVerbs = [];

for (const [verb, curated] of Object.entries(CURATED)) {
  if (seen.has(verb)) continue;
  seen.add(verb);
  const entry = { pt: verb };
  for (const lang of LANGS) {
    entry[lang] = curated[lang] || '';
  }
  allVerbs.push(entry);
}

// Adiciona verbos do dicionário que NÃO estão no curado
const skip = new Set(['onde','antes','depois','entre','sobre','contra','desde','ate','mais','menos','mulher','quer','sair','qualquer']);
for (const [key, ptVal] of Object.entries(pt)) {
  if (allVerbs.length >= 250) break;
  const v = String(ptVal).trim();
  const lower = v.toLowerCase();
  if (v.length >= 4 && (lower.endsWith('ar') || lower.endsWith('er') || lower.endsWith('ir'))
      && !seen.has(lower) && !skip.has(lower)) {
    seen.add(lower);
    const entry = { pt: lower };
    for (const lang of LANGS) entry[lang] = dicts[lang][lower] || dicts[lang][v] || '';
    if (entry.en && entry.en.length > 1) allVerbs.push(entry);
  }
}

// Gera
let ts = '// src/core/verbs-data.ts\n';
ts += '// ' + allVerbs.length + ' verbos — infinitivos corretos\n';
ts += '// PT -> 29 idiomas\n\n';
ts += 'export const LANGUAGES = ' + JSON.stringify(LANGS) + ' as const;\n';
ts += 'export type VerbLang = typeof LANGUAGES[number];\n';
ts += 'export const VERBS: Record<string, Record<string, string>> = {\n';

for (const v of allVerbs) {
  const obj = {};
  for (const lang of LANGS) {
    if (v[lang]) obj[lang] = v[lang];
  }
  ts += JSON.stringify(v.pt) + ': ' + JSON.stringify(obj) + ',\n';
}

ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/verbs-data.ts'), ts, 'utf8');

console.log('Verbos curados (infinitivos corretos):', CURATED.size);
console.log('Verbos do dicionário (contextuais):', allVerbs.length - CURATED.size);
console.log('Total:', allVerbs.length);
console.log('\nExemplos curados:');
['falar','comer','dormir','treinar','abrir'].forEach(v => {
  const e = allVerbs.find(x => x.pt === v);
  if (e) console.log('  ' + v + ' → en:' + e.en + ' es:' + e.es + ' ja:' + e.ja);
});
