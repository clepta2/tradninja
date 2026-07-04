// src/react/Trans.tsx
// Componente de tradução com parâmetros

import React from 'react';
import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import type { Language, TranslationKey } from '../core/types';
import { createTranslator } from '../core/engine';

interface TransProps extends TextProps {
  /** Chave de tradução (ex: 'home.greeting') */
  k: TranslationKey;
  /** Parâmetros extras */
  params?: Record<string, string | number>;
  /** Nome do usuário */
  name?: string;
  /** Contador (para plural) */
  count?: number;
  /** Nome do exercício */
  exercise?: string;
  /** Valor numérico */
  value?: string | number;
  /** Estilo do texto */
  style?: StyleProp<TextStyle>;
  /** Número de linhas */
  numberOfLines?: number;
  /** Idioma destino */
  locale?: Language;
}

const translator = createTranslator();

/**
 * Componente de tradução com parâmetros.
 *
 * @example
 * ```tsx
 * <Trans k="home.greeting" name="João" />
 * <Trans k="workout.exercises" count={5} exercise="agachamento" />
 * ```
 */
export function Trans({
  k,
  params,
  name,
  count,
  exercise,
  value,
  style,
  numberOfLines,
  locale = 'pt',
  ...rest
}: TransProps): React.JSX.Element {
  const mergedParams: Record<string, string | number> = { ...params };

  if (name !== undefined) mergedParams.name = name;
  if (count !== undefined) mergedParams.count = count;
  if (exercise !== undefined) mergedParams.exercise = exercise;
  if (value !== undefined) mergedParams.value = value;

  const result = translator.translate(k, {
    source: 'pt',
    target: locale,
    params: mergedParams,
  });

  return (
    <Text style={style} numberOfLines={numberOfLines} {...rest}>
      {result.text}
    </Text>
  );
}
