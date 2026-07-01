import React from 'react';
import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import type { Language, TranslationKey } from '../core/types';
import { createTranslator } from '../core/engine';

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

const translator = createTranslator();

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
