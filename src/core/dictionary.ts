// src/core/dictionary.ts
// Dicionário otimizado — lazy loading + índices + buffering

import ptData from '../i18n/pt.json';
import enData from '../i18n/en.json';
import esData from '../i18n/es.json';
import type { Language } from './types';

type LangMap = { pt: string; en: string; es: string };

// ── Flatten JSON recursivo (otimizado) ──────────────────────
function flattenJson(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null) {
      Object.assign(result, flattenJson(val as Record<string, unknown>, path));
    } else if (val !== null && val !== undefined) {
      result[path] = String(val);
    }
  }
  return result;
}

// ── Índices de lookup (pré-computados) ──────────────────────
export const DICTIONARY: Record<string, LangMap> = {};
const LOOKUP_BY_TEXT = new Map<string, LangMap>();
const LOOKUP_BY_PREFIX = new Map<string, string[]>(); // prefixo → chaves

// ── Buffer de traduções pendentes ───────────────────────────
const TRANSLATION_BUFFER: Array<{
  text: string;
  target: Language;
  resolve: (value: string) => void;
}> = [];
let bufferTimer: ReturnType<typeof setTimeout> | null = null;
const BUFFER_DELAY = 16; // ~1 frame (60fps)

// ── Build dictionary (lazy init) ───────────────────────────
let built = false;

function buildDictionary(): void {
  if (built) return;

  const ptFlat = flattenJson(ptData as Record<string, unknown>);
  const enFlat = flattenJson(enData as Record<string, unknown>);
  const esFlat = flattenJson(esData as Record<string, unknown>);

  for (const [key, ptVal] of Object.entries(ptFlat)) {
    if (ptVal && typeof ptVal === 'string' && ptVal.trim()) {
      const entry: LangMap = {
        pt: ptVal,
        en: enFlat[key] || ptVal,
        es: esFlat[key] || ptVal,
      };
      DICTIONARY[key] = entry;
      if (!DICTIONARY[ptVal]) DICTIONARY[ptVal] = entry;
      LOOKUP_BY_TEXT.set(ptVal, entry);

      // Índice por prefixo (3 primeiros chars)
      const prefix = ptVal.substring(0, 3).toLowerCase();
      if (!LOOKUP_BY_PREFIX.has(prefix)) LOOKUP_BY_PREFIX.set(prefix, []);
      LOOKUP_BY_PREFIX.get(prefix)!.push(ptVal);
    }
  }

  // Extras pré-definidos
  const extras: [string, string, string][] = [
    ['Abrir', 'Open', 'Abrir'], ['Fechar menu', 'Close menu', 'Cerrar menú'],
    ['Menu principal', 'Main menu', 'Menú principal'], ['Carregando...', 'Loading...', 'Cargando...'],
    ['Salvo com sucesso', 'Saved successfully', 'Guardado con éxito'], ['Erro ao salvar', 'Error saving', 'Error al guardar'],
    ['Erro ao carregar', 'Error loading', 'Error al cargar'], ['Tente novamente', 'Try again', 'Intenta de nuevo'],
    ['Sem conexão', 'No connection', 'Sin conexión'], ['Modo offline', 'Offline mode', 'Modo offline'],
    ['Criar conta', 'Create account', 'Crear cuenta'], ['Esqueceu a senha?', 'Forgot password?', '¿Olvidaste tu contraseña?'],
    ['Pular', 'Skip', 'Saltar'], ['Próximo', 'Next', 'Siguiente'], ['Anterior', 'Previous', 'Anterior'],
    ['Salvar', 'Save', 'Guardar'], ['Excluir', 'Delete', 'Eliminar'], ['Editar', 'Edit', 'Editar'],
    ['Confirmar', 'Confirm', 'Confirmar'], ['Cancelar', 'Cancel', 'Cancelar'],
    ['Enviar', 'Send', 'Enviar'], ['Pesquisar...', 'Search...', 'Buscar...'],
  ];

  for (const [pt, en, es] of extras) {
    if (!DICTIONARY[pt]) {
      const entry = { pt, en, es };
      DICTIONARY[pt] = entry;
      LOOKUP_BY_TEXT.set(pt, entry);
    }
  }

  built = true;
}

// ── Lookup rápido por texto (O(1)) ─────────────────────────
export function lookupByText(text: string, target: Language): string | null {
  buildDictionary();
  const entry = LOOKUP_BY_TEXT.get(text);
  return entry ? entry[target] || null : null;
}

// ── Lookup por chave (O(1)) ────────────────────────────────
export function lookupByKey(key: string, target: Language): string | null {
  buildDictionary();
  const entry = DICTIONARY[key];
  return entry ? entry[target] || null : null;
}

// ── Lookup por prefixo (busca parcial) ──────────────────────
export function lookupByPrefix(prefix: string, target: Language): LangMap[] {
  buildDictionary();
  const p = prefix.toLowerCase().substring(0, 3);
  const keys = LOOKUP_BY_PREFIX.get(p) || [];
  return keys.map(k => DICTIONARY[k]).filter(Boolean);
}

// ── Batch translate (buffering de respostas) ────────────────
export function translateBatch(
  texts: string[],
  target: Language
): Promise<string[]> {
  return new Promise((resolve) => {
    const results: string[] = new Array(texts.length);
    let pending = texts.length;

    texts.forEach((text, i) => {
      TRANSLATION_BUFFER.push({
        text,
        target,
        resolve: (value) => {
          results[i] = value;
          pending--;
          if (pending === 0) resolve(results);
        },
      });
    });

    if (!bufferTimer) {
      bufferTimer = setTimeout(processBuffer, BUFFER_DELAY);
    }
  });
}

function processBuffer(): void {
  bufferTimer = null;
  const batch = [...TRANSLATION_BUFFER];
  TRANSLATION_BUFFER.length = 0;

  for (const item of batch) {
    const entry = LOOKUP_BY_TEXT.get(item.text);
    item.resolve(entry ? entry[item.target] || item.text : item.text);
  }
}

// ── Tamanho do dicionário ───────────────────────────────────
export function dictionarySize(): number {
  buildDictionary();
  return Object.keys(DICTIONARY).length;
}
