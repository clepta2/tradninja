// src/react/T.tsx
// Componente de tradução simples

import React from 'react';
import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import type { Language, TranslationKey } from '../core/types';
import { createTranslator } from '../core/engine';

interface TProps extends TextProps {
  /** Chave de tradução (ex: 'common.save') */
  k: TranslationKey;
  /** Parâmetros para interpolação */
  params?: Record<string, string | number>;
  /** Estilo do texto */
  style?: StyleProp<TextStyle>;
  /** Número de linhas */
  numberOfLines?: number;
  /** Idioma destino */
  locale?: Language;
}

const translator = createTranslator();

/**
 * Componente de tradução simples.
 *
 * @example
 * ```tsx
 * <T k="common.save" />
 * <T k="home.greeting" params={{ name: 'João' }} />
 * ```
 */
export function T({
  k,
  params,
  style,
  numberOfLines,
  locale = 'pt',
  ...rest
}: TProps): React.JSX.Element {
  const result = translator.translate(k, {
    source: 'pt',
    target: locale,
    params,
  });

  return (
    <Text style={style} numberOfLines={numberOfLines} {...rest}>
      {result.text}
    </Text>
  );
}
