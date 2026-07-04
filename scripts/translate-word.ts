/**
 * Traduz cada palavra individualmente e salva imediatamente.
 * Pode ser interrompido e retomado de onde parou.
 *
 * Uso:
 *   npx tsx scripts/translate-word.ts            # traduz todos
 *   npx tsx scripts/translate-word.ts --lang en  # só inglês
 *   npx tsx scripts/translate-word.ts --resume   # retoma do último ponto
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const I18N_DIR = path.resolve(__dirname, '../src/i18n');

// ── Configuração ──────────────────────────────────────────────
const DELAY_MS = 200;        // delay entre requests
const SAVE_EVERY = 50;       // salva a cada N palavras
const MAX_RETRIES = 3;       // retentativas por palavra
const PROGRESS_FILE = path.join(I18N_DIR, 'progress.json');

// ── API de tradução ───────────────────────────────────────────
// Google Translate interno (sem chave, sem limite diário)
async function fetchTranslation(word: string, from: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(word)}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json() as any;

  // Google retorna [[["tradução","original",...],...],...]
  if (data?.[0]?.[0]?.[0]) {
    return data[0][0][0] as string;
  }

  throw new Error('Resposta inesperada da API');
}

// ── Tipos ─────────────────────────────────────────────────────
interface Progress {
  en: Record<string, string>;
  es: Record<string, string>;
  fr: Record<string, string>;
  enDone: string[];
  esDone: string[];
  frDone: string[];
}

// ── Persistência ──────────────────────────────────────────────
function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { en: {}, es: {}, fr: {}, enDone: [], esDone: [], frDone: [] };
}

function saveProgress(p: Progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2), 'utf-8');
}

function saveLangJson(lang: string, data: Record<string, string>) {
  fs.writeFileSync(path.join(I18N_DIR, `${lang}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

// ── Lógica principal ──────────────────────────────────────────
async function translateWord(
  word: string,
  from: string,
  to: string,
  retries = MAX_RETRIES
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await fetchTranslation(word, from, to);
      return result;
    } catch (e: any) {
      if (attempt < retries - 1) {
        await sleep(1000 * (attempt + 1));
      } else {
        throw e;
      }
    }
  }
  return word; // fallback
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function translateLang(
  lang: string,
  words: string[],
  progress: Progress,
  doneList: string[]
): Promise<void> {
  const langProgress = progress[lang as keyof Progress] as Record<string, string>;
  const remaining = words.filter(w => !langProgress[w] && !doneList.includes(w));

  if (remaining.length === 0) {
    console.log(`  ✅ ${lang}: completo (${words.length} palavras)`);
    return;
  }

  console.log(`  🔄 ${lang}: ${remaining.length} restantes...`);

  let count = 0;
  let saveCount = 0;

  for (const word of remaining) {
    try {
      const translated = await translateWord(word, 'pt', lang);
      langProgress[word] = translated;
      doneList.push(word);
      count++;
      saveCount++;

      // Salva progresso periodicamente
      if (saveCount >= SAVE_EVERY) {
        saveProgress(progress);
        saveLangJson(lang, langProgress);
        saveCount = 0;
      }

      process.stdout.write(`    ${lang}: ${count}/${remaining.length} | última: "${word}" → "${translated}"\r`);
    } catch (e: any) {
      console.error(`\n    ⚠️  Erro "${word}": ${e.message}`);
      langProgress[word] = word; // mantém original em caso de erro
      doneList.push(word);
      count++;
    }

    await sleep(DELAY_MS);
  }

  // Salva tudo no final
  saveProgress(progress);
  saveLangJson(lang, langProgress);
  console.log(`\n  ✅ ${lang}: ${count} palavras traduzidas e salvas`);
}

// ── CLI ───────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const langArg = args.find(a => a.startsWith('--lang'));
  const lang = langArg ? args[args.indexOf(langArg) + 1] : null;
  const resume = args.includes('--resume');
  return { lang, resume };
}

async function main() {
  const { lang, resume } = parseArgs();

  console.log('🌐 Tradutor palavra por palavra (Google Translate)\n');

  // Lê palavras PT
  const ptPath = path.join(I18N_DIR, 'pt.json');
  const pt: Record<string, string> = JSON.parse(fs.readFileSync(ptPath, 'utf-8'));
  const words = Object.keys(pt);
  console.log(`📝 ${words.length} palavras PT\n`);

  // Carrega ou cria progresso
  const progress = loadProgress();

  if (resume) {
    console.log('🔄 Retomando do último ponto salvo...\n');
  }

  // Define quais idiomas traduzir
  const langs = lang ? [lang] : ['en', 'es', 'fr'];

  for (const l of langs) {
    const doneList = l === 'en' ? progress.enDone
      : l === 'es' ? progress.esDone
      : progress.frDone;

    await translateLang(l, words, progress, doneList);
  }

  console.log('\n✨ Todas as traduções salvas!');
  console.log(`   Arquivos: en.json, es.json, fr.json`);
  console.log(`   Progresso: progress.json`);
}

main().catch(console.error);
