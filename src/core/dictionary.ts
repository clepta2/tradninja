// src/core/dictionary.ts
// Dicionário otimizado — lazy loading + lookup pré-computado

import ptData from '../i18n/pt.json';
import enData from '../i18n/en.json';
import esData from '../i18n/es.json';
import type { Language } from './types';

type LangMap = { pt: string; en: string; es: string };

// ── Flatten JSON recursivo ──────────────────────────────────
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

// ── Dicionário principal (key = PT text) ────────────────────
export const DICTIONARY: Record<string, LangMap> = {};

// ── Lookup por texto (O(1)) ────────────────────────────────
const LOOKUP_BY_TEXT = new Map<string, LangMap>();

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
    }
  }

  // ── Extras pré-definidos (merginho em lote) ──────────────
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

// ── Lookup rápido por texto (pré-computado) ─────────────────
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

// ── Tamanho do dicionário ───────────────────────────────────
export function dictionarySize(): number {
  buildDictionary();
  return Object.keys(DICTIONARY).length;
}
