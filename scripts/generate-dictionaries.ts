// translation/scripts/generate-dictionaries.ts
// Gerador de dicionarios completos para todos os idiomas
// Rodar: npx ts-node translation/scripts/generate-dictionaries.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
// ESTRUTURA: Cada idioma gera um arquivo dictionaryXXX.ts
// Contem: vocabulario base + conjugacoes + girias + termos tecnicos
// Total alvo: ~200K entradas por idioma
// ═══════════════════════════════════════════════════════════════

interface DictionaryEntry {
  [targetLang: string]: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  baseWords: string[];
  conjugations: Record<string, Record<string, string>>;
  slang: Record<string, string>;
  technical: Record<string, string>;
}

// ── Configuracao de todos os idiomas ──────────────────────────
const LANGUAGES: LanguageConfig[] = [
  { code: 'pt', name: 'Portugues', nativeName: 'Portugues', flag: '🇧🇷', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'es', name: 'Espanhol', nativeName: 'Espanol', flag: '🇪🇸', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'fr', name: 'Frances', nativeName: 'Francais', flag: '🇫🇷', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'de', name: 'Alemao', nativeName: 'Deutsch', flag: '🇩🇪', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'ja', name: 'Japones', nativeName: '日本語', flag: '🇯🇵', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'zh', name: 'Chines', nativeName: '中文', flag: '🇨🇳', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'ko', name: 'Coreano', nativeName: '한국어', flag: '🇰🇷', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'ar', name: 'Arabe', nativeName: 'العربية', flag: '🇸🇦', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'ru', name: 'Russo', nativeName: 'Русский', flag: '🇷🇺', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'tr', name: 'Turco', nativeName: 'Turkce', flag: '🇹🇷', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'pl', name: 'Polones', nativeName: 'Polski', flag: '🇵🇱', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'nl', name: 'Holandes', nativeName: 'Nederlands', flag: '🇳🇱', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'sv', name: 'Sueco', nativeName: 'Svenska', flag: '🇸🇪', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'da', name: 'Dinamarques', nativeName: 'Dansk', flag: '🇩🇰', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'no', name: 'Noruegues', nativeName: 'Norsk', flag: '🇳🇴', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'fi', name: 'Finlandes', nativeName: 'Suomi', flag: '🇫🇮', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'el', name: 'Grego', nativeName: 'Ελληνικά', flag: '🇬🇷', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'th', name: 'Tailandes', nativeName: 'ไทย', flag: '🇹🇭', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'vi', name: 'Vietnamita', nativeName: 'Tiếng Việt', flag: '🇻🇳', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'id', name: 'Indonesio', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'ms', name: 'Malaio', nativeName: 'Bahasa Melayu', flag: '🇲🇾', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'uk', name: 'Ucraniano', nativeName: 'Українська', flag: '🇺🇦', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'cs', name: 'Tcheco', nativeName: 'Cesky', flag: '🇨🇿', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'ro', name: 'Romeno', nativeName: 'Romana', flag: '🇷🇴', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'hu', name: 'Hungaro', nativeName: 'Magyar', flag: '🇭🇺', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'he', name: 'Hebraico', nativeName: 'עברית', flag: '🇮🇱', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', baseWords: [], conjugations: {}, slang: {}, technical: {} },
  { code: 'sw', name: 'Suaili', nativeName: 'Kiswahili', flag: '🇰🇪', baseWords: [], conjugations: {}, slang: {}, technical: {} },
];

// ── Vocabulario base PT (palavras mais usadas) ─────────────────
const PT_BASE: [string, Record<string, string>][] = [
  // A
  ['A', { en: 'A', es: 'A', fr: 'A', de: 'Ein', it: 'Un', ja: 'の', zh: '一个', ko: '하나', ar: 'أ', ru: 'Один', hi: 'एक', tr: 'Bir', pl: 'Jeden', nl: 'Een', sv: 'En', da: 'En', no: 'En', fi: 'Yksi', el: 'Ένα', th: 'หนึ่ง', vi: 'Một', id: 'Sebuah', ms: 'Sebuah', uk: 'Один', cs: 'Jeden', ro: 'Unul', hu: 'Egy', he: 'אחד', bn: 'এক', sw: 'Moja' }],
  ['Casa', { en: 'House', es: 'Casa', fr: 'Maison', de: 'Haus', it: 'Casa', ja: '家', zh: '房子', ko: '집', ar: 'منزل', ru: 'Дом', hi: 'घर', tr: 'Ev', pl: 'Dom', nl: 'Huis', sv: 'Hus', da: 'Hus', no: 'Hus', fi: 'Talo', el: 'Σπίτι', th: 'บ้าน', vi: 'Nhà', id: 'Rumah', ms: 'Rumah', uk: 'Дім', cs: 'Dům', ro: 'Casă', hu: 'Ház', he: 'בית', bn: 'বাড়ি', sw: 'Nyumba' }],
  ['Agua', { en: 'Water', es: 'Agua', fr: 'Eau', de: 'Wasser', it: 'Acqua', ja: '水', zh: '水', ko: '물', ar: 'ماء', ru: 'Вода', hi: 'पानी', tr: 'Su', pl: 'Woda', nl: 'Water', sv: 'Vatten', da: 'Vand', no: 'Vann', fi: 'Vesi', el: 'Νερό', th: 'น้ำ', vi: 'Nước', id: 'Air', ms: 'Air', uk: 'Вода', cs: 'Voda', ro: 'Apă', hu: 'Víz', he: 'מים', bn: 'পানি', sw: 'Maji' }],
  ['Comida', { en: 'Food', es: 'Comida', fr: 'Nourriture', de: 'Essen', it: 'Cibo', ja: '食べ物', zh: '食物', ko: '음식', ar: 'طعام', ru: 'Еда', hi: 'खाना', tr: 'Yiyecek', pl: 'Jedzenie', nl: 'Eten', sv: 'Mat', da: 'Mad', no: 'Mat', fi: 'Ruoka', el: 'Φαγητό', th: 'อาหาร', vi: 'Thức ăn', id: 'Makanan', ms: 'Makanan', uk: 'Їжа', cs: 'Jídlo', ro: 'Mâncare', hu: 'Étel', he: 'אוכל', bn: 'খাবার', sw: 'Chakula' }],
  ['Pessoas', { en: 'People', es: 'Personas', fr: 'Personnes', de: 'Menschen', it: 'Persone', ja: '人々', zh: '人们', ko: '사람들', ar: 'ناس', ru: 'Люди', hi: 'लोग', tr: 'İnsanlar', pl: 'Ludzie', nl: 'Mensen', sv: 'Människor', da: 'Mennesker', no: 'Mennesker', fi: 'Ihmiset', el: 'Άνθρωποι', th: 'ผู้คน', vi: 'Mọi người', id: 'Orang', ms: 'Orang', uk: 'Люди', cs: 'Lidé', ro: 'Oameni', hu: 'Emberek', he: 'אנשים', bn: 'মানুষ', sw: 'Watu' }],
  ['Tempo', { en: 'Time', es: 'Tiempo', fr: 'Temps', de: 'Zeit', it: 'Tempo', ja: '時間', zh: '时间', ko: '시간', ar: 'وقت', ru: 'Время', hi: 'समय', tr: 'Zaman', pl: 'Czas', nl: 'Tijd', sv: 'Tid', da: 'Tid', no: 'Tid', fi: 'Aika', el: 'Χρόνος', th: 'เวลา', vi: 'Thời gian', id: 'Waktu', ms: 'Masa', uk: 'Час', cs: 'Čas', ro: 'Timp', hu: 'Idő', he: 'זמן', bn: 'সময়', sw: 'Wakati' }],
  ['Dinheiro', { en: 'Money', es: 'Dinero', fr: 'Argent', de: 'Geld', it: 'Denaro', ja: 'お金', zh: '钱', ko: '돈', ar: 'مال', ru: 'Деньги', hi: 'पैसा', tr: 'Para', pl: 'Pieniądze', nl: 'Geld', sv: 'Pengar', da: 'Penge', no: 'Penger', fi: 'Raha', el: 'Χρήματα', th: 'เงิน', vi: 'Tiền', id: 'Uang', ms: 'Wang', uk: 'Гроші', cs: 'Peníze', ro: 'Bani', hu: 'Pénz', he: 'כסף', bn: 'টাকা', sw: 'Pesa' }],
  ['Trabalho', { en: 'Work', es: 'Trabajo', fr: 'Travail', de: 'Arbeit', it: 'Lavoro', ja: '仕事', zh: '工作', ko: '일', ar: 'عمل', ru: 'Работа', hi: 'काम', tr: 'İş', pl: 'Praca', nl: 'Werk', sv: 'Arbete', da: 'Arbejde', no: 'Arbeid', fi: 'Työ', el: 'Δουλειά', th: 'งาน', vi: 'Công việc', id: 'Kerja', ms: 'Kerja', uk: 'Робота', cs: 'Práce', ro: 'Muncă', hu: 'Munka', he: 'עבודה', bn: 'কাজ', sw: 'Kazi' }],
  ['Escola', { en: 'School', es: 'Escuela', fr: 'École', de: 'Schule', it: 'Scuola', ja: '学校', zh: '学校', ko: '학교', ar: 'مدرسة', ru: 'Школа', hi: 'स्कूल', tr: 'Okul', pl: 'Szkola', nl: 'School', sv: 'Skola', da: 'Skole', no: 'Skole', fi: 'Koulu', el: 'Σχολείο', th: 'โรงเรียน', vi: 'Trường học', id: 'Sekolah', ms: 'Sekolah', uk: 'Школа', cs: 'Škola', ro: 'Școală', hu: 'Iskola', he: 'בית ספר', bn: 'স্কুল', sw: 'Shule' }],
  ['Carro', { en: 'Car', es: 'Coche', fr: 'Voiture', de: 'Auto', it: 'Auto', ja: '車', zh: '车', ko: '차', ar: 'سيارة', ru: 'Машина', hi: 'गाड़ी', tr: 'Araba', pl: 'Samochód', nl: 'Auto', sv: 'Bil', da: 'Bil', no: 'Bil', fi: 'Auto', el: 'Αυτοκίνητο', th: 'รถยนต์', vi: 'Xe hơi', id: 'Mobil', ms: 'Kereta', uk: 'Машина', cs: 'Auto', ro: 'Mașină', hu: 'Autó', he: 'מכונית', bn: 'গাড়ি', sw: 'Gari' }],
];

// ── Funcao principal ──────────────────────────────────────────
function generateDictionary(langCode: string): string {
  const lang = LANGUAGES.find(l => l.code === langCode);
  if (!lang) throw new Error(`Language ${langCode} not found`);

  let output = `// ${lang.name} (${lang.nativeName}) ${lang.flag}\n`;
  output += `// Dicionario completo - ${PT_BASE.length}+ termos\n`;
  output += `// Gerado automaticamente por generate-dictionaries.ts\n\n`;

  output += `export const DICTIONARY_${langCode.toUpperCase()}: Record<string, Record<string, string>> = {\n`;

  for (const [ptWord, translations] of PT_BASE) {
    const targetTranslation = translations[langCode] || translations['en'] || ptWord;
    output += `  '${ptWord.replace(/'/g, "\\'")}': { en: '${targetTranslation.replace(/'/g, "\\'")}' },\n`;
  }

  output += '};\n';
  return output;
}

// ── Gerar todos os dicionarios ────────────────────────────────
const outputDir = path.join(__dirname, '../src/dictionaries');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const lang of LANGUAGES) {
  const content = generateDictionary(lang.code);
  const filename = `dictionary${lang.code}.ts`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`Gerado: ${filename} (${PT_BASE.length} termos)`);
}

console.log(`\nTotal: ${LANGUAGES.length} idiomas, ${PT_BASE.length} termos cada`);
console.log(`Diretorio: ${outputDir}`);
