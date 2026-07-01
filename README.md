# TradNinja

Motor de traducao offline 100% local para React/React Native/Node.js.

[![Tests](https://img.shields.io/badge/tests-161+-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](#)
[![Offline](https://img.shields.io/badge/100%25-offline-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-yellow)](#)

## Por que TradNinja?

| Feature | API Traducao | TradNinja |
|---------|-------------|-----------|
| Velocidade | ~300ms | **~0.02ms** |
| Custo | $20+/10k chars | **Gratis** |
| Internet | Obrigatoria | **Nao precisa** |
| Privacidade | Dados enviamos | **100% local** |
| Disponibilidade | 99.9% uptime | **100% offline** |

## Instalacao

```bash
npm install tradninja
```

Ou copie a pasta `src/` para o seu projeto.

## Uso Rapido

```typescript
import { createTranslator } from 'tradninja';

const t = createTranslator({ source: 'pt', target: 'en' });

t.translate('Salvar');           // 'Save'
t.translate('Excluir');          // 'Delete'
t.translate('Ola mundo');        // 'Hello world'
```

## React

```tsx
import { T, Trans, useTranslation } from 'tradninja/react';

// Simples
<T k="auth.login" />

// Com interpolacao
<Trans k="home.greeting" name={userName} />

// Hook
const { t, locale, changeLocale } = useTranslation();
```

## 3 Idiomas Instantaneos

- **PT** (portugues) — idioma fonte
- **EN** (ingles) — traduzido automaticamente
- **ES** (espanhol) — traduzido automaticamente

## 36 Modulos Disponiveis

### Core (sempre incluido)
Engine, dictionary 1400+ termos, rules, patterns, cache, types

### Modulos de Texto
- `ui` — detecta strings hardcoded
- `comments` — traduz comentarios de codigo
- `seo` — meta tags traduzidas

### Modulos de Midia
- `video` — descricoes de video
- `content` — conteudo dinamico

### Modulos Avancados
- `pseudo` — teste de layout com caracteres estendidos
- `icu` — plural, genero, selectordinal
- `rtl` — suporte a idiomas da direita pra esquerda

## Como Adicionar Novos Termos

Edite `src/core/dictionary.ts`:

```typescript
export const DICTIONARY = {
  'Salvar': { en: 'Save', es: 'Guardar' },
  'Excluir': { en: 'Delete', es: 'Eliminar' },
  // Adicione seus termos aqui
};
```

## Estrutura

```
src/
├── core/
│   ├── engine.ts        ← Motor principal
│   ├── dictionary.ts    ← 1400+ termos
│   ├── rules.ts         ← Regras gramaticais
│   ├── patterns.ts      ← Templates
│   ├── cache.ts         ← Cache TTL
│   └── types.ts         ← TypeScript types
├── modules/
│   ├── ui.ts, comments.ts, seo.ts
│   ├── video.ts, content.ts
│   └── pseudo.ts, icu.ts, rtl.ts
├── react/
│   ├── T.tsx, Trans.tsx
│   ├── Provider.tsx
│   └── useTranslation.ts
└── index.ts
```

## Performance

- **~0.02ms** por traducao (cache hit)
- **~1700 linhas** totais
- **Zero dependencias externas**
- **Tree-shaking** habilitado

## Licenca

MIT License - use como quiser.
