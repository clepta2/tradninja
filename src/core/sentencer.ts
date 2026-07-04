// src/core/sentencer.ts
// Tradutor de frases: decompõe → traduz → reordena → monta

import type { Language } from './types';
import { lookupByText } from './dictionary';
import { conjugate, detectConjugation } from './conjugation';
import { applyRules, getAdjective } from './rules';

// ── Stopwords (não traduzir, passam direto) ────────────────
const STOPWORDS: Record<string, Set<string>> = {
  en: new Set(['i','you','he','she','it','we','they','the','a','an','is','are','was','were','have','has','had','do','does','did','will','would','could','should','can','may','might','must','to','of','in','for','on','with','at','by','from','as','into','and','but','or','not','no','so','if','then','than','that','this','my','your','his','her','its','our','their','some','any','all','each','every','few','more','most','other','such','what','which','who','whom','whose','when','where','how','why','very','too','also','just','now','here','there','only','even','still','already','yet','never','always','often','sometimes','usually','quite','rather','pretty','really','almost','enough','much','many','little','well','badly','fast','slowly']),
  es: new Set(['yo','tú','él','ella','nosotros','ellos','ellas','el','la','los','las','un','una','es','son','está','están','ser','estar','haber','tener','hacer','de','del','en','para','por','con','sin','sobre','entre','hacia','desde','hasta','y','o','ni','pero','sino','que','como','si','este','esta','mi','tu','su','nuestro','no','muy','mucho','poco','todo','nada','algo','alguien','nadie','cada','otro','mismo']),
  fr: new Set(['je','tu','il','elle','nous','vous','ils','elles','le','la','les','un','une','des','est','sont','être','avoir','faire','de','du','des','en','pour','par','avec','sans','sur','entre','vers','depuis','et','ou','ni','mais','donc','car','que','comme','si','mon','ton','son','notre','votre','leur','ne','pas','plus','moins','très','tout','rien','quelque','chaque','autre','même','aussi','bien','mal','vraiment']),
  de: new Set(['ich','du','er','sie','es','wir','ihr','der','die','das','ein','eine','ist','sind','war','waren','sein','haben','werden','machen','von','in','für','mit','auf','an','aus','bei','nach','über','unter','vor','zwischen','durch','gegen','ohne','um','und','oder','aber','sondern','denn','dass','wenn','wie','als','mein','dein','nicht','auch','noch','schon','nur','sehr','viel','wenig','alle','jeder','manche','kein']),
};

// ── Regras de reordenação PT → target ──────────────────────
// PT: SVO (Sujeito-Verbo-Objeto) — mesmo que EN/ES
// Mas adjetivos e advérbios mudam de posição

interface ReorderRule {
  pattern: RegExp;
  replace: (match: RegExpMatchArray) => string;
}

const REORDER_RULES: Record<string, ReorderRule[]> = {
  en: [
    // PT "adjetivo + substantivo" → EN "substantivo + adjetivo"
    { pattern: /\b(bom|mau|grande|pequeno|novo|velho|forte|fraco|rápido|lento|bonito|feio)\b\s+(\w+)/gi,
      replace: (m) => { const adj = m[1].toLowerCase(); const noun = m[2]; const map: Record<string,string> = { bom:'good',mau:'bad',grande:'big',pequeno:'small',novo:'new',velho:'old',forte:'strong',fraco:'weak',rápido:'fast',lento:'slow',bonito:'pretty',feio:'ugly' }; return noun + ' ' + (map[adj] || adj); }
    },
    // PT "advérbio + verbo" → EN "verbo + advérbio"
    { pattern: /\b(sempre|nunca|às vezes|muitas vezes|raramente|geralmente)\s+(\w+)/gi,
      replace: (m) => { const adv = m[1].toLowerCase(); const verb = m[2]; const map: Record<string,string> = { 'sempre':'always','nunca':'never','às vezes':'sometimes','muitas vezes':'often','raramente':'rarely','geralmente':'usually' }; return verb + ' ' + (map[adv] || adv); }
    },
  ],
  es: [
    // PT "advérbio + verbo" → ES "verbo + advérbio"
    { pattern: /\b(sempre|nunca|às vezes|muitas vezes|raramente|geralmente)\s+(\w+)/gi,
      replace: (m) => { const adv = m[1].toLowerCase(); const verb = m[2]; const map: Record<string,string> = { 'sempre':'siempre','nunca':'nunca','às veces':'a veces','muitas vezes':'muchas veces','raramente':'raramente','geralmente':'generalmente' }; return verb + ' ' + (map[adv] || adv); }
    },
  ],
};

// ── Detecção de idioma ─────────────────────────────────────
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

// ── Tokenização ────────────────────────────────────────────
interface Token { text: string; type: 'word' | 'punctuation' | 'number' | 'space'; }

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /([A-Za-zÀ-ÿ]+|\d+|[^\s]|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    if (/^\s+$/.test(raw)) tokens.push({ text: raw, type: 'space' });
    else if (/^\d+$/.test(raw)) tokens.push({ text: raw, type: 'number' });
    else if (/^[A-Za-zÀ-ÿ]+$/.test(raw)) tokens.push({ text: raw, type: 'word' });
    else tokens.push({ text: raw, type: 'punctuation' });
  }
  return tokens;
}

// ── Tradução de frase ──────────────────────────────────────
export interface SentenceResult {
  original: string;
  translated: string;
  confidence: number;
  tokensTranslated: number;
  tokensTotal: number;
  language: Language;
}

export function translateSentence(text: string, source: Language, target: Language): SentenceResult {
  if (source === target) return { original: text, translated: text, confidence: 1, tokensTranslated: 0, tokensTotal: 0, language: source };

  const tokens = tokenize(text);
  const translated: string[] = [];
  let matched = 0;

  for (const token of tokens) {
    if (token.type === 'space' || token.type === 'number' || token.type === 'punctuation') {
      translated.push(token.text);
      continue;
    }
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

    // 3. Gramática (artigos, possessivos, negação, preposições)
    const ruleResult = applyRules(lower, source, target);
    if (ruleResult !== lower) { translated.push(ruleResult); matched++; continue; }

    // 4. Mantém original
    translated.push(token.text);
  }

  // Reconstrói frase
  let result = '';
  for (let i = 0; i < translated.length; i++) {
    if (i > 0 && translated[i - 1] !== ' ' && translated[i] !== ' ' && translated[i] !== ',' && translated[i] !== '.' && translated[i] !== '!' && translated[i] !== '?') {
      result += ' ';
    }
    result += translated[i];
  }

  // Aplica reordenação
  const reorderRules = REORDER_RULES[target];
  if (reorderRules) {
    for (const rule of reorderRules) {
      result = result.replace(rule.pattern, rule.replace as any);
    }
  }

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
