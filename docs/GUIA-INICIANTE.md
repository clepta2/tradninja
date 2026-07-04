# TradNinja - Guia do Iniciante

## O que é?

TradNinja traduz texto automaticamente entre idiomas, **sem internet**, **grátis**, em menos de 1ms.

---

## Instale (2 minutos)

```bash
# Copie a pasta src/ para o seu projeto
# Não precisa de npm install!
```

Ou se usa npm:
```bash
npm install tradninja
```

---

## Primeira tradução (30 segundos)

### JavaScript / TypeScript
```javascript
import { quick } from 'tradninja/src/react/quick';

const t = quick('pt', 'en');   // traduz de PT para EN

console.log(t('Salvar'));      // → "Save"
console.log(t('Excluir'));     // → "Delete"
console.log(t('Bom dia'));     // → "Good morning"
```

### React / React Native
```jsx
import { TranslationProvider, T, useTranslation } from 'tradninja/src/react';

// 1. Envolva seu app
function App() {
  return (
    <TranslationProvider defaultLocale="pt">
      <MinhaTela />
    </TranslationProvider>
  );
}

// 2. Use o hook
function MinhaTela() {
  const { t, changeLocale } = useTranslation();
  return (
    <View>
      <Text>{t('Bem-vindo!')}</Text>
      <Button title="EN" onPress={() => changeLocale('en')} />
    </View>
  );
}

// 3. Ou use o componente <T>
<T k="Enviar" />
<T k="Configurações" style={{ color: '#CCFF00' }} />
```

---

## Recrie seu app em 3 idiomas

```jsx
import { TranslationProvider, T, Trans, useTranslation } from 'tradninja/src/react';

function App() {
  return (
    <TranslationProvider defaultLocale="pt" supportedLocales={['pt', 'en', 'es']}>
      <HomeScreen />
    </TranslationProvider>
  );
}

function HomeScreen() {
  const { t, locale, changeLocale } = useTranslation();
  const traduzir = (texto) => t(texto);

  return (
    <View>
      {/* Trocar idioma */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="🇧🇷 PT" onPress={() => changeLocale('pt')} />
        <Button title="🇺🇸 EN" onPress={() => changeLocale('en')} />
        <Button title="🇪🇸 ES" onPress={() => changeLocale('es')} />
      </View>

      {/* Texto simples */}
      <Text style={styles.title}>{traduzir('Treino do Dia')}</Text>

      {/* Com parâmetros */}
      <Text>{traduzir('Você completou {count} treinos!').replace('{count}', '5')}</Text>

      {/* Ou com <Trans> */}
      <Trans k="Nível {level} desbloqueado!" level={3} />

      {/* Botões */}
      <Button title={traduzir('Iniciar')} onPress={iniciarTreino} />
      <Button title={traduzir('Cancelar')} onPress={cancelar} />
    </View>
  );
}
```

---

## 31 idiomas disponíveis

```
🇧🇷 PT  🇺🇸 EN  🇪🇸 ES  🇫🇷 FR  🇩🇪 DE  🇮🇹 IT
🇯🇵 JA  🇰🇷 KO  🇨🇳 ZH  🇸🇦 AR  🇷🇺 RU  🇮🇳 HI
🇳🇱 NL  🇵🇱 PL  🇸🇪 SV  🇩🇰 DA  🇳🇴 NO  🇫🇮 FI
🇨🇿 CS  🇬🇷 EL  🇭🇺 HU  🇷🇴 RO  🇺🇦 UK  🇮🇩 ID
🇲🇾 MS  🇹🇭 TH  🇹🇷 TR  🇮🇱 HE  🇧🇩 BN  🇰🇪 SW
```

Para adicionar um idioma novo, crie `src/i18n/{código}.json` com as traduções.

---

## Perguntas frequentes

### Não preciso de internet?
Não. Tudo roda localmente no seu dispositivo.

### Preciso de um arquivo de configuração?
Não. Funciona do zero.

### Quanto ocupa no app?
~300KB (dicionários comprimidos). Pode ser menos usando lazy loading.

### Funciona em React Native E em web?
Sim, funciona em qualquer lugar que rode JavaScript.

### Como traduzir textos do usuário (chat, posts)?
```javascript
import { createTranslator } from 'tradninja/src/core/engine';

const t = createTranslator({ defaultTarget: 'en' });
const resultado = t.crossTranslate('Olá, tudo bem?', 'pt', 'ja');
// → Tenta PT→JA direto, depois PT→EN→JA, etc.
```

---

## Próximos passos

- **[API Completa](./API-REFERENCE.md)** — Todas as 13 funções
- **[Exemplos Práticos](./EXEMPLOS.md)** — Copiar e colar
- **[Módulos Extras](./MODULOS.md)** — SEO, UI scanner, ICU
