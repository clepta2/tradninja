# Como Usar - TradNinja

Guia passo a passo para integrar a plataforma de tradução no seu projeto.

## 1. Instalação

### Opção A: npm install
```bash
npm install tradninja
```

### Opção B: Cópia manual
```bash
cp -r translation/src/ /seu/projeto/src/translation/
```

### Opção C: git submodule
```bash
git submodule add https://github.com/clepta2/tradninja.git translation
```

## 2. Configuração do Provider

Envolva sua aplicação com o `TranslationProvider`:

```tsx
// App.tsx
import { TranslationProvider } from 'tradninja';

export default function App() {
  return (
    <TranslationProvider defaultLocale="pt" supportedLocales={['pt', 'en', 'es']}>
      <MeuApp />
    </TranslationProvider>
  );
}
```

## 3. Usando o Hook

Acesse as funções de tradução via `useTranslation`:

```tsx
import { useTranslation } from 'tradninja';

function MinhaTela() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <View>
      <Text>{t('Bem-vindo ao app!')}</Text>
      <Text>Idioma atual: {locale}</Text>
      <Button title="EN" onPress={() => changeLocale('en')} />
      <Button title="ES" onPress={() => changeLocale('es')} />
    </View>
  );
}
```

## 4. Componentes T e Trans

### T - Componente simples
```tsx
import { T } from 'tradninja';

// Uso básico
<T k="Configurações" />

// Com estilo
<T k="Enviar" style={{ color: '#CCFF00', fontWeight: 'bold' }} />

// Com locale específico
<T k="Bem-vindo" locale="en" />
```

### Trans - Com parâmetros
```tsx
import { Trans } from 'tradninja';

// Interpolação simples
<Trans k="{name} fez {count} treinos" name="João" count={10} />

// Parâmetros fitness
<Trans k="{calories} kcal queimadas" calories={500} />
<Trans k="Nível {level} desbloqueado!" level={5} />
```

## 5. Scan de Strings Hardcoded

Encontre strings não traduzidas no projeto:

```typescript
import { scanForStrings } from 'tradninja';

const strings = scanForStrings('./app');
console.log(`Encontradas ${strings.length} strings para traduzir`);

strings.forEach(s => {
  console.log(`${s.file}:${s.line} - "${s.original}"`);
});
```

## 6. Tradução de SEO

Traduza meta tags para todas as línguas:

```typescript
import { translateSEO } from 'tradninja';

const seo = translateSEO('home', {
  title: 'Fitness App - Treine em Casa',
  description: 'App de treinos personalizados para você',
  keywords: ['fitness', 'treino', 'exercício'],
});

// Gera { pt: {...}, en: {...}, es: {...} }
```

## 7. Dica: Dicionário Customizado

O engine já vem com 500+ termos fitness. Para termos novos, adicione em `core/dictionary.ts`:

```typescript
const EXTRA_CUSTOM: [string, string, string][] = [
  ['Meu termo', 'My term', 'Mi término'],
  ['Outro termo', 'Other term', 'Otro término'],
];

for (const [pt, en, es] of EXTRA_CUSTOM) {
  if (!DICTIONARY[pt]) DICTIONARY[pt] = { en, es };
}
```

## 8. Performance

Todas as traduções são cached automaticamente. Para configuração avançada:

```typescript
import { configure } from 'tradninja';

configure({
  maxSize: 10000,   // máximo de entradas em cache
  ttlMs: 7200000,  // 2 horas
});
```

## Próximos Passos

- [API Reference](./API-REFERENCE.md) - Documentação completa da API
- [Módulos](./MODULOS.md) - Detalhes de cada módulo
- [Exportar](./EXPORTAR.md) - Como exportar para outros projetos
