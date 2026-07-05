// src/core/sentencer.ts
// Tradutor de frases: tokeniza → traduz cada token → reordena → monta

import type { Language } from './types';
import { lookupByText } from './dictionary';
import { conjugate, detectConjugation } from './conjugation';
import { applyRules } from './rules';
import { applyReorder } from './reorder';

// ── Stopwords (passam direto, não traduzidas) ──────────────
const STOPWORDS: Record<string, Set<string>> = {
  en: new Set(['i','you','he','she','it','we','they','the','a','an','is','are','was','were','have','has','had','do','does','did','will','would','could','should','can','may','might','must','to','of','in','for','on','with','at','by','from','as','into','and','but','or','not','no','so','if','then','than','that','this','my','your','his','her','its','our','their']),
  es: new Set(['yo','tú','él','ella','nosotros','ellos','ellas','el','la','los','las','un','una','es','son','está','están','ser','estar','haber','tener','hacer','de','del','en','para','por','con','sin','sobre','entre','y','o','ni','pero','que','como','si','mi','tu','su','no','muy','mucho']),
  fr: new Set(['je','tu','il','elle','nous','vous','ils','elles','le','la','les','un','une','des','est','sont','être','avoir','faire','de','du','des','en','pour','par','avec','sans','sur','entre','et','ou','ni','mais','que','comme','si','mon','ton','son','notre','votre','leur','ne','pas']),
  de: new Set(['ich','du','er','sie','es','wir','ihr','der','die','das','ein','eine','ist','sind','war','waren','sein','haben','werden','machen','von','in','für','mit','auf','an','aus','bei','nach','über','unter','vor','zwischen','durch','gegen','ohne','um','und','oder','aber','dass','wenn','wie','als','nicht','auch']),
};

// ── Tokenização ────────────────────────────────────────────
interface Token { text: string; type: 'word' | 'punctuation' | 'number' | 'space'; }

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Regex: palavras OU números (com vírgula decimal e %) OU pontuação OU espaços
  const re = /([A-Za-zÀ-ÿ]+|\d+(?:[.,]\d+)?%?(?:°[CFc]|mm|km\/h)?|\d+-\d+|[^\s]|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    if (/^\s+$/.test(raw)) tokens.push({ text: raw, type: 'space' });
    else if (/^\d/.test(raw)) tokens.push({ text: raw, type: 'number' });
    else if (/^[A-Za-zÀ-ÿ]+$/.test(raw)) tokens.push({ text: raw, type: 'word' });
    else tokens.push({ text: raw, type: 'punctuation' });
  }
  return tokens;
}

// ── Detecção de idioma por stopwords ───────────────────────
export function detectLanguage(text: string): Language {
  const words = text.toLowerCase().split(/\s+/);
  const scores: Record<string, number> = {};
  for (const [lang, stops] of Object.entries(STOPWORDS)) {
    scores[lang] = 0;
    for (const w of words) { if (stops.has(w)) scores[lang]++; }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return best[0][1] > 0 ? best[0][0] as Language : 'pt';
}

// ── Resultado ──────────────────────────────────────────────
export interface SentenceResult {
  original: string;
  translated: string;
  confidence: number;
  tokensTranslated: number;
  tokensTotal: number;
  language: Language;
}

// ── Tradução word-by-word com regras ───────────────────────
export function translateSentence(
  text: string,
  source: Language,
  target: Language,
): SentenceResult {
  if (source === target) {
    return { original: text, translated: text, confidence: 1, tokensTranslated: 0, tokensTotal: 0, language: source };
  }

  const tokens = tokenize(text);
  const translated: string[] = [];
  let matched = 0;

  for (const token of tokens) {
    if (token.type !== 'word') { translated.push(token.text); continue; }

    const lower = token.text.toLowerCase();

    // 1. Dicionário direto
    const dict = lookupByText(lower, target);
    if (dict) { translated.push(dict); matched++; continue; }

    // 2. Conjugação verbal
    const conj = detectConjugation(lower);
    if (conj) {
      const c = conjugate(conj.verb, target, conj.tense as any);
      if (c) { translated.push(c); matched++; continue; }
    }

    // 3. Regras gramaticais
    const ruleResult = applyRules(lower, source, target);
    if (ruleResult !== lower) { translated.push(ruleResult); matched++; continue; }

    // 4. Mantém original
    translated.push(token.text);
  }

  // Reconstrói frase
  let result = '';
  for (let i = 0; i < translated.length; i++) {
    if (i > 0 && translated[i - 1] !== ' ' && translated[i] !== ' '
        && !',.!?;:'.includes(translated[i])) {
      result += ' ';
    }
    result += translated[i];
  }

  // Aplica reordenação
  result = applyReorder(result, target);

  const wordCount = tokens.filter(t => t.type === 'word').length;

  return {
    original: text,
    translated: result.trim(),
    confidence: wordCount > 0 ? matched / wordCount : 0,
    tokensTranslated: matched,
    tokensTotal: wordCount,
    language: source,
  };
}
