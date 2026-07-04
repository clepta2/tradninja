// scripts/compress-verbs.cjs
const fs = require('fs');
const file = fs.readFileSync('src/core/verbs-data.ts', 'utf8');

// Header: tudo antes de export const VERBS
const headerEnd = file.indexOf('export const VERBS');
const header = file.substring(0, headerEnd);

// Extrai entries
const match = file.match(/export const VERBS[^{]*\{([\s\S]*?)\n\};/);
if (!match) { console.log('Regex failed'); process.exit(1); }

const raw = match[1];
const entryLines = raw.split('\n').map(l => l.trim()).filter(l => l.match(/^['"]/));
console.log('Entries:', entryLines.length);

const output = header + 'export const VERBS: Record<string, Record<string, string>> = {\n' + entryLines.join('\n') + '\n};\n';

fs.writeFileSync('src/core/verbs-data.ts', output);
console.log('Saida:', output.split('\n').length, 'linhas');
