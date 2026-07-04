/**
 * Script para traduzir todas as palavras do dicionário usando NVIDIA NIM API.
 *
 * Uso:
 *   npx tsx scripts/translate-dictionaries.ts
 *
 * Lê src/i18n/pt.json como fonte (chaves PT) e gera traduções corretas
 * para EN, ES e FR usando DeepSeek V4-Flash via NVIDIA NIM.
 *
 * Progresso é salvo em src/i18n/progress.json para poder ser retomado.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_DIR = path.resolve(__dirname, '../src/i18n');
const PROGRESS_FILE = path.join(I18N_DIR, 'progress.json');
const BATCH_SIZE = 50; // palavras por requisição
const DELAY_MS = 500;  // delay entre batches para não sobrecarregar

const API_KEY = process.env.NVIDIA_API_KEY || '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';
const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'deepseek-ai/deepseek-v4-flash';

interface Progress {
  ptWords: string[];
  enTranslations: Record<string, string>;
  esTranslations: Record<string, string>;
  frTranslations: Record<string, string>;
  lastBatchIndex: number;
  completed: boolean;
}

function loadProgress(): Progress | null {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return null;
}

function saveProgress(progress: Progress): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

async function translateBatch(
  words: string[],
  targetLang: string,
  langName: string
): Promise<Record<string, string>> {
  const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n');

  const prompt = `You are a professional translator. Translate each Portuguese word to ${langName}.

IMPORTANT RULES:
- Return ONLY a JSON object with the translations
- Keep the exact same keys (Portuguese words)
- Values must be the ${langName} translation of each word
- For proper nouns (names like "João", "Maria", "Pedro"), keep them unchanged
- For words with multiple meanings, use the most common translation
- Do NOT add explanations, just the JSON

Input words:
${wordList}

Output format (JSON only):
{"word1": "translation1", "word2": "translation2", ...}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a precise translator. Return only valid JSON, no explanations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from the response (might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${content.substring(0, 200)}`);
    }

    const translations = JSON.parse(jsonMatch[0]) as Record<string, string>;

    // Validate: all words should have translations
    const result: Record<string, string> = {};
    for (const word of words) {
      if (translations[word] !== undefined) {
        result[word] = translations[word];
      } else {
        // Fallback: keep original word
        result[word] = word;
      }
    }

    return result;
  } catch (error: any) {
    console.error(`   ❌ Erro no batch: ${error.message}`);
    // Return fallback: keep original words
    const result: Record<string, string> = {};
    for (const word of words) {
      result[word] = word;
    }
    return result;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🌐 Traduzindo dicionários via NVIDIA NIM (DeepSeek V4-Flash)...\n');

  // Load PT source words
  const ptPath = path.join(I18N_DIR, 'pt.json');
  if (!fs.existsSync(ptPath)) {
    console.error('❌ pt.json não encontrado!');
    process.exit(1);
  }

  const ptData: Record<string, string> = JSON.parse(fs.readFileSync(ptPath, 'utf-8'));
  const ptWords = Object.keys(ptData);
  console.log(`📝 Total de palavras PT: ${ptWords.length}\n`);

  // Load or create progress
  let progress = loadProgress();
  if (!progress || progress.completed) {
    progress = {
      ptWords,
      enTranslations: {},
      esTranslations: {},
      frTranslations: {},
      lastBatchIndex: -1,
      completed: false,
    };
  }

  const totalBatches = Math.ceil(ptWords.length / BATCH_SIZE);
  const startIndex = progress.lastBatchIndex + 1;

  if (startIndex > 0) {
    console.log(`🔄 Retomando do batch ${startIndex + 1}/${totalBatches}`);
    console.log(`   EN: ${Object.keys(progress.enTranslations).length} traduzidas`);
    console.log(`   ES: ${Object.keys(progress.esTranslations).length} traduzidas`);
    console.log(`   FR: ${Object.keys(progress.frTranslations).length} traduzidas\n`);
  }

  const targets: Array<{ lang: string; name: string; field: 'enTranslations' | 'esTranslations' | 'frTranslations' }> = [
    { lang: 'en', name: 'English', field: 'enTranslations' },
    { lang: 'es', name: 'Spanish', field: 'esTranslations' },
    { lang: 'fr', name: 'French', field: 'frTranslations' },
  ];

  for (const target of targets) {
    console.log(`\n🌍 Traduzindo para ${target.name}...`);

    for (let i = startIndex; i < totalBatches; i++) {
      const batchStart = i * BATCH_SIZE;
      const batch = ptWords.slice(batchStart, batchStart + BATCH_SIZE);

      const alreadyDone = batch.every(w => progress[target.field][w] !== undefined);
      if (alreadyDone) {
        process.stdout.write(`   Batch ${i + 1}/${totalBatches} (já traduzido, pulando)\r`);
        continue;
      }

      process.stdout.write(`   Batch ${i + 1}/${totalBatches}: ${batch[0]}...${batch[batch.length - 1]}   \r`);

      const translations = await translateBatch(batch, target.lang, target.name);
      Object.assign(progress[target.field], translations);

      progress.lastBatchIndex = i;
      saveProgress(progress);

      await delay(DELAY_MS);
    }

    console.log(`   ✅ ${target.name}: ${Object.keys(progress[target.field]).length} traduções concluídas`);
  }

  // Mark as completed
  progress.completed = true;
  progress.lastBatchIndex = totalBatches - 1;
  saveProgress(progress);

  // Generate final JSON files
  console.log('\n📁 Gerando arquivos JSON finais...');

  for (const target of targets) {
    const outPath = path.join(I18N_DIR, `${target.lang}.json`);
    const orderedData: Record<string, string> = {};

    for (const word of ptWords) {
      orderedData[word] = progress[target.field][word] || word;
    }

    fs.writeFileSync(outPath, JSON.stringify(orderedData, null, 2), 'utf-8');
    console.log(`   ✅ ${target.lang}.json: ${Object.keys(orderedData).length} entradas`);
  }

  console.log('\n✨ Tradução concluída!');
  console.log(`   Arquivos gerados em: ${I18N_DIR}`);
}

main().catch(console.error);
