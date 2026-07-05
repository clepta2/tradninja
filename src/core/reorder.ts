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
    {
      name: 'adj-noun',
      apply: (text) => {
        for (const [ptAdj, trans] of Object.entries(ADJ_MAP)) {
          const enAdj = trans.en;
          if (!enAdj) continue;
          const re = new RegExp('\\b(the|a|an)\\s+' + enAdj + '\\s+([\\wÀ-ÿ]+)', 'gi');
          text = text.replace(re, (_, art, noun) => art + ' ' + noun + ' ' + enAdj);
        }
        return text;
      },
    },
    // Negação: "I no eat" → "I don't eat"
    {
      name: 'negation',
      apply: (text) => {
        text = text.replace(/\b(I|you|he|she|it|we|they)\s+no\s+(\w+)/gi, (_, subj, verb) => {
          const aux = ['he', 'she', 'it'].includes(subj.toLowerCase()) ? "doesn't" : "don't";
          return subj + ' ' + aux + ' ' + verb;
        });
        return text;
      },
    },
    // Artigo "a" antes de vogal → "an"
    {
      name: 'article-vowel',
      apply: (text) => {
        return text.replace(/\ba\s+([aeiou]\w*)/gi, (_, word) => 'an ' + word);
      },
    },
    // Plural: substantivo terminado em -s sem s → adiciona s
    {
      name: 'plural',
      apply: (text) => {
        // "one dog" → "one dog" (ok)
        // "two dog" → "two dogs"
        const pluralRe = /\b(two|three|four|five|six|seven|eight|nine|ten|several|many|few|some|all|these|those)\s+(\w+[^s])\b/gi;
        return text.replace(pluralRe, (_, num, noun) => {
          if (noun.endsWith('s') || noun.endsWith('sh') || noun.endsWith('ch') || noun.endsWith('x') || noun.endsWith('z')) {
            return num + ' ' + noun + 'es';
          }
          return num + ' ' + noun + 's';
        });
      },
    },
    // Pretérito: "I eat yesterday" → "I ate yesterday"
    {
      name: 'past-tense-markers',
      apply: (text) => {
        const pastRe = /\b(I|you|he|she|it|we|they)\s+(\w+)\s+(yesterday|last week|ago|earlier|before|last year)\b/gi;
        return text.replace(pastRe, (_, subj, verb, time) => {
          // Tenta transformar verbo em pretérito simples
          if (verb.endsWith('e')) return subj + ' ' + verb + 'd' + ' ' + time;
          if (verb.endsWith('y')) return subj + ' ' + verb.slice(0, -1) + 'ied' + ' ' + time;
          return subj + ' ' + verb + 'ed' + ' ' + time;
        });
      },
    },
    // Advérbio de frequência: "always I eat" → "I always eat"
    {
      name: 'freq-adverb',
      apply: (text) => {
        const freqRe = /\b(always|never|usually|often|sometimes|rarely|seldom|still|already|just|only|also|even)\s+(I|you|he|she|it|we|they)\s+(\w+)/gi;
        return text.replace(freqRe, (_, adv, subj, verb) => subj + ' ' + adv + ' ' + verb);
      },
    },
    // "do not" → "don't" (contração)
    {
      name: 'contraction-do-not',
      apply: (text) => {
        return text.replace(/\bdo not\b/gi, "don't")
                   .replace(/\bdoes not\b/gi, "doesn't")
                   .replace(/\bdid not\b/gi, "didn't")
                   .replace(/\bcannot\b/gi, "can't")
                   .replace(/\bwill not\b/gi, "won't")
                   .replace(/\bshould not\b/gi, "shouldn't")
                   .replace(/\bwould not\b/gi, "wouldn't")
                   .replace(/\bcould not\b/gi, "couldn't")
                   .replace(/\bmust not\b/gi, "mustn't");
      },
    },
    // Posse: "of mine" → "my" / "of yours" → "your"
    {
      name: 'possessive',
      apply: (text) => {
        return text.replace(/\bof mine\b/gi, 'my')
                   .replace(/\bof yours\b/gi, 'your')
                   .replace(/\bof his\b/gi, 'his')
                   .replace(/\bof hers\b/gi, 'her')
                   .replace(/\bof ours\b/gi, 'our')
                   .replace(/\bof theirs\b/gi, 'their');
      },
    },
  ];
}

function buildESRules(): WordOrderRule[] {
  return [
    // Adjetivo: PT "a casa boa" → ES "la casa bonita"
    {
      name: 'adj-noun',
      apply: (text) => {
        for (const [ptAdj, trans] of Object.entries(ADJ_MAP)) {
          const esAdj = trans.es || ptAdj;
          const re = new RegExp('\\b(el|la|los|las|un|una|unos|unas)\\s+' + esAdj + '\\s+([\\wÀ-ÿ]+)', 'gi');
          text = text.replace(re, (_, art, noun) => art + ' ' + noun + ' ' + esAdj);
        }
        return text;
      },
    },
    // Negação ES: "yo no como" → "yo no como" (já correto em ES)
    // Mas "no eat" → "no como" (se verbos vieram de tradução word-by-word)
    {
      name: 'negation',
      apply: (text) => {
        // ES: negação é "no + verbo" — já correto se traduzido
        return text;
      },
    },
    // Artigo definido antes de vogal em ES: "el agua" → "el agua" (ok)
    {
      name: 'article-vowel',
      apply: (text) => {
        // ES: não precisa de mudança, artigos já são corretos
        return text;
      },
    },
    // Pretérito ES: "yo eat ayer" → "yo comí ayer"
    {
      name: 'past-tense-markers',
      apply: (text) => {
        const pastRe = /\b(yo|tú|él|ella|nosotros|ellos|ellas)\s+(\w+)\s+(ayer|la semana pasada|antes|el año pasado)\b/gi;
        return text.replace(pastRe, (_, subj, verb, time) => {
          if (verb.endsWith('ar')) return subj + ' ' + verb.slice(0, -2) + 'é' + ' ' + time;
          if (verb.endsWith('er')) return subj + ' ' + verb.slice(0, -2) + 'í' + ' ' + time;
          if (verb.endsWith('ir')) return subj + ' ' + verb.slice(0, -2) + 'í' + ' ' + time;
          return subj + ' ' + verb + 'ó' + ' ' + time;
        });
      },
    },
  ];
}

function buildFRRules(): WordOrderRule[] {
  return [
    // Adjetivo: PT "a casa bonita" → FR "la maison belle"
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
        text = text.replace(/\b(je|tu|il|elle|nous|vous|ils|elles)\s+ne\s+pas\s+(\w+)/gi,
          (_, subj, verb) => subj + ' ne ' + verb + ' pas');
        return text;
      },
    },
    // Artigo antes de vogal: "le amitié" → "l'amitié"
    {
      name: 'article-vowel',
      apply: (text) => {
        return text.replace(/\ble\s+([aeiouy]\w*)/gi, (_, word) => "l'" + word)
                   .replace(/\bla\s+([aeiouy]\w*)/gi, (_, word) => "l'" + word);
      },
    },
    // Contração: "de le" → "du" / "de les" → "des"
    {
      name: 'contraction-de',
      apply: (text) => {
        return text.replace(/\bde\s+le\b/gi, 'du')
                   .replace(/\bde\s+les\b/gi, 'des')
                   .replace(/\bà\s+le\b/gi, 'au')
                   .replace(/\bà\s+les\b/gi, 'aux');
      },
    },
    // Plural: "deux chien" → "deux chiens"
    {
      name: 'plural',
      apply: (text) => {
        const pluralRe = /\b(deux|trois|quatre|cinq|six|sept|huit|neuf|dix|plusieurs|beaucoup|peu|quelques|tous|ces)\s+(\w+[^s])\b/gi;
        return text.replace(pluralRe, (_, num, noun) => {
          if (noun.endsWith('s') || noun.endsWith('x') || noun.endsWith('z')) return num + ' ' + noun;
          return num + ' ' + noun + 's';
        });
      },
    },
  ];
}

function buildDERules(): WordOrderRule[] {
  return [
    // Substantivo composto: "Haus" + "Schule" → "Haus school" (já funciona)
    // Verbo no final de subordinadas: "weil ich esse" (já correto)
    // Caso: "guter Mann" → "guter Mann" (adjetivo antes do substantivo em alemão)
    // Não precisa de reorder para DE — adjetivo vem antes em DE
    {
      name: 'noop',
      apply: (text) => text, // Alemão não precisa de reorder para adjetivos
    },
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
