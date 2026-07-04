// src/core/conjugation.ts
// Conjugação verbal algorítmica PT → EN/ES/FR/DE
// 120 verbos × 24 tempos × 4 idiomas — geração por padrão

import type { Language } from './types';
import { VERBS } from './verbs-data';

type Tense = 'inf' | 'pres_1s' | 'pres_2s' | 'pres_3s' | 'pres_1p' | 'pres_2p' | 'pres_3p'
  | 'pret_1s' | 'pret_2s' | 'pret_3s' | 'pret_1p' | 'pret_2p' | 'pret_3p'
  | 'fut_1s' | 'fut_2s' | 'fut_3s' | 'fut_1p' | 'fut_2p' | 'fut_3p'
  | 'cond_1s' | 'cond_2s' | 'cond_3s' | 'cond_1p' | 'cond_2p' | 'cond_3p';
type TL = 'en' | 'es' | 'fr' | 'de';

// ── Padrões PT ─────────────────────────────────────────────
function stem(v: string): string { return v.slice(0, -2); }
function ptEnd(v: string): 'ar' | 'er' | 'ir' | null {
  if (v.endsWith('ar')) return 'ar';
  if (v.endsWith('er')) return 'er';
  if (v.endsWith('ir')) return 'ir';
  return null;
}

const SUF = {
  ar: { pres: ['o','as','a','amos','ais','am'], pret: ['ei','aste','ou','amos','astes','aram'] },
  er: { pres: ['o','es','e','emos','eem','em'], pret: ['i','este','eu','emos','estes','eram'] },
  ir: { pres: ['o','es','e','imos','is','em'],  pret: ['i','iste','iu','imos','istes','iram'] },
} as const;

const FUT_SUF = ['ei','ás','á','amos','ais','am'];
const COND_SUF = ['ia','ias','ia','íamos','íais','ian'];
const PRES3S = { en: 's', es: '', fr: '', de: '' };
const PAST_SUF = { en: 'ed', es: '', fr: 'ai ', de: '' };

// ── Conjugação PT ──────────────────────────────────────────
function conjugatePT(verb: string, tense: Tense): string {
  const end = ptEnd(verb);
  if (!end) return verb;
  const s = stem(verb);
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return verb;
  if (tense.startsWith('pres')) return s + SUF[end].pres[i];
  if (tense.startsWith('pret')) return s + SUF[end].pret[i];
  if (tense.startsWith('fut')) return verb + (end === 'ar' ? 'ar' : end === 'er' ? 'er' : 'ir') + FUT_SUF[i];
  return s + (end === 'ar' ? 'ar' : end === 'er' ? 'er' : 'ir') + COND_SUF[i];
}

// ── Conjugação EN ──────────────────────────────────────────
function conjugateEN(inf: string, tense: Tense): string {
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return inf;
  if (tense.startsWith('pres')) return i === 2 ? inf + 's' : inf;
  if (tense.startsWith('pret')) return inf + (inf.endsWith('e') ? 'd' : 'ed');
  if (tense.startsWith('fut')) return 'will ' + inf;
  return 'would ' + inf;
}

// ── Conjugação ES ──────────────────────────────────────────
function conjugateES(inf: string, tense: Tense): string {
  const end = inf.endsWith('ar') ? 'ar' : inf.endsWith('er') ? 'er' : 'ir';
  const s = inf.slice(0, -2);
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return inf;
  if (tense.startsWith('pres')) {
    const p = end === 'ar' ? ['o','as','a','amos','áis','an'] : end === 'er' ? ['o','es','e','emos','éis','en'] : ['o','es','e','imos','ís','en'];
    return s + p[i];
  }
  if (tense.startsWith('pret')) {
    const p = end === 'ar' ? ['é','aste','ó','amos','asteis','aron'] : ['í','iste','ió','imos','isteis','ieron'];
    return s + p[i];
  }
  if (tense.startsWith('fut')) {
    const p = end === 'ar' ? ['aré','arás','ará','aremos','aréis','arán'] : end === 'er' ? ['eré','erás','erá','eremos','eréis','erán'] : ['iré','irás','irá','iremos','iréis','irán'];
    return inf + p[i];
  }
  const p = end === 'ar' ? ['aría','arías','aría','aríamos','aríais','arían'] : end === 'er' ? ['ería','erías','ería','eríamos','eríais','erían'] : ['iría','irías','iría','iríamos','iríais','irían'];
  return s + p[i];
}

// ── Conjugação FR ──────────────────────────────────────────
function conjugateFR(inf: string, tense: Tense): string {
  const end = inf.endsWith('ar') ? 'ar' : inf.endsWith('er') ? 'er' : 'ir';
  const s = inf.slice(0, -2);
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return inf;
  if (tense.startsWith('pres')) {
    const p = end === 'ar' ? ['e','es','e','ons','ez','ent'] : ['is','is','it','issons','issez','issent'];
    return (end === 'ar' ? s : s) + p[i];
  }
  if (tense.startsWith('pret')) return 'ai ' + inf;
  if (tense.startsWith('fut')) return s + (end === 'ar' ? 'erai' : 'irai');
  return s + (end === 'ar' ? 'erais' : 'irais');
}

// ── Conjugação DE ──────────────────────────────────────────
function conjugateDE(inf: string, tense: Tense): string {
  const s = inf.slice(0, -2);
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return inf;
  if (tense.startsWith('pres')) return s + ['e','st','t','en','t','en'][i];
  if (tense.startsWith('pret')) return s + 'te';
  if (tense.startsWith('fut')) return 'werde ' + inf;
  return 'würde ' + inf;
}

// ── API pública ────────────────────────────────────────────

export function conjugate(verb: string, target: Language, tense: Tense = 'pres_1s'): string | null {
  if (target === 'pt') return conjugatePT(verb, tense);
  const pair = VERBS[verb];
  if (!pair) return null;
  const inf = pair[target as TL];
  if (!inf) return null;
  switch (target) {
    case 'en': return conjugateEN(inf, tense);
    case 'es': return conjugateES(inf, tense);
    case 'fr': return conjugateFR(inf, tense);
    case 'de': return conjugateDE(inf, tense);
    default: return null;
  }
}

export function detectConjugation(word: string): { verb: string; tense: string } | null {
  const lower = word.toLowerCase();
  for (const verb of Object.keys(VERBS)) {
    for (const tense of ['pres_3s', 'pret_3s', 'pres_1s'] as Tense[]) {
      if (conjugate(verb, 'pt', tense) === lower) return { verb, tense };
    }
  }
  return null;
}

export function getAvailableVerbs(): string[] { return Object.keys(VERBS); }
