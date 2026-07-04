# API Reference - TradNinja

Referencia completa de todas as funcoes e componentes.

## Core

### `createTranslator(config?)`

Cria uma instancia do tradutor.

```typescript
const translator = createTranslator({
  defaultSource: 'pt',
  defaultTarget: 'en',
  cacheEnabled: true,
  cacheTtlMs: 3600000,
  cacheMaxSize: 5000,
  fallbackEnabled: true,
});
```

**Metodos:**

```typescript
// Traduzir texto
translator.translate('Salvar'); // { text: 'Save', source: 'pt', target: 'en', matched: true, fromCache: false }

// Com parametros
translator.translate('Ola, {name}!', { params: { name: 'Joao' } });
// { text: 'Hello, Joao!' }

// Traduzir objeto inteiro
translator.translateObject({ title: 'Inicio', btn: 'Salvar' }, 'es');
// { title: 'Inicio', btn: 'Guardar' }

// Batch translate
await translator.translateBatch(['Salvar', 'Excluir'], 'ja');
// ['保存', '削除']

// Cross-translate via pivô
await translator.crossTranslate('Salvar', 'pt', 'ja', 'en');
// PT→EN: 'Save' → EN→JA: '保存'
```

---

## Dictionary

### `lookupByText(text, target)`
Busca traducao por texto exato — O(1).

### `lookupByKey(key, target)`
Busca traducao por chave do dicionario — O(1).

### `hasTranslation(text, target)`
Retorna `true` se existe traducao para o idioma.

### `getTranslations(text)`
Retorna todas as traducoes disponiveis para um texto.

### `getAvailableLanguages(text)`
Retorna array com todos os idiomas que tem traducao.

### `crossTranslate(text, source, target, pivot?)`
Traduz via pivô. Tenta automaticamente: direto → en → pt → es → fr → de.

### `dictionarySize()`
Numero total de termos no dicionario.

### `loadedLanguages()`
Idiomas que ja foram carregados.

### `clearLanguageCache()`
Limpa todos os idiomas carregados e o dicionario.

### `getDictionaryStats()`
Retorna `{ totalTerms, loadedLanguages, cachedTranslations, supportedLanguages }`.

### `initDictionary(target)`
Pre-carrega o dicionario PT + idioma alvo. Chamar antes do primeiro lookup.

### `translateBatch(texts, target)`
Traduz multiplos textos em lote com buffering a 16ms.

---

## Rules

### `applyRules(text, source, target)`
Aplica regras gramaticais (artigos, possessivos, negacao).

### `formatNumber(value, target, decimals?)`
Formata numero conforme locale (1.000 vs 1,000 vs 1 000).

### `formatCurrency(value, target, decimals?)`
Formata moeda conforme locale.

### `getGenderMap()`
Retorna mapa de generos traduzidos.

---

## Patterns

### `interpolatePattern(key, params, target?)`
Interpola um template com parametros.

### `getPattern(key)`
Retorna o template completo.

### `PATTERNS`
Mapa com todos os templates (29 patterns fitness/gamification).

---

## Cache

### `Cache.get(source, target, text)`
Busca no cache LRU.

### `Cache.set(source, target, text, value)`
Armazena no cache com TTL.

### `Cache.clear()`
Limpa todo o cache.

### `Cache.size()`
Tamanho atual do cache.

### `Cache.configure({ maxSize?, ttlMs? })`
Configura limites do cache.

### `Cache.getStats()`
Retorna `{ hits, misses, hitRate, size }`.

---

## React

### `<TranslationProvider defaultLocale="pt">`
Provider de contexto. Props: `defaultLocale`, `supportedLocales`.

### `useTranslation()`
Retorna `{ t, locale, changeLocale, translate, supportedLocales, cacheStats }`.

### `<T k="Bem-vindo" locale="en" style={{fontSize: 20}} />`
Renderiza `<Text>` traduzido. Props: `k`, `locale`, `params`, `style`, `numberOfLines`.

### `<Trans k="{name} fez {count} treinos" name="Joao" count={10} />`
Componente com interpolacao. Props: `k`, `name`, `count`, `exercise`, `value`, `params`, `locale`, `style`.

---

## Tipos

```typescript
type Language =
  | 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it'
  | 'ja' | 'ko' | 'zh' | 'ar' | 'ru' | 'hi'
  | 'nl' | 'pl' | 'sv' | 'da' | 'no' | 'fi'
  | 'cs' | 'el' | 'hu' | 'ro' | 'uk' | 'id'
  | 'ms' | 'th' | 'tr' | 'he' | 'bn' | 'sw';

interface TranslationResult {
  text: string;
  source: Language;
  target: Language;
  fromCache: boolean;
  matched: boolean;
}

interface ModuleConfig {
  defaultSource: Language;
  defaultTarget: Language;
  cacheEnabled: boolean;
  cacheTtlMs: number;
  cacheMaxSize: number;
  fallbackEnabled: boolean;
}
```
