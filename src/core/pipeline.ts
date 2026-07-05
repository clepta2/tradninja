// src/core/pipeline.ts
// Pipeline cascata de tradução — ponto de entrada único
// Phrasebook → Dict → Conjugation → Rules → Reorder → Sentencer → Cross

import type { Language } from './types';
import { lookupByText, crossTranslate } from './dictionary';
import { conjugate, detectConjugation } from './conjugation';
import { applyRules } from './rules';
import { applyReorder } from './reorder';
import { translateSentence, detectLanguage } from './sentencer';
import { getPhrase, getPhrases } from './phrasebook';
import { lookupPhrase, CLEAN_OVERRIDES } from './clean-dict';

// ── Resultado do pipeline ──────────────────────────────────
export interface PipelineResult {
  text: string;
  source: Language;
  target: Language;
  confidence: number; // 0-1
  stage: string; // onde a tradução foi encontrada
}

// ── Pipeline cascata ───────────────────────────────────────
export function translate(
  text: string,
  source: Language,
  target: Language,
): PipelineResult {
  // 0. Se source === target, retorna original
  if (source === target) {
    return { text, source, target, confidence: 1, stage: 'identity' };
  }

  // 0.5. Busca multi-palavra no phrasebook (frases comuns)
  const phraseHit = lookupPhrase(text.trim(), target);
  if (phraseHit) {
    return { text: phraseHit, source, target, confidence: 1, stage: 'phrasebook' };
  }

  // 1. Busca direta no reverse index (25k termos × 29 idiomas)
  const directLookup = lookupByText(text.trim(), target);
  if (directLookup) {
    return { text: directLookup, source, target, confidence: 1, stage: 'dictionary' };
  }

  // 2. Busca por palavra-chave (primeira palavra significativa)
  const firstWord = text.trim().split(/\s+/)[0]?.toLowerCase();
  if (firstWord) {
    const wordLookup = lookupByText(firstWord, target);
    if (wordLookup) {
      // Traduziu pelo menos a primeira palavra — retorna com confiança parcial
      const rest = text.trim().split(/\s+/).slice(1).join(' ');
      if (rest) {
        const restResult = translate(rest, source, target);
        return {
          text: wordLookup + ' ' + restResult.text,
          source, target,
          confidence: 0.6,
          stage: 'partial-dict',
        };
      }
      return { text: wordLookup, source, target, confidence: 0.8, stage: 'partial-dict' };
    }
  }

  // 3. Conjugação verbal
  const conj = detectConjugation(firstWord || '');
  if (conj) {
    const conjResult = conjugate(conj.verb, target, conj.tense as any);
    if (conjResult) {
      const rest = text.trim().split(/\s+/).slice(1).join(' ');
      if (rest) {
        const restResult = translate(rest, source, target);
        return {
          text: conjResult + ' ' + restResult.text,
          source, target,
          confidence: 0.7,
          stage: 'conjugation',
        };
      }
      return { text: conjResult, source, target, confidence: 0.8, stage: 'conjugation' };
    }
  }

  // 4. Regras gramaticais
  const ruleResult = applyRules(text, source, target);
  if (ruleResult !== text) {
    return { text: ruleResult, source, target, confidence: 0.5, stage: 'rules' };
  }

  // 5. Sentencer (word-by-word com regras)
  const sentResult = translateSentence(text, source, target);
  if (sentResult.confidence > 0.3) {
    const reordered = applyReorder(sentResult.translated, target);
    return { text: reordered, source, target, confidence: sentResult.confidence, stage: 'sentencer' };
  }

  // 6. Cross-translate via pivô
  // Cross-translate retorna Promise, mas pipeline é sync — retorna texto parcial
  // O chamador pode usar crossTranslate() diretamente para async

  return { text, source, target, confidence: 0, stage: 'none' };
}

// ── Versão async (com cross-translate) ─────────────────────
export async function translateAsync(
  text: string,
  source: Language,
  target: Language,
): Promise<PipelineResult> {
  const sync = translate(text, source, target);
  if (sync.confidence > 0.3) return sync;

  // Tenta cross-translate
  const cross = await crossTranslate(text, source, target);
  if (cross !== text) {
    return { text: cross, source, target, confidence: 0.3, stage: 'cross-translate' };
  }

  return sync;
}

// ── Helper: traduzir lista de textos ───────────────────────
export function translateBatch(
  texts: string[],
  source: Language,
  target: Language,
): PipelineResult[] {
  return texts.map(t => translate(t, source, target));
}

// ── Helper: detectar idioma ────────────────────────────────
export { detectLanguage };

// ── Helper: listar idiomas disponíveis ──────────────────────
export function getSupportedLanguages(): Language[] {
  return ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru', 'hi',
    'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'el', 'hu', 'ro', 'uk', 'id',
    'ms', 'th', 'tr', 'he', 'bn', 'sw'];
}
