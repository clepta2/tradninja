# Exportar - TradNinja

Três métodos para compartilhar a plataforma de tradução entre projetos.

## Método 1: Copiar Pasta (Recomendado para monorepo)

```bash
# Do projeto translation
cp -r translation/src/ /outro/projeto/src/translation/

# Ou no Windows (PowerShell)
Copy-Item -Recurse translation/src/ /outro/projeto/src/translation/
```

### Vantagens
- Simples e direto
- Sem configuração extra
- Funciona com qualquer bundler

### Desvantagens
- Cópia estática (não sincroniza automaticamente)
- Precisa atualizar manualmente

## Método 2: npm link (Desenvolvimento local)

```bash
# No projeto translation (global)
cd translation/
npm link

# No projeto que vai usar
cd /outro/projeto/
npm link tradninja
```

### Usar no código
```tsx
import { TranslationProvider, useTranslation } from 'tradninja';
```

### Desfazer link
```bash
# No projeto consumidor
npm unlink tradninja
npm install

# No projeto translation
npm unlink
```

### Vantagens
- Sincroniza em tempo real
- Ideal para desenvolvimento

### Desvantagens
- Só funciona localmente
- Quebra se o caminho mudar

## Método 3: npm publish (Produção)

```bash
# No projeto translation
npm login
npm publish
```

### Configuração necessária

package.json já vem configurado:
```json
{
  "name": "tradninja",
  "version": "1.0.0",
  "main": "src/index.ts",
  "files": ["src/"],
  "license": "MIT"
}
```

### Usar em qualquer projeto
```bash
npm install tradninja
```

### Versionamento
```bash
# Patch (correções)
npm version patch  # 1.0.0 → 1.0.1

# Minor (funcionalidades)
npm version minor  # 1.0.0 → 1.1.0

# Major (breaking changes)
npm version major  # 1.0.0 → 2.0.0
```

### Vantagens
- Funciona em qualquer lugar
- Versionamento semântico
- Dependências gerenciadas

### Desvantagens
- Requer conta npm
- Precisa publicar mudanças

## Comparação

| Critério | Copiar | npm link | npm publish |
|----------|--------|----------|-------------|
| Setup | Fácil | Médio | Complexo |
| Sincronização | Manual | Automática | Publicação |
| Multi-projeto | Cópia manual | Link manual | Install |
| Produção | Funciona | Não recomendado | Ideal |
| Versionamento | Não | Não | Sim |

## Recomendação

- **Desenvolvimento local**: npm link
- **Monorepo**: Copiar pasta
- **Produção/multi-projeto**: npm publish
