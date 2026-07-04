/**
 * Tradução rápida de dicionários usando API gratuita (MyMemory).
 * Sem dependências externas - usa fetch nativo do Node.js.
 *
 * Uso: npx tsx scripts/translate-fast.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const I18N_DIR = path.resolve(__dirname, '../src/i18n');

const BATCH = 100; // palavras por chamada
const DELAY = 300; // ms entre chamadas

interface Dict { [key: string]: string }

// ── MyMemory API (gratuita, sem chave) ────────────────────────
async function translateChunk(
  words: string[],
  from: string,
  to: string
): Promise<Record<string, string>> {
  // MyMemory aceita múltiplas palavras separadas por " | "
  const query = words.map(w => w.replace(/\|/g, '')).join(' | ');

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${from}|${to}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as any;

  const result: Record<string, string> = {};

  if (data.responseData?.translatedText) {
    const translated = data.responseData.translatedText as string;
    // MyMemory às vezes retorna o texto separado por " | "
    const parts = translated.split(' | ').map((s: string) => s.trim());

    for (let i = 0; i < words.length; i++) {
      const src = words[i];
      const tgt = parts[i];
      if (tgt && tgt.toLowerCase() !== src.toLowerCase()) {
        result[src] = tgt;
      } else {
        result[src] = src; // mantém original se não traduziu
      }
    }
  } else {
    // Fallback: mantém original
    for (const w of words) result[w] = w;
  }

  return result;
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function loadJson(file: string): Dict {
  const p = path.join(I18N_DIR, file);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function saveJson(file: string, data: Dict) {
  fs.writeFileSync(path.join(I18N_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

async function translateLang(
  lang: string,
  from: string,
  words: string[],
  progress: Dict
): Promise<Dict> {
  const out: Dict = { ...progress };
  const todo = words.filter(w => !out[w]);
  const total = todo.length;

  if (total === 0) {
    console.log(`  ✅ ${lang}: já completo (${words.length} palavras)`);
    return out;
  }

  console.log(`  🔄 ${lang}: ${total} palavras para traduzir...`);

  const chunks: string[][] = [];
  for (let i = 0; i < todo.length; i += BATCH) {
    chunks.push(todo.slice(i, i + BATCH));
  }

  let done = 0;
  for (const chunk of chunks) {
    try {
      const translations = await translateChunk(chunk, from, lang);
      Object.assign(out, translations);
      done += chunk.length;
      process.stdout.write(`    ${done}/${total} (${Math.round(done / total * 100)}%)\r`);
    } catch (e: any) {
      console.error(`\n    ⚠️  Erro chunk: ${e.message} — pulando`);
    }
    await delay(DELAY);
  }

  console.log(`\n  ✅ ${lang}: ${done}/${total} traduzidas`);
  return out;
}

async function main() {
  console.log('🌐 Tradução rápida via MyMemory API (gratuita)\n');

  const pt = loadJson('pt.json');
  const words = Object.keys(pt);
  console.log(`📝 ${words.length} palavras PT\n`);

  // Carrega progresso existente
  let en = loadJson('en.json');
  let es = loadJson('es.json');
  let fr = loadJson('fr.json');

  // Filtra só palavras que ainda não estão corretas
  // (compara se a tradução atual não é igual à chave PT = não traduziu)
  const needsEn = words.filter(w => en[w] === w || !en[w]);
  const needsEs = words.filter(w => es[w] === w || !es[w]);
  const needsFr = words.filter(w => fr[w] === w || !fr[w]);

  console.log(`📊 Precisam de tradução:`);
  console.log(`   EN: ${needsEn.length}`);
  console.log(`   ES: ${needsEs.length}`);
  console.log(`   FR: ${needsFr.length}\n`);

  // Traduz em paralelo os 3 idiomas
  console.log('🚀 Iniciando traduções...\n');

  const [enNew, esNew, frNew] = await Promise.all([
    translateLang('en', 'pt', words, en),
    translateLang('es', 'pt', words, es),
    translateLang('fr', 'pt', words, fr),
  ]);

  // Salva resultados
  console.log('\n💾 Salvando arquivos...');
  saveJson('en.json', enNew);
  saveJson('es.json', esNew);
  saveJson('fr.json', frNew);

  // Stats
  const enCorrect = words.filter(w => enNew[w] !== w).length;
  const esCorrect = words.filter(w => esNew[w] !== w).length;
  const frCorrect = words.filter(w => frNew[w] !== w).length;

  console.log(`\n✨ Concluído!`);
  console.log(`   EN: ${enCorrect}/${words.length} traduzidas`);
  console.log(`   ES: ${esCorrect}/${words.length} traduzidas`);
  console.log(`   FR: ${frCorrect}/${words.length} traduzidas`);
}

main().catch(console.error);
