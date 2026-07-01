/**
 * ICU MessageFormat Module
 *
 * Local implementation of ICU MessageFormat resolution.
 * Supports plural, select, and selectordinal patterns
 * without external ICU library dependencies.
 */

type ICUParams = Record<string, string | number>;

interface PluralCase {
  exact?: number;
  keyword: string;
  body: string;
}

interface SelectCase {
  keyword: string;
  body: string;
}

function parsePluralArgs(
  body: string
): PluralCase[] {
  const cases: PluralCase[] = [];
  const regex = /(=?\d+)\s*\{([^}]*)\}|(\w+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(body)) !== null) {
    if (match[1] !== undefined) {
      cases.push({
        exact: parseInt(match[1].replace(/^=/, ''), 10),
        keyword: match[1],
        body: match[2].trim(),
      });
    } else if (match[3] !== undefined) {
      cases.push({
        keyword: match[3],
        body: match[4].trim(),
      });
    }
  }

  return cases;
}

function parseSelectArgs(body: string): SelectCase[] {
  const cases: SelectCase[] = [];
  const regex = /(\w+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(body)) !== null) {
    cases.push({
      keyword: match[1],
      body: match[2].trim(),
    });
  }

  return cases;
}

function resolvePlural(
  value: number,
  args: string
): string {
  const cases = parsePluralArgs(args);

  for (const c of cases) {
    if (c.exact !== undefined && c.exact === value) {
      return c.body.replace(/#/g, String(value));
    }
  }

  const pluralForm = value === 0
    ? 'zero'
    : value === 1
      ? 'one'
      : value === 2 && args.includes('two')
        ? 'two'
        : 'other';

  for (const c of cases) {
    if (c.keyword === pluralForm) {
      return c.body.replace(/#/g, String(value));
    }
  }

  for (const c of cases) {
    if (c.keyword === 'other') {
      return c.body.replace(/#/g, String(value));
    }
  }

  return String(value);
}

function resolveSelect(
  value: string,
  args: string
): string {
  const cases = parseSelectArgs(args);

  for (const c of cases) {
    if (c.keyword === value) {
      return c.body;
    }
  }

  for (const c of cases) {
    if (c.keyword === 'other') {
      return c.body;
    }
  }

  return value;
}

const ICU_PATTERN =
  /\{(\w+),\s*(plural|select|selectordinal),\s*((?:[^{}]*|\{[^{}]*\})*)\}/g;

export function resolveICU(
  text: string,
  params: ICUParams
): string {
  // First pass: resolve ICU patterns (plural, select, etc.)
  let result = text.replace(ICU_PATTERN, (_, key, type, args) => {
    const value = params[key];

    if (value === undefined) {
      return `{${key}, ${type}, ${args}}`;
    }

    switch (type) {
      case 'plural':
        return resolvePlural(Number(value), args);
      case 'select':
        return resolveSelect(String(value), args);
      case 'selectordinal':
        return resolvePlural(Number(value), args);
      default:
        return String(value);
    }
  });

  // Second pass: resolve simple {key} interpolations
  result = result.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });

  return result;
}

export function hasICUMessages(text: string): boolean {
  return ICU_PATTERN.test(text);
}

export function extractICUKeys(text: string): string[] {
  const keys: string[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(ICU_PATTERN.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    keys.push(match[1]);
  }

  return [...new Set(keys)];
}
