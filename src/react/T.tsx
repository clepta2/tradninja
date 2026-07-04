// src/react/T.tsx
// Componente de tradução simples — usa contexto se disponível, fallback para singleton

import React, { useContext } from 'react';
import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import type { Language, TranslationKey } from '../core/types';
import { TranslationContext, type TranslationContextValue } from './Provider';
import { createTranslator } from '../core/engine';

let fallbackTranslator: ReturnType<typeof createTranslator> | null = null;

interface TProps extends TextProps {
  k: TranslationKey;
  params?: Record<string, string | number>;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  locale?: Language;
}

export function T({ k, params, style, numberOfLines, locale, ...rest }: TProps): React.JSX.Element {
  let translated: string;

  try {
    const ctx = useContext(TranslationContext);
    if (ctx?.t) {
      translated = ctx.t(k, params);
    } else {
      if (!fallbackTranslator) fallbackTranslator = createTranslator();
      translated = fallbackTranslator.translate(k, { target: locale || 'pt', params }).text;
    }
  } catch {
    if (!fallbackTranslator) fallbackTranslator = createTranslator();
    translated = fallbackTranslator.translate(k, { target: locale || 'pt', params }).text;
  }

  return (
    <Text style={style} numberOfLines={numberOfLines} {...rest}>
      {translated}
    </Text>
  );
}
