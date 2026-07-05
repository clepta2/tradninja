// scripts/compress-big-dict.cjs
// Comprime big-dict.ts — 1 entrada por linha, sem espaços extras
const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, '../src/core/big-dict.ts'), 'utf8');

// Extrai entries
const re = /"([^"]+)":(\{[^}]+\})/g;
const entries = [];
let m;
while ((m = re.exec(input)) !== null) {
  try {
    const obj = JSON.parse(m[2]);
    entries.push([m[1], obj]);
  } catch {}
}

console.log(`Entries: ${entries.length}`);

// Gera TS compacto — 1 entry por linha
let ts = '// src/core/big-dict.ts\n';
ts += `// ${entries.length} termos word-to-word (PT→5 idiomas)\n`;
ts += `// Auto-gerado — formato compacto\n\n`;
ts += 'export const BIG_DICT: Record<string, Record<string, string>> = {\n';
for (const [pt, obj] of entries) {
  ts += JSON.stringify(pt) + ':' + JSON.stringify(obj) + ',\n';
}
ts += '};\n';

fs.writeFileSync(path.join(__dirname, '../src/core/big-dict.ts'), ts, 'utf8');
console.log(`Compactado: ${ts.split('\n').length} linhas`);
