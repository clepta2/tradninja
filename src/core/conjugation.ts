// src/core/conjugation.ts
// Conjugação verbal PT → 31 idiomas
// EN/ES/FR/DE: padrões algorítmicos completos
// Outros idiomas: usa infinitivo do dicionário (não conjugam da mesma forma)

import type { Language } from './types';
import { VERBS, type VerbLang } from './verbs-data';

type Tense = 'inf' | 'pres_1s' | 'pres_2s' | 'pres_3s' | 'pres_1p' | 'pres_2p' | 'pres_3p'
  | 'pret_1s' | 'pret_2s' | 'pret_3s' | 'pret_1p' | 'pret_2p' | 'pret_3p'
  | 'fut_1s' | 'fut_2s' | 'fut_3s' | 'fut_1p' | 'fut_2p' | 'fut_3p'
  | 'cond_1s' | 'cond_2s' | 'cond_3s' | 'cond_1p' | 'cond_2p' | 'cond_3p';

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

// ── Conjugação PT ──────────────────────────────────────────
function conjugatePT(verb: string, tense: Tense): string {
  const end = ptEnd(verb);
  if (!end) return verb;
  const s = stem(verb);
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return verb;
  if (tense.startsWith('pres')) return s + SUF[end].pres[i];
  if (tense.startsWith('pret')) return s + SUF[end].pret[i];
  if (tense.startsWith('fut')) return verb + ['ei','ás','á','amos','ais','am'][i];
  return s + (end === 'ar' ? 'ar' : end === 'er' ? 'er' : 'ir') + ['ia','ias','ia','íamos','íais','ian'][i];
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
    return s + p[i];
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

// ── Conjugação IT (românico como ES) ───────────────────────
function conjugateIT(inf: string, tense: Tense): string {
  const end = inf.endsWith('ar') ? 'are' : inf.endsWith('er') ? 'ere' : 'ire';
  const s = inf.slice(0, -2);
  const i = parseInt(tense.split('_')[1]) - 1;
  if (tense === 'inf') return inf;
  if (tense.startsWith('pres')) {
    const p = end === 'are' ? ['o','i','a','iamo','iate','ano'] : end === 'ere' ? ['o','i','e','iamo','ete','ono'] : ['o','i','e','iamo','ite','ono'];
    return s + p[i];
  }
  if (tense.startsWith('pret')) return s + (end === 'are' ? 'ai' : 'ei');
  if (tense.startsWith('fut')) return s + 'erò';
  return s + 'erei';
}

// ── API pública ────────────────────────────────────────────

/**
 * Conjugação PT → target language.
 * Para 5 idiomas com conjugação algorítmica (EN/ES/FR/DE/IT).
 * Para outros 26 idiomas: retorna infinitivo do dicionário.
 * Para PT: conjugação completa.
 */
export function conjugate(verb: string, target: Language, tense: Tense = 'pres_1s'): string | null {
  // PT conjugation
  if (target === 'pt') return conjugatePT(verb, tense);

  // Lookup infinitivo no dicionário multilíngue
  const pair = VERBS[verb];
  if (!pair) return null;
  const inf = pair[target as VerbLang];
  if (!inf) return null;

  // Idiomas com conjugação algorítmica
  switch (target) {
    case 'en': return conjugateEN(inf, tense);
    case 'es': return conjugateES(inf, tense);
    case 'fr': return conjugateFR(inf, tense);
    case 'de': return conjugateDE(inf, tense);
    case 'it': return conjugateIT(inf, tense);
  }

  // Outros 26 idiomas: retorna infinitivo (não conjugam da mesma forma)
  // JA/ZH/KO: não conjugam verbos (partícula muda)
  // AR: conjugação similar a ES mas complexa demais para regex
  // RU/HI/TH/etc.: sistemas diferentes demais para padrão regex
  if (tense === 'inf') return inf;

  // Para tempos não-infinitivo, retorna infinitivo + indicação do tempo
  const tenseNames: Record<string, string> = {
    pres_1s: '(I)', pres_2s: '(you)', pres_3s: '(he/she)', pres_1p: '(we)', pres_2p: '(you pl)', pres_3p: '(they)',
    pret_1s: '(I past)', pret_2s: '(you past)', pret_3s: '(he past)', pret_1p: '(we past)', pret_2p: '(you pl past)', pret_3p: '(they past)',
    fut_1s: '(I will)', fut_2s: '(you will)', fut_3s: '(he will)', fut_1p: '(we will)', fut_2p: '(you pl will)', fut_3p: '(they will)',
    cond_1s: '(I would)', cond_2s: '(you would)', cond_3s: '(he would)', cond_1p: '(we would)', cond_2p: '(you pl would)', cond_3p: '(they would)',
  };

  return inf;
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
export function getVerbCount(): number { return Object.keys(VERBS).length; }
