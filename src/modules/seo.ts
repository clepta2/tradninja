import type { Language } from '../core/types';
import { createTranslator } from '../core/engine';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  lang: Language;
}

interface ScreenSEO {
  title: string;
  description: string;
  keywords: string[];
}

interface SEOTranslations {
  [screenName: string]: Record<Language, SEOData>;
}

const translator = createTranslator();

export function translateSEO(
  screenName: string,
  data: ScreenSEO
): Record<Language, SEOData> {
  const targets: Language[] = ['en', 'es'];
  const result: Partial<Record<Language, SEOData>> = {};

  result.pt = {
    title: data.title,
    description: data.description,
    keywords: [...data.keywords],
    lang: 'pt',
  };

  for (const lang of targets) {
    const titleResult = translator.translate(data.title, {
      source: 'pt',
      target: lang,
    });
    const descResult = translator.translate(data.description, {
      source: 'pt',
      target: lang,
    });

    const translatedKeywords = data.keywords.map((kw) => {
      const r = translator.translate(kw, { source: 'pt', target: lang });
      return r.matched ? r.text : kw;
    });

    result[lang] = {
      title: titleResult.text,
      description: descResult.text,
      keywords: translatedKeywords,
      lang,
    };
  }

  return result as Record<Language, SEOData>;
}

export function generateMetaFiles(
  screens: Record<string, ScreenSEO>
): SEOTranslations {
  const result: SEOTranslations = {};

  for (const [name, data] of Object.entries(screens)) {
    result[name] = translateSEO(name, data);
  }

  return result;
}

export function exportSEOFiles(
  translations: SEOTranslations,
  outputDir: string
): void {
  const fs = require('fs');
  const path = require('path');

  for (const [screenName, langs] of Object.entries(translations)) {
    const fileContent = JSON.stringify(langs, null, 2);
    const filePath = path.join(outputDir, `seo-${screenName}.json`);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }
}

export function generateMetaObject(
  screenName: string,
  data: ScreenSEO
): string {
  const translations = translateSEO(screenName, data);

  const lines: string[] = [
    'export const meta = {',
  ];

  for (const [lang, seo] of Object.entries(translations)) {
    lines.push(`  ${lang}: {`);
    lines.push(`    title: "${seo.title}",`);
    lines.push(`    description: "${seo.description}",`);
    lines.push(`    keywords: [${seo.keywords.map((k) => `"${k}"`).join(', ')}],`);
    lines.push(`    lang: "${lang}",`);
    lines.push('  },');
  }

  lines.push('};');
  return lines.join('\n');
}
