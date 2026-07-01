# API Reference - TradNinja

Referência completa de todas as funções e componentes.

## Core

### `createTranslator(config?)`
Cria uma instância do tradutor com cache, fallback e regras gramaticais.

```typescript
const translator = createTranslator({ cacheEnabled: true, defaultTarget: 'en' });
const result = translator.translate('Bom dia', { target: 'en' });
// { text: 'Good morning', source: 'pt', target: 'en', matched: true }
```

**Config**: `defaultSource`, `defaultTarget`, `cacheEnabled`, `cacheTtlMs`, `cacheMaxSize`, `fallbackEnabled`

**Métodos**: `translate(text, opts?)`, `translateObject(obj, target)`, `translateProject(dir, opts)`

### `cache` (get, set, clear, configure, getStats)
Cache LRU em memória. Configure: `configure({ maxSize: 10000, ttlMs: 7200000 })`

---

## Módulos

### `scanForStrings(dir)`
Escaneia .tsx procurando strings hardcoded em PT. Retorna `ScanResult[]` com file, line, column, original, context.

### `generateTranslations(strings, dictionary)`
Gera `{ pt: [...], en: [...], es: [...] }` a partir de strings escaneadas.

### `extractComments(filePath)` / `translateComments(filePath, target)`
Extrai e traduz comentários // e /* */ de um arquivo.

### `translateSEO(screenName, data)`
Traduz title, description, keywords para PT/EN/ES. Retorna `Record<Language, SEOData>`.

### `generateMetaFiles(screens)`
Gera objetos `export const meta` para múltiplas telas.

### `translateVideoMetadata(video)`
Traduz títulos, descrições e tags fitness (peito→chest, perna→leg).

### `translateContent(text, options)`
Traduz conteúdo dinâmico com regras fitness (séries→sets) e fallback. Retorna `{ text, matched, confidence }`.

---

## React

### `<TranslationProvider defaultLocale="pt">`
Provider de contexto. Props: `defaultLocale`, `supportedLocales`.

### `useTranslation()`
Retorna `{ t, locale, changeLocale, translate, supportedLocales }`.

### `<T k="Bem-vindo" locale="en" style={{fontSize: 20}} />`
Renderiza `<Text>` traduzido. Props: `k`, `locale`, `params`, `style`, `numberOfLines`.

### `<Trans k="{name} fez {count} treinos" name="João" count={10} />`
Componente com interpolação. Props: `k`, `name`, `count`, `exercise`, `value`, `params`, `locale`, `style`.

---

## Tipos

```typescript
type Language = 'pt' | 'en' | 'es';
interface TranslationResult { text: string; source: Language; target: Language; fromCache: boolean; matched: boolean; }
interface ScanResult { file: string; line: number; column: number; original: string; context: string; }
interface SEOData { title: string; description: string; keywords: string[]; lang: Language; }
interface ContentResult { text: string; matched: boolean; confidence: number; }
```
