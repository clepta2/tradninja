// src/core/sentencer.ts
// Tradutor de frases: decompõe frase → traduz palavras → reordena → monta

import type { Language } from './types';
import { lookupByText } from './dictionary';
import { conjugate, detectConjugation } from './conjugation';

// ── Stopwords por idioma (não traduzir) ────────────────────
const STOPWORDS: Record<string, Set<string>> = {
  en: new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'shall', 'must', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'and', 'but', 'or', 'nor', 'not', 'no', 'so', 'if', 'then', 'than', 'that', 'this', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their']),
  es: new Set(['yo', 'tú', 'él', 'ella', 'nosotros', 'ellos', 'ellas', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'es', 'son', 'está', 'están', 'fue', 'fueron', 'ser', 'estar', 'haber', 'tener', 'hacer', 'de', 'del', 'en', 'para', 'por', 'con', 'sin', 'sobre', 'entre', 'hacia', 'desde', 'hasta', 'según', 'ante', 'bajo', 'contra', 'y', 'o', 'ni', 'pero', 'sino', 'que', 'como', 'si', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'mi', 'tu', 'su', 'nuestro', 'nuestra']),
  fr: new Set(['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'était', 'étaient', 'être', 'avoir', 'faire', 'dire', 'de', 'du', 'des', 'en', 'pour', 'par', 'avec', 'sans', 'sur', 'entre', 'vers', 'depuis', 'jusqu', 'selon', 'devant', 'sous', 'contre', 'et', 'ou', 'ni', 'mais', 'donc', 'car', 'que', 'comme', 'si', 'mon', 'ton', 'son', 'notre', 'votre', 'leur']),
  de: new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'der', 'die', 'das', 'ein', 'eine', 'einer', 'eines', 'ist', 'sind', 'war', 'waren', 'sein', 'haben', 'werden', 'machen', 'von', 'in', 'für', 'mit', 'auf', 'an', 'aus', 'bei', 'nach', 'über', 'unter', 'vor', 'zwischen', 'durch', 'gegen', 'ohne', 'um', 'und', 'oder', 'aber', 'sondern', 'denn', 'dass', 'wenn', 'wie', 'als', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer']),
};

// ── Detecção de idioma por stopwords ───────────────────────
export function detectLanguage(text: string): Language {
  const words = text.toLowerCase().split(/\s+/);
  const scores: Record<string, number> = {};

  for (const [lang, stops] of Object.entries(STOPWORDS)) {
    scores[lang] = 0;
    for (const w of words) {
      if (stops.has(w)) scores[lang]++;
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (best[0][1] > 0) return best[0][0] as Language;
  return 'pt';
}

// ── Tokenização de frase ───────────────────────────────────
interface Token {
  text: string;
  type: 'word' | 'punctuation' | 'number' | 'space';
}

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /([A-Za-zÀ-ÿ]+|\d+|[^\s]|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    if (/^\s+$/.test(raw)) { tokens.push({ text: raw, type: 'space' }); }
    else if (/^\d+$/.test(raw)) { tokens.push({ text: raw, type: 'number' }); }
    else if (/^[A-Za-zÀ-ÿ]+$/.test(raw)) { tokens.push({ text: raw, type: 'word' }); }
    else { tokens.push({ text: raw, type: 'punctuation' }); }
  }
  return tokens;
}

// ── Tradução de frase ──────────────────────────────────────
export interface SentenceResult {
  original: string;
  translated: string;
  confidence: number; // 0-1
  tokensTranslated: number;
  tokensTotal: number;
}

/**
 * Traduz uma frase inteira, palavra por palavra.
 *
 * 1. Tokeniza a frase
 * 2. Para cada token:
 *    a. Se é número → mantém
 *    b. Se é pontuação → mantém
 *    c. Se é verbo conjugado → traduz via conjugação
 *    d. Se tem tradução no dicionário → usa
 *    e. Se não → mantém original
 * 3. Retorna frase montada
 */
export function translateSentence(
  text: string,
  source: Language,
  target: Language
): SentenceResult {
  if (source === target) {
    return { original: text, translated: text, confidence: 1, tokensTranslated: 0, tokensTotal: 0 };
  }

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
    const dictResult = lookupByText(lower, target);
    if (dictResult) {
      translated.push(dictResult);
      matched++;
      continue;
    }

    // 2. Conjugação verbal
    const conj = detectConjugation(lower);
    if (conj) {
      const conjResult = conjugate(conj.verb, target, conj.tense as any);
      if (conjResult) {
        translated.push(conjResult);
        matched++;
        continue;
      }
    }

    // 3. Mantém original
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

  return {
    original: text,
    translated: result.trim(),
    confidence: tokens.length > 0 ? matched / tokens.filter(t => t.type === 'word').length : 0,
    tokensTranslated: matched,
    tokensTotal: tokens.filter(t => t.type === 'word').length,
  };
}
