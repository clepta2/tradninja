// translation/scripts/expand-dictionaries.ts
// Expande dicionarios com 30 idiomas completos

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANGUAGES = [
  { code: 'pt', name: 'Portugues', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Espanhol', flag: '🇪🇸' },
  { code: 'fr', name: 'Frances', flag: '🇫🇷' },
  { code: 'de', name: 'Alemao', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japones', flag: '🇯🇵' },
  { code: 'zh', name: 'Chines', flag: '🇨🇳' },
  { code: 'ko', name: 'Coreano', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦' },
  { code: 'ru', name: 'Russo', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'tr', name: 'Turco', flag: '🇹🇷' },
  { code: 'pl', name: 'Polones', flag: '🇵🇱' },
  { code: 'nl', name: 'Holandes', flag: '🇳🇱' },
  { code: 'sv', name: 'Sueco', flag: '🇸🇪' },
  { code: 'da', name: 'Dinamarques', flag: '🇩🇰' },
  { code: 'no', name: 'Noruegues', flag: '🇳🇴' },
  { code: 'fi', name: 'Finlandes', flag: '🇫🇮' },
  { code: 'el', name: 'Grego', flag: '🇬🇷' },
  { code: 'th', name: 'Tailandes', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamita', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesio', flag: '🇮🇩' },
  { code: 'ms', name: 'Malaio', flag: '🇲🇾' },
  { code: 'uk', name: 'Ucraniano', flag: '🇺🇦' },
  { code: 'cs', name: 'Tcheco', flag: '🇨🇿' },
  { code: 'ro', name: 'Romeno', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungaro', flag: '🇭🇺' },
  { code: 'he', name: 'Hebraico', flag: '🇮🇱' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'sw', name: 'Suaili', flag: '🇰🇪' },
];

function escape(s: string): string {
  return s.replace(/'/g, "\\'");
}

function generateDictionary(langCode: string): string {
  const lang = LANGUAGES.find(l => l.code === langCode);
  if (!lang) throw new Error(`Language ${langCode} not found`);

  let out = `// ${lang.name} ${lang.flag}\n`;
  out += `// Dicionario completo - traducoes PT→${lang.name}\n\n`;
  out += `export const DICTIONARY_${langCode.toUpperCase()}: Record<string, { en: string }> = {\n`;

  // Carrega do arquivo base se existir
  const basePath = path.join(__dirname, 'base-words.json');
  if (fs.existsSync(basePath)) {
    const baseWords = JSON.parse(fs.readFileSync(basePath, 'utf-8'));
    for (const [pt, translations] of Object.entries(baseWords) as [string, Record<string, string>][]) {
      const target = translations[langCode] || translations['en'] || pt;
      out += `  '${escape(pt)}': { en: '${escape(target)}' },\n`;
    }
  }

  out += '};\n';
  return out;
}

const outputDir = path.join(__dirname, '../src/dictionaries');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const lang of LANGUAGES) {
  const content = generateDictionary(lang.code);
  const filename = `dictionary${lang.code}.ts`;
  fs.writeFileSync(path.join(outputDir, filename), content);
  console.log(`Gerado: ${filename}`);
}

console.log(`\nTotal: ${LANGUAGES.length} idiomas`);
