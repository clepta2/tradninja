// src/react/quick.ts
// API simplificada para iniciantes — uma função, sem configuração

import { createTranslator } from '../core/engine';

let _cache: Record<string, ReturnType<typeof createTranslator>> = {};

/**
 * API mais simples do TradNinja.
 * Uma função, sem configuração, sem Provider.
 *
 * @param from - Idioma de origem (padrão: 'pt')
 * @param to - Idioma de destino (padrão: 'en')
 * @returns Função que traduz texto
 *
 * @example
 * ```ts
 * const t = quick('pt', 'en');
 *
 * t('Salvar');           // "Save"
 * t('Excluir');          // "Delete"
 * t('Bom dia');          // "Good morning"
 * t('Olá, {name}!', { name: 'João' });  // "Hello, João!"
 * ```
 */
export function quick(from: string = 'pt', to: string = 'en') {
  const key = `${from}:${to}`;
  if (!_cache[key]) {
    _cache[key] = createTranslator({ defaultSource: from as any, defaultTarget: to as any });
  }
  const translator = _cache[key];

  return function translate(text: string, params?: Record<string, string | number>): string {
    const result = translator.translate(text, { params });
    return result.text;
  };
}

/**
 * Traduz um objeto inteiro de uma vez.
 *
 * @example
 * ```ts
 * const labels = quickAll('pt', 'en', {
 *   title: 'Início',
 *   button: 'Salvar',
 *   error: 'Algo deu errado',
 * });
 * // labels.title → "Home"
 * // labels.button → "Save"
 * // labels.error → "Something went wrong"
 * ```
 */
export function quickAll(
  from: string,
  to: string,
  obj: Record<string, string>
): Record<string, string> {
  const t = quick(from, to);
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = t(value);
  }
  return result;
}

/**
 * Lista todos os idiomas disponíveis.
 *
 * @example
 * ```ts
 * import { quickLangs } from 'tradninja';
 * console.log(quickLangs()); // ['pt', 'en', 'es', 'fr', ...]
 * ```
 */
export function quickLangs(): string[] {
  return [
    'pt', 'en', 'es', 'fr', 'de', 'it',
    'ja', 'ko', 'zh', 'ar', 'ru', 'hi',
    'nl', 'pl', 'sv', 'da', 'no', 'fi',
    'cs', 'el', 'hu', 'ro', 'uk', 'id',
    'ms', 'th', 'tr', 'he', 'bn', 'sw',
  ];
}
