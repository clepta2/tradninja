import type { Language } from '../core/types';
import { createTranslator } from '../core/engine';

interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  category?: string;
}

interface TranslatedVideo {
  original: VideoMetadata;
  translations: Record<Language, VideoMetadata>;
}

const translator = createTranslator();

const VIDEO_TAG_MAP: Record<string, Record<Language, string>> = {
  treino: { pt: 'treino', en: 'workout', es: 'entrenamiento' },
  exercicio: { pt: 'exercício', en: 'exercise', es: 'ejercicio' },
  academia: { pt: 'academia', en: 'gym', es: 'gimnasio' },
  fitness: { pt: 'fitness', en: 'fitness', es: 'fitness' },
  musculação: { pt: 'musculação', en: 'weight training', es: 'pesas' },
  funcional: { pt: 'funcional', en: 'functional', es: 'funcional' },
  alongamento: { pt: 'alongamento', en: 'stretching', es: 'estiramiento' },
  aquecimento: { pt: 'aquecimento', en: 'warm-up', es: 'calentamiento' },
  cardio: { pt: 'cardio', en: 'cardio', es: 'cardio' },
  hiit: { pt: 'HIIT', en: 'HIIT', es: 'HIIT' },
  crossfit: { pt: 'CrossFit', en: 'CrossFit', es: 'CrossFit' },
  yoga: { pt: 'yoga', en: 'yoga', es: 'yoga' },
  pilates: { pt: 'pilates', en: 'pilates', es: 'pilates' },
  perna: { pt: 'perna', en: 'leg', es: 'pierna' },
  peito: { pt: 'peito', en: 'chest', es: 'pecho' },
  costas: { pt: 'costas', en: 'back', es: 'espalda' },
  ombro: { pt: 'ombro', en: 'shoulder', es: 'hombro' },
  braço: { pt: 'braço', en: 'arm', es: 'brazo' },
  abdômen: { pt: 'abdômen', en: 'abs', es: 'abdomen' },
  glúteos: { pt: 'glúteos', en: 'glutes', es: 'glúteos' },
  iniciante: { pt: 'iniciante', en: 'beginner', es: 'principiante' },
  intermediário: { pt: 'intermediário', en: 'intermediate', es: 'intermedio' },
  avançado: { pt: 'avançado', en: 'advanced', es: 'avanzado' },
};

function translateTag(tag: string, target: Language): string {
  const normalized = tag.toLowerCase().trim();
  const mapped = VIDEO_TAG_MAP[normalized];
  if (mapped && mapped[target]) return mapped[target];

  const result = translator.translate(tag, {
    source: 'pt',
    target,
  });
  return result.matched ? result.text : tag;
}

export function translateVideoMetadata(
  video: VideoMetadata
): TranslatedVideo {
  const targets: Language[] = ['en', 'es'];
  const translations: Record<Language, VideoMetadata> = {
    pt: { ...video },
  };

  for (const lang of targets) {
    const title = translator.translate(video.title, {
      source: 'pt',
      target: lang,
    });
    const description = translator.translate(video.description, {
      source: 'pt',
      target: lang,
    });
    const tags = video.tags.map((t) => translateTag(t, lang));
    const category = video.category
      ? translator.translate(video.category, { source: 'pt', target: lang }).text
      : undefined;

    translations[lang] = {
      title: title.text,
      description: description.text,
      tags,
      category,
    };
  }

  return { original: video, translations };
}

export function exportVideoFiles(
  videos: TranslatedVideo[],
  outputDir: string
): void {
  const fs = require('fs');
  const path = require('path');

  for (const video of videos) {
    const fileName = video.original.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filePath = path.join(outputDir, `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(video.translations, null, 2), 'utf-8');
  }
}
