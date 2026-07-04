# TradNinja

Motor de traducao offline 100% local para React/React Native/Node.js.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](#)
[![Offline](https://img.shields.io/badge/100%25-offline-brightgreen)](#)
[![Languages](https://img.shields.io/badge/31-idiomas-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-yellow)](#)

## Por que TradNinja?

| Feature | API Traducao | TradNinja |
|---------|-------------|-----------|
| Velocidade | ~300ms | **~0.02ms** |
| Custo | $20+/10k chars | **Gratis** |
| Internet | Obrigatoria | **Nao precisa** |
| Privacidade | Dados enviamos | **100% local** |
| Idiomas | ~20 | **31 idiomas** |
| Termos | variavel | **25.000+** |

## Instalacao

```bash
npm install tradninja
```

Ou copie a pasta `src/` para o seu projeto.

## Uso Rapido

```typescript
import { createTranslator } from 'tradninja';

const t = createTranslator({ defaultTarget: 'en' });

t.translate('Salvar').text;   // 'Save'
t.translate('Excluir').text;  // 'Delete'
t.translate('Bom dia').text;  // 'Good morning'

// Com parametros
t.translate('Ola, {name}!', { params: { name: 'Joao' } }).text;
// 'Hello, Joao!'

// Traduzir objeto inteiro
t.translateObject({ title: 'Inicio', btn: 'Salvar' }, 'es');
// { title: 'Inicio', btn: 'Guardar' }

// Batch translate (em lote)
await t.translateBatch(['Salvar', 'Excluir', 'Editar'], 'ja');
// ['保存', '削除', '編集']

// Cross-translate (via pivô)
await t.crossTranslate('Salvar', 'pt', 'ja', 'en');
// PT→EN: 'Save' → EN→JA: '保存'
```

## React

```tsx
import { T, Trans, TranslationProvider, useTranslation } from 'tradninja/react';

// Provider
<TranslationProvider defaultLocale="pt">
  <App />
</TranslationProvider>

// Simples
<T k="auth.login" />

// Com interpolacao
<Trans k="home.greeting" name={userName} />

// Hook
const { t, locale, changeLocale } = useTranslation();
t('common.save') // 'Save'
```

## 31 Idiomas

```
pt  en  es  fr  de  it  ja  ko  zh  ar  ru  hi
nl  pl  sv  da  no  fi  cs  el  hu  ro  uk  id
ms  th  tr  he  bn  sw
```

Adicione novos idiomas criando `src/i18n/{idioma}.json` — o cross-translate funciona automaticamente.

## 13 Funcoes Disponiveis

| Funcao | Uso |
|--------|-----|
| `translate(text, opts)` | Traduz texto |
| `translateObject(obj, target)` | Traduz objeto inteiro |
| `translateBatch(texts, target)` | Traduz em lote |
| `crossTranslate(text, src, tgt, pivot)` | Via pivô (PT→EN→JA) |
| `lookupByText(text, target)` | Busca O(1) por texto |
| `lookupByKey(key, target)` | Busca O(1) por chave |
| `hasTranslation(text, target)` | Verifica se existe |
| `getTranslations(text)` | Todas as traduções |
| `getAvailableLanguages(text)` | Idiomas disponíveis |
| `dictionarySize()` | Termos no dicionário |
| `loadedLanguages()` | Idiomas carregados |
| `clearLanguageCache()` | Limpa cache |
| `getDictionaryStats()` | Estatísticas completas |

## Modulos Extras

| Modulo | Uso |
|--------|-----|
| `ui` | Detecta strings hardcoded |
| `comments` | Traduz comentarios de codigo |
| `seo` | Meta tags traduzidas |
| `video` | Descricoes de video |
| `content` | Conteudo dinamico |
| `pseudo` | Teste de layout |
| `icu` | Plural, genero, selectordinal |
| `rtl` | Idiomas direita→esquerda |

## Como Adicionar Novos Idiomas

1. Criar `src/i18n/{idioma}.json` com traduções
2. Adicionar código ao tipo `Language` em `src/core/types.ts`
3. Cross-translate já funciona automaticamente

```typescript
// src/i18n/hi.json (Hindi)
{ "common": { "save": "सहेजें", "delete": "हटाएं" } }

// src/core/types.ts
export type Language = 'pt' | 'en' | ... | 'hi';
```

## Estrutura

```
src/
├── core/
│   ├── engine.ts         ← Motor principal (createTranslator)
│   ├── dictionary.ts     ← Lazy loading + batch + cross-translate
│   ├── rules.ts          ← Gramatica (artigos, possessivos, negacao)
│   ├── patterns.ts       ← Templates com interpolacao
│   ├── patterns-data.ts  ← Dados dos templates (PT/EN/ES/FR/DE)
│   ├── cache.ts          ← LRU com TTL + stats
│   └── types.ts          ← 31 Language + interfaces
├── modules/              ← Modulos extras
├── react/                ← Components React (T, Trans, Provider)
├── i18n/                 ← Dicionarios por idioma (lazy load)
└── index.ts              ← Barrel exports
```

## Performance

- **~0.02μs** por traducao (Map O(1))
- **25.000+ termos** por idioma
- **Cache LRU** com TTL configuravel
- **Batch buffering** a 16ms (frame rate)
- **Grammar rules** regex pre-compilados
- **Zero dependencias externas**
- **Tree-shaking** habilitado

## Licenca

MIT License - use como quiser.
