# Modulos - TradNinja

Cada módulo resolve um problema específico da tradução.

## Visão Geral

```
translation/src/
├── core/           ← Base de tudo
├── modules/        ← Módulos especializados
│   ├── ui.ts       ← 15% do peso
│   ├── comments.ts ← 10% do peso
│   ├── seo.ts      ← 8% do peso
│   ├── video.ts    ← 12% do peso
│   └── content.ts  ← 6% do peso
└── react/          ← Interface React
```

---

## ui.ts — Scan de Strings

**Quando usar**: Encontrar strings hardcoded em componentes .tsx

**O que faz**:
- Lê arquivos .tsx recursivamente
- Detecta strings em português via regex
- Ignora imports, comentários, paths de arquivo
- Retorna localização exata (arquivo, linha, coluna)

```typescript
import { scanForStrings } from 'tradninja';

const results = scanForStrings('./app');
// Resultado: [{ file, line, column, original, context }]
```

**Casos de uso**:
- Code review antes de merge
- Migração de código existente
- Validação de tradução

---

## comments.ts — Comentários

**Quando usar**: Traduzir comentários em código para documentação

**O que faz**:
- Extrai comentários de linha (//) e bloco (/* */)
- Traduz usando o engine
- Substitui no arquivo original

```typescript
import { translateComments } from 'tradninja';

const result = translateComments('./src/utils.ts', 'en');
// result.translated = comentários traduzidos
```

**Casos de uso**:
- Documentação multi-idioma
- Compartilhamento de código com equipes internacionais
- Open source projects

---

## seo.ts — SEO & Meta Tags

**Quando usar**: Gerar meta tags traduzidas para cada tela

**O que faz**:
- Traduz title, description e keywords
- Gera objetos `export const meta` prontos
- Suporta múltiplas telas

```typescript
import { translateSEO } from 'tradninja';

const seo = translateSEO('home', {
  title: 'Fitness App - Treine em Casa',
  description: 'App de treinos personalizados',
  keywords: ['fitness', 'treino', 'exercício'],
});
// Gera versões PT, EN, ES
```

**Casos de uso**:
- Apps multi-idioma
- SEO para marketplaces
- Landing pages

---

## video.ts — Metadados de Vídeo

**Quando usar**: Traduzir títulos, descrições e tags de vídeos

**O que faz**:
- Mapeia termos fitness (peito→chest, perna→leg, etc.)
- Traduz títulos e descrições
- Gera tags traduzidas

```typescript
import { translateVideoMetadata } from 'tradninja';

const result = translateVideoMetadata({
  title: 'Treino de Peito e Tríceps',
  description: '45 minutos de treino intenso',
  tags: ['peito', 'tríceps', 'musculação'],
});
```

**Casos de uso**:
- Plataformas de vídeo fitness
- YouTube metadata
- Catálogos de conteúdo

---

## content.ts — Conteúdo Dinâmico

**Quando usar**: Traduzir texto gerado por usuários ou sistema

**O que faz**:
- Regras para termos fitness (séries→sets, reps→reps)
- Interpolação de variáveis
- Fallback inteligente

```typescript
import { translateContent } from 'tradninja';

const result = translateContent('3 séries de 12 reps', { target: 'en' });
// { text: '3 sets of 12 reps', matched: true, confidence: 0.8 }
```

**Casos de uso**:
- Descrições de treinos geradas
- Instruções de exercício
- Mensagens personalizadas

---

## Quando usar cada módulo

| Cenário | Módulo |
|---------|--------|
| Review de código | ui.ts |
| Documentação | comments.ts |
| App Store / SEO | seo.ts |
| Conteúdo de vídeo | video.ts |
| Instruções dinâmicas | content.ts |
| UI do app | react/T, react/Trans |
| Gerenciamento de idioma | react/Provider + useTranslation |
