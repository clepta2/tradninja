# Exemplos Práticos - TradNinja

Copie e cole no seu projeto.

---

## 1. App React Native completo com 3 idiomas

```tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { TranslationProvider, useTranslation } from 'tradninja/src/react';

export default function App() {
  return (
    <TranslationProvider defaultLocale="pt" supportedLocales={['pt', 'en', 'es']}>
      <Home />
    </TranslationProvider>
  );
}

function Home() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <View style={s.container}>
      {/* Seletor de idioma */}
      <View style={s.langRow}>
        {['pt', 'en', 'es'].map(lang => (
          <TouchableOpacity
            key={lang}
            style={[s.langBtn, locale === lang && s.active]}
            onPress={() => changeLocale(lang)}
          >
            <Text style={[s.langText, locale === lang && s.activeText]}>
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo traduzido */}
      <Text style={s.title}>{t('Treino do Dia')}</Text>
      <Text style={s.subtitle}>{t('30 minutos • Intermediário')}</Text>

      <Button title={t('Iniciar Treino')} onPress={() => {}} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  langBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#555' },
  active: { backgroundColor: '#CCFF00', borderColor: '#CCFF00' },
  langText: { color: '#FFF', fontWeight: 'bold' },
  activeText: { color: '#000' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#999', marginBottom: 30 },
});
```

---

## 2. Tradução rápida sem Provider (qualquer lugar)

```javascript
import { quick } from 'tradninja/src/react/quick';

// Criar tradutor uma vez
const t = quick('pt', 'en');

// Usar em qualquer lugar
console.log(t('Salvar'));           // "Save"
console.log(t('Excluir'));          // "Delete"
console.log(t('Bom dia'));          // "Good morning"
console.log(t('Configurações'));    // "Settings"

// Com parâmetros
console.log(t('Olá, {name}!', { name: 'Maria' }));  // "Hello, Maria!"
console.log(t('{count} treinos', { count: 5 }));     // "5 workouts"
```

---

## 3. Traduzir um objeto inteiro

```javascript
import { quickAll } from 'tradninja/src/react/quick';

const labels = quickAll('pt', 'en', {
  title: 'Início',
  subtitle: 'Seu progresso',
  button: 'Salvar',
  cancel: 'Cancelar',
  error: 'Algo deu errado',
  success: 'Salvo com sucesso!',
});

// labels = { title: "Home", subtitle: "Your progress", button: "Save", ... }
```

---

## 4. Botão de trocar idioma

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'tradninja/src/react';

const FLAGS = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪' };

export function LanguageButton() {
  const { locale, changeLocale, supportedLocales } = useTranslation();

  return (
    <View style={styles.row}>
      {supportedLocales.map(lang => (
        <TouchableOpacity
          key={lang}
          style={[styles.btn, locale === lang && styles.active]}
          onPress={() => changeLocale(lang)}
        >
          <Text style={styles.flag}>{FLAGS[lang]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: { padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#444' },
  active: { backgroundColor: '#CCFF00', borderColor: '#CCFF00' },
  flag: { fontSize: 20 },
});
```

---

## 5. Traduzir mensagens de erro

```javascript
import { quick } from 'tradninja/src/react/quick';

const t = quick('pt', 'en');

const ERROS = {
  'email_invalido': t('E-mail inválido'),
  'senha_curta': t('A senha deve ter no mínimo 6 caracteres'),
  'campos_obrigatorios': t('Preencha todos os campos'),
  'conexao_falhou': t('Erro de conexão. Verifique sua internet'),
  'conta_existe': t('Já existe uma conta com este e-mail'),
};

// Usar:
Alert.alert(ERROS.email_invalido);
```

---

## 6. Traduzir para vários idiomas ao mesmo tempo

```javascript
import { quick } from 'tradninja/src/react/quick';

const paraEn = quick('pt', 'en');
const paraEs = quick('pt', 'es');
const paraFr = quick('pt', 'fr');

const texto = 'Bem-vindo ao app';

console.log(paraEn(texto));  // "Welcome to the app"
console.log(paraEs(texto));  // "Bienvenido a la aplicación"
console.log(paraFr(texto));  // "Bienvenue dans l'application"
```

---

## 7. Cross-translate (traduzir idioma que não tem dicionário direto)

```javascript
import { createTranslator } from 'tradninja/src/core/engine';

const t = createTranslator({ defaultTarget: 'ja' });

// Tenta traduzir PT → JA diretamente
// Se não encontrar, vai via EN (pivot)
const result = t.crossTranslate('Salvar', 'pt', 'ja');
// → PT→EN: "Save" → EN→JA: "保存"
console.log(result);  // "保存"
```

---

## 8. Encontrar strings não traduzidas no projeto

```javascript
import { scanForStrings } from 'tradninja/src/modules/ui';

const strings = scanForStrings('./app');
console.log(`${strings.length} strings para traduzir:`);

strings.forEach(s => {
  console.log(`  ${s.file}:${s.line} → "${s.original}"`);
});
```

---

## 9. Tradução SEO para Google

```javascript
import { translateSEO } from 'tradninja/src/modules/seo';

const seo = translateSEO('home', {
  title: 'NOVAIX Fitness - Treine em Casa',
  description: 'App de treinos personalizados',
  keywords: ['fitness', 'treino', 'exercício'],
});

// seo.en = { title: 'NOVAIX Fitness - Train at Home', ... }
// seo.es = { title: 'NOVAIX Fitness - Entrena en Casa', ... }
```

---

## 10. Checar se uma palavra existe no dicionário

```javascript
import { hasTranslation, getTranslations, dictionarySize } from 'tradninja/src/core/dictionary';

console.log(hasTranslation('Salvar', 'en'));  // true
console.log(hasTranslation('Xablau', 'en'));  // false

console.log(getTranslations('Salvar'));
// { pt: 'Salvar', en: 'Save', es: 'Guardar', fr: 'Sauvegarder', ... }

console.log(dictionarySize());  // 25000
```
