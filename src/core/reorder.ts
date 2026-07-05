// src/core/reorder.ts
// Regras de reordenação PT → EN/ES/FR/DE
// Corrige ordem das palavras, contrações, negação, perguntas

import type { Language } from './types';

// ── Mapa de adjetivos PT → target ──────────────────────────
const ADJ_MAP: Record<string, Record<string, string>> = {
  bom:    { en:'good', fr:'bon', de:'gut' },
  mau:    { en:'bad', fr:'mauvais', de:'schlecht' },
  grande: { en:'big', fr:'grand', de:'groß' },
  pequeno:{ en:'small', fr:'petit', de:'klein' },
  novo:   { en:'new', fr:'nouveau', de:'neu' },
  velho:  { en:'old', fr:'vieux', de:'alt' },
  forte:  { en:'strong', fr:'fort', de:'stark' },
  fraco:  { en:'weak', fr:'faible', de:'schwach' },
  rápido: { en:'fast', fr:'rapide', de:'schnell' },
  lento:  { en:'slow', fr:'lent', de:'langsam' },
  bonito: { en:'pretty', fr:'joli', de:'hübsch' },
  alto:   { en:'tall', fr:'grand', de:'groß' },
  frio:   { en:'cold', fr:'froid', de:'kalt' },
  quente: { en:'hot', fr:'chaud', de:'heiß' },
  duro:   { en:'hard', fr:'dur', de:'hart' },
  mole:   { en:'soft', fr:'mou', de:'weich' },
  claro:  { en:'light', fr:'clair', de:'hell' },
  escuro: { en:'dark', fr:'sombre', de:'dunkel' },
  limpo:  { en:'clean', fr:'propre', de:'sauber' },
  sujo:   { en:'dirty', fr:'sale', de:'schmutzig' },
  novo:   { en:'new', fr:'nouveau', de:'neu' },
  bom:    { en:'good', fr:'bon', de:'gut' },
};

// ── Negação PT → target (ordem muda) ───────────────────────
// PT: "não como" → EN: "I don't eat" (aux negativo + verbo)
// PT: "nunca como" → EN: "I never eat"
const NEGATION_MAP: Record<string, Record<string, string>> = {
  'não':    { en:"don't", es:'no', fr:'ne ... pas', de:'nicht' },
  'nunca':  { en:'never', es:'nunca', fr:'jamais', de:'nie' },
  'nada':   { en:'nothing', es:'nada', fr:'rien', de:'nichts' },
  'nenhum': { en:'no', es:'ningún', fr:'aucun', de:'kein' },
  'jamais': { en:'never', es:'nunca', fr:'jamais', de:'nie' },
};

// ── Perguntas PT → target ──────────────────────────────────
const QUESTION_WORDS: Record<string, Record<string, string>> = {
  'onde':   { en:'Where', es:'Dónde', fr:'Où', de:'Wo' },
  'quando': { en:'When', es:'Cuándo', fr:'Quand', de:'Wann' },
  'como':   { en:'How', es:'Cómo', fr:'Comment', de:'Wie' },
  'por que':{ en:'Why', es:'Por qué', fr:'Pourquoi', de:'Warum' },
  'quanto': { en:'How much', es:'Cuánto', fr:'Combien', de:'Wie viel' },
  'qual':   { en:'Which', es:'Cuál', fr:'Quel', de:'Welcher' },
  'quem':   { en:'Who', es:'Quién', fr:'Qui', de:'Wer' },
  'o quê':  { en:'What', es:'Qué', fr:'Quoi', de:'Was' },
};

// ── Contrações PT → EN ─────────────────────────────────────
// PT: "de o" → EN: "of the" (já separado no word-by-word)
// PT: "em a" → EN: "in the"

// ── Padrões de frase PT → target ───────────────────────────
interface SentencePattern {
  pt: RegExp;
  target: (match: RegExpMatchArray) => string;
}

// ── Regras de reordenação por idioma ───────────────────────
interface WordOrderRule {
  name: string;
  apply: (text: string) => string;
}

function buildENRules(): WordOrderRule[] {
  return [
    // Adjetivo + substantivo → substantivo + adjetivo
    // "the good house" → "the good house" (já correto em EN)
    // Mas se veio de PT "a casa boa" → precisa reordenar
    {
      name: 'adj-noun',
      apply: (text) => {
        for (const [ptAdj, trans] of Object.entries(ADJ_MAP)) {
          const enAdj = trans.en;
          if (!enAdj) continue;
          // Procura "the EN_ADJ NOUN" e reordena para "the NOUN EN_ADJ"
          const re = new RegExp('\\b(the|a|an)\\s+' + enAdj + '\\s+(\\w+)', 'gi');
          text = text.replace(re, (_, art, noun) => art + ' ' + noun + ' ' + enAdj);
        }
        return text;
      },
    },
    // Negação: "I no eat" → "I don't eat"
    {
      name: 'negation',
      apply: (text) => {
        // Padrão: PRONOUN + no/not + VERB → PRONOUN + don't/doesn't + VERB
        const negRe = /\b(I|you|he|she|it|we|they)\s+no\s+(\w+)/gi;
        text = text.replace(negRe, (_, subj, verb) => {
          const aux = subj.toLowerCase() === 'he' || subj.toLowerCase() === 'she' || subj.toLowerCase() === 'it'
            ? "doesn't" : "don't";
          return subj + ' ' + aux + ' ' + verb;
        });
        return text;
      },
    },
    // Pergunta: "Where is he?" (já correto)
    {
      name: 'question',
      apply: (text) => {
        // Se começa com palavra de pergunta e termina com ?, ok
        return text;
      },
    },
  ];
}

function buildESRules(): WordOrderRule[] {
  return [
    // Adjetivo: PT "grande" → ES "grande" (depois do substantivo)
    {
      name: 'adj-noun',
      apply: (text) => {
        for (const [ptAdj, trans] of Object.entries(ADJ_MAP)) {
          const esAdj = trans.es || ptAdj;
          const re = new RegExp('\\b(el|la|los|las|un|una)\\s+' + esAdj + '\\s+(\\w+)', 'gi');
          text = text.replace(re, (_, art, noun) => art + ' ' + noun + ' ' + esAdj);
        }
        return text;
      },
    },
  ];
}

function buildFRRules(): WordOrderRule[] {
  return [
    // Adjetivo: PT "grande" → FR "grand" (depois do substantivo)
    {
      name: 'adj-noun',
      apply: (text) => {
        for (const [ptAdj, trans] of Object.entries(ADJ_MAP)) {
          const frAdj = trans.fr || ptAdj;
          const re = new RegExp('\\b(le|la|les|un|une|des)\\s+' + frAdj + '\\s+([\\wÀ-ÿ]+)', 'gi');
          text = text.replace(re, (_, art, noun) => art + ' ' + noun + ' ' + frAdj);
        }
        return text;
      },
    },
    // Negação FR: "je ne pas mange" → "je ne mange pas"
    {
      name: 'negation',
      apply: (text) => {
        text = text.replace(/\b(je|tu|il|elle|nous|vous|ils|elles)\s+ne\s+(pas)\s+(\w+)/gi,
          (_, subj, _, verb) => subj + ' ne ' + verb + ' pas');
        return text;
      },
    },
  ];
}

function buildDERules(): WordOrderRule[] {
  return [
    // Alemão: verbo vai pro final em subordinadas
    // "weil ich esse" (já correto)
  ];
}

const RULE_BUILDERS: Record<string, () => WordOrderRule[]> = {
  en: buildENRules,
  es: buildESRules,
  fr: buildFRRules,
  de: buildDERules,
};

const ruleCache: Record<string, WordOrderRule[]> = {};

function getRules(target: Language): WordOrderRule[] {
  if (!ruleCache[target]) {
    const builder = RULE_BUILDERS[target];
    ruleCache[target] = builder ? builder() : [];
  }
  return ruleCache[target];
}

/**
 * Aplica todas as regras de reordenação no texto traduzido.
 */
export function applyReorder(text: string, target: Language): string {
  const rules = getRules(target);
  let result = text;
  for (const rule of rules) {
    result = rule.apply(result);
  }
  return result;
}

/**
 * Lista regras disponíveis para um idioma.
 */
export function getAvailableRules(target: Language): string[] {
  return getRules(target).map(r => r.name);
}
