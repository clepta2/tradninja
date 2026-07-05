// src/core/reorder.ts
// Regras de reordenação PT → EN/ES/FR/DE
// PT tem adjetivo antes do substantivo; EN/ES/FR depois

import type { Language } from './types';

interface ReorderRule {
  pattern: RegExp;
  replace: (m: RegExpMatchArray) => string;
}

// ── Adjetivos PT → EN (substantivo antes do adjetivo) ──────
const ADJ_MAP: Record<string, string> = {
  bom:'good', mau:'bad', grande:'big', pequeno:'small', novo:'new',
  velho:'old', forte:'strong', fraco:'weak', rápido:'fast', lento:'slow',
  bonito:'pretty', feio:'ugly', alto:'tall', baixo:'short',
  frio:'cold', quente:'hot', duro:'hard', mole:'soft',
  claro:'light', escuro:'dark', limpo:'clean', sujo:'dirty',
};

// ── Advérbios PT → various (invertem posição) ──────────────
const ADV_MAP: Record<string, Record<string, string>> = {
  'sempre':     { en:'always', es:'siempre', fr:'toujours', de:'immer' },
  'nunca':      { en:'never', es:'nunca', fr:'jamais', de:'nie' },
  'raramente':  { en:'rarely', es:'raramente', fr:'rarement', de:'selten' },
  'geralmente': { en:'usually', es:'generalmente', fr:'généralement', de:'normalerweise' },
  'às vezes':   { en:'sometimes', es:'a veces', fr:'parfois', de:'manchmal' },
  'hoje':       { en:'today', es:'hoy', fr:"aujourd'hui", de:'heute' },
  'ontem':      { en:'yesterday', es:'ayer', fr:'hier', de:'gestern' },
  'amanhã':     { en:'tomorrow', es:'mañana', fr:'demain', de:'morgen' },
  'bem':        { en:'well', es:'bien', fr:'bien', de:'gut' },
  'mal':        { en:'badly', es:'mal', fr:'mal', de:'schlecht' },
  'muito':      { en:'very', es:'muy', fr:'très', de:'sehr' },
  'pouco':      { en:'little', es:'poco', fr:'peu', de:'wenig' },
};

// ── Padrão regex compartilhado ─────────────────────────────
const ADJ_PATTERN = new RegExp('\\b(' + Object.keys(ADJ_MAP).join('|') + ')\\s+(\\w+)', 'gi');
const ADV_PATTERNS = Object.entries(ADV_MAP).map(([pt, trans]) => ({
  regex: new RegExp('\\b' + pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+(\\w+)', 'gi'),
  translations: trans,
}));

// ── Reordenação por idioma ─────────────────────────────────
function reorderAdjectives(text: string, target: Language): string {
  if (target !== 'en' && target !== 'fr') return text;
  return text.replace(ADJ_PATTERN, (_, adj, noun) => {
    const mapped = ADJ_MAP[adj.toLowerCase()];
    return mapped ? noun + ' ' + mapped : adj + ' ' + noun;
  });
}

function reorderAdverbs(text: string, target: Language): string {
  let result = text;
  for (const { regex, translations } of ADV_PATTERNS) {
    const targetAdv = translations[target];
    if (!targetAdv) continue;
    regex.lastIndex = 0;
    result = result.replace(regex, (_, verb) => verb + ' ' + targetAdv);
  }
  return result;
}

/**
 * Aplica regras de reordenação no texto traduzido.
 * PT: adjetivo + substantivo → EN/FR: substantivo + adjetivo
 */
export function applyReorder(text: string, target: Language): string {
  if (target !== 'en' && target !== 'fr') return text;
  let r = text;
  r = reorderAdjectives(r, target);
  r = reorderAdverbs(r, target);
  return r;
}
