import React from 'react';
import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import type { Language, TranslationKey } from '../core/types';
import { createTranslator } from '../core/engine';

interface TProps extends TextProps {
  k: TranslationKey;
  params?: Record<string, string | number>;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  locale?: Language;
}

const translator = createTranslator();

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
