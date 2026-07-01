// translation/scripts/generate-with-api.ts
// Gera dicionarios usando API gratuita de traducao

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Palavras base por categoria ──────────────────────────────
const WORD_CATEGORIES = {
  common: [
    'hello', 'goodbye', 'please', 'thank', 'sorry', 'yes', 'no',
    'good', 'bad', 'big', 'small', 'new', 'old', 'fast', 'slow',
    'hot', 'cold', 'easy', 'hard', 'right', 'wrong', 'true', 'false',
    'love', 'hate', 'happy', 'sad', 'beautiful', 'ugly', 'rich', 'poor',
    'man', 'woman', 'child', 'friend', 'enemy', 'teacher', 'student',
    'house', 'car', 'food', 'water', 'money', 'time', 'work', 'rest',
  ],
  fitness: [
    'workout', 'exercise', 'muscle', 'strength', 'cardio', 'flexibility',
    'stamina', 'endurance', 'reps', 'sets', 'warmup', 'cooldown',
    'chest', 'back', 'legs', 'arms', 'shoulders', 'core', 'abs',
    'bench press', 'squat', 'deadlift', 'pullup', 'pushup', 'plank',
    'bicep curl', 'tricep extension', 'lateral raise', 'leg press',
    'treadmill', 'rowing', 'cycling', 'swimming', 'running',
    'protein', 'carbs', 'calories', 'macros', 'supplements',
    'weight', 'height', 'bmi', 'body fat', 'muscle mass',
  ],
  tech: [
    'computer', 'phone', 'tablet', 'screen', 'keyboard', 'mouse',
    'internet', 'wifi', 'bluetooth', 'software', 'hardware', 'app',
    'download', 'upload', 'cloud', 'server', 'database', 'code',
    'website', 'browser', 'email', 'password', 'login', 'logout',
  ],
  food: [
    'apple', 'banana', 'orange', 'grape', 'strawberry', 'mango',
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna',
    'rice', 'pasta', 'bread', 'cheese', 'milk', 'egg',
    'salad', 'soup', 'sandwich', 'pizza', 'sushi', 'steak',
    'coffee', 'tea', 'juice', 'water', 'beer', 'wine',
  ],
  nature: [
    'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind',
    'tree', 'flower', 'grass', 'mountain', 'river', 'ocean', 'lake',
    'forest', 'desert', 'island', 'beach', 'earth', 'sea', 'land',
  ],
};

// ── Configuracao de idiomas alvo ─────────────────────────────
const TARGET_LANGUAGES = [
  { code: 'es', name: 'Espanhol', apiKey: 'es' },
  { code: 'fr', name: 'Frances', apiKey: 'fr' },
  { code: 'de', name: 'Alemao', apiKey: 'de' },
  { code: 'it', name: 'Italiano', apiKey: 'it' },
  { code: 'ru', name: 'Russo', apiKey: 'ru' },
  { code: 'ja', name: 'Japones', apiKey: 'ja' },
  { code: 'ko', name: 'Coreano', apiKey: 'ko' },
  { code: 'ar', name: 'Arabe', apiKey: 'ar' },
  { code: 'hi', name: 'Hindi', apiKey: 'hi' },
  { code: 'tr', name: 'Turco', apiKey: 'tr' },
];

// ── Funcao de traducao via MyMemory API (gratuita) ──────────
async function translateWord(word: string, from: string, to: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${from}|${to}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.responseData?.translatedText || word;
  } catch {
    return word;
  }
}

// ── Funcao principal ─────────────────────────────────────────
async function generateDictionaries() {
  const outputDir = path.join(__dirname, '../src/dictionaries');

  // Carrega palavras existentes do dicionario PT
  const ptDictPath = path.join(outputDir, 'dictionarypt.ts');
  let existingPT: Record<string, Record<string, string>> = {};

  if (fs.existsSync(ptDictPath)) {
    const content = fs.readFileSync(ptDictPath, 'utf8');
    // Extrai do formato TS
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        existingPT = JSON.parse(match[0]);
      } catch {}
    }
  }

  console.log(`Palavras existentes: ${Object.keys(existingPT).length}`);

  // Adiciona novas palavras de todos os categorias
  const allWords = new Set<string>();
  for (const words of Object.values(WORD_CATEGORIES)) {
    for (const word of words) allWords.add(word);
  }

  console.log(`Palavras novas para traduzir: ${allWords.size}`);

  // Para cada idioma alvo, traduz e adiciona ao dicionario
  for (const lang of TARGET_LANGUAGES) {
    const dictPath = path.join(outputDir, `dictionary${lang.code}.ts`);

    // Carrega dicionario existente do idioma
    let existingLang: Record<string, Record<string, string>> = {};
    if (fs.existsSync(dictPath)) {
      const content = fs.readFileSync(dictPath, 'utf8');
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { existingLang = JSON.parse(match[0]); } catch {}
      }
    }

    // Traduz palavras novas
    let translated = 0;
    for (const word of allWords) {
      if (!existingLang[word]) {
        const translation = await translateWord(word, 'en', lang.apiKey);
        existingLang[word] = { en: translation };
        translated++;

        // Rate limit: 1 traducao por segundo (MyMemory gratis)
        await new Promise(r => setTimeout(r, 1100));
      }
    }

    // Gera o arquivo
    let output = `// ${lang.name}\n`;
    output += `// Dicionario completo\n\n`;
    output += `export const DICTIONARY_${lang.code.toUpperCase()}: Record<string, Record<string, string>> = {\n`;
    for (const [key, val] of Object.entries(existingLang)) {
      const en = val.en || key;
      output += `  '${key.replace(/'/g, "\\'")}': { en: '${en.replace(/'/g, "\\'")}' },\n`;
    }
    output += '};\n';

    fs.writeFileSync(dictPath, output);
    console.log(`${lang.name}: ${Object.keys(existingLang).length} palavras (${translated} novas)`);
  }

  console.log('\nDicionarios atualizados com sucesso!');
}

// ── Rodar ────────────────────────────────────────────────────
generateDictionaries().catch(console.error);
