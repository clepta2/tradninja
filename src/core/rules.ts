import type { GrammarRule, Language } from './types';

interface ArticleRule {
  pt: RegExp;
  en: string;
  es: string;
}

const ARTICLES_PT_EN: ArticleRule[] = [
  { pt: /\bo\b/gi, en: 'the', es: 'el' },
  { pt: /\ba\b/gi, en: 'the', es: 'la' },
  { pt: /\bum\b/gi, en: 'a', es: 'un' },
  { pt: /\buma\b/gi, en: 'a', es: 'una' },
  { pt: /\bos\b/gi, en: 'the', es: 'los' },
  { pt: /\bas\b/gi, en: 'the', es: 'las' },
  { pt: /\bums\b/gi, en: 'some', es: 'unos' },
  { pt: /\bumas\b/gi, en: 'some', es: 'unas' },
];

const POSSESSIVES: Record<string, Record<Language, string>> = {
  meu: { pt: 'meu', en: 'my', es: 'mi' },
  minha: { pt: 'minha', en: 'my', es: 'mi' },
  teu: { pt: 'teu', en: 'your', es: 'tu' },
  tua: { pt: 'tua', en: 'your', es: 'tu' },
  seu: { pt: 'seu', en: 'your', es: 'su' },
  sua: { pt: 'sua', en: 'your', es: 'su' },
  nosso: { pt: 'nosso', en: 'our', es: 'nuestro' },
  nossa: { pt: 'nossa', en: 'our', es: 'nuestra' },
  deles: { pt: 'deles', en: 'their', es: 'su' },
  delas: { pt: 'delas', en: 'their', es: 'su' },
};

const NEGATION: Record<string, Record<Language, string>> = {
  nenhum: { pt: 'nenhum', en: 'no', es: 'ningún' },
  nenhuma: { pt: 'nenhuma', en: 'no', es: 'ninguna' },
  ningueem: { pt: 'ninguém', en: 'nobody', es: 'nadie' },
  nada: { pt: 'nada', en: 'nothing', es: 'nada' },
  nunca: { pt: 'nunca', en: 'never', es: 'nunca' },
  nem: { pt: 'nem', en: 'neither', es: 'ni' },
};

const GERUND_MAP: Record<string, string> = {
  ando: 'ing',
  endo: 'ing',
  indo: 'ing',
  ondo: 'ing',
  undo: 'ing',
};

const NUMBER_FORMATS: Record<Language, {
  decimal: string;
  thousands: string;
  currency: string;
}> = {
  pt: { decimal: ',', thousands: '.', currency: 'R$ ' },
  en: { decimal: '.', thousands: ',', currency: '$' },
  es: { decimal: ',', thousands: '.', currency: '$' },
};

export const GRAMMAR_RULES: GrammarRule[] = [
  ...ARTICLES_PT_EN.map((a, i) => ({
    id: `article-${i}`,
    source: 'pt' as Language,
    target: 'en' as Language,
    match: a.pt,
    replace: () => a.en,
    description: `PT article → EN ${a.en}`,
  })),
  ...ARTICLES_PT_EN.map((a, i) => ({
    id: `article-es-${i}`,
    source: 'pt' as Language,
    target: 'es' as Language,
    match: a.pt,
    replace: () => a.es,
    description: `PT article → ES ${a.es}`,
  })),
];

export function applyRules(
  text: string,
  source: Language,
  target: Language
): string {
  let result = text;

  if (source === 'pt' && target === 'en') {
    for (const [pt, mapping] of Object.entries(POSSESSIVES)) {
      result = result.replace(
        new RegExp(`\\b${pt}\\b`, 'gi'),
        mapping.en
      );
    }
    for (const [pt, mapping] of Object.entries(NEGATION)) {
      result = result.replace(
        new RegExp(`\\b${pt}\\b`, 'gi'),
        mapping.en
      );
    }
  }

  if (source === 'pt' && target === 'es') {
    for (const [pt, mapping] of Object.entries(POSSESSIVES)) {
      result = result.replace(
        new RegExp(`\\b${pt}\\b`, 'gi'),
        mapping.es
      );
    }
    for (const [pt, mapping] of Object.entries(NEGATION)) {
      result = result.replace(
        new RegExp(`\\b${pt}\\b`, 'gi'),
        mapping.es
      );
    }
  }

  return result;
}

export function formatNumber(
  value: number,
  target: Language,
  decimals = 0
): string {
  const fmt = NUMBER_FORMATS[target];
  const parts = value.toFixed(decimals).split('.');
  const intPart = parts[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    fmt.thousands
  );
  const decPart = parts[1];
  return decPart
    ? intPart + fmt.decimal + decPart
    : intPart;
}

export function formatCurrency(
  value: number,
  target: Language,
  decimals = 2
): string {
  const fmt = NUMBER_FORMATS[target];
  return fmt.currency + formatNumber(value, target, decimals);
}

export function getGenderMap(): Record<string, Record<Language, string>> {
  return {
    masculino: { pt: 'masculino', en: 'male', es: 'masculino' },
    feminino: { pt: 'feminino', en: 'female', es: 'femenino' },
    forte: { pt: 'forte', en: 'strong', es: 'fuerte' },
    rapido: { pt: 'rápido', en: 'fast', es: 'rápido' },
    alta: { pt: 'alta', en: 'high', es: 'alta' },
    baixa: { pt: 'baixa', en: 'low', es: 'baja' },
    bom: { pt: 'bom', en: 'good', es: 'bueno' },
    boa: { pt: 'boa', en: 'good', es: 'buena' },
    otimo: { pt: 'ótimo', en: 'great', es: 'genial' },
    otima: { pt: 'ótima', en: 'great', es: 'genial' },
  };
}
