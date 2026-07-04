// src/react/Trans.tsx
// Componente de tradução com parâmetros — usa contexto se disponível

import React, { useContext } from 'react';
import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import type { Language, TranslationKey } from '../core/types';
import { TranslationContext } from './Provider';
import { createTranslator } from '../core/engine';

let fallbackTranslator: ReturnType<typeof createTranslator> | null = null;

interface TransProps extends TextProps {
  k: TranslationKey;
  params?: Record<string, string | number>;
  name?: string;
  count?: number;
  exercise?: string;
  value?: string | number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  locale?: Language;
}

export function Trans({
  k, params, name, count, exercise, value,
  style, numberOfLines, locale, ...rest,
}: TransProps): React.JSX.Element {
  const merged: Record<string, string | number> = { ...params };
  if (name !== undefined) merged.name = name;
  if (count !== undefined) merged.count = count;
  if (exercise !== undefined) merged.exercise = exercise;
  if (value !== undefined) merged.value = value;

  let translated: string;
  try {
    const ctx = useContext(TranslationContext);
    translated = ctx?.t ? ctx.t(k, merged) : _fallback(k, locale || 'pt', merged);
  } catch {
    translated = _fallback(k, locale || 'pt', merged);
  }

  return (
    <Text style={style} numberOfLines={numberOfLines} {...rest}>
      {translated}
    </Text>
  );
}

function _fallback(k: string, target: Language, params: Record<string, string | number>): string {
  if (!fallbackTranslator) fallbackTranslator = createTranslator();
  return fallbackTranslator.translate(k, { target, params }).text;
}
