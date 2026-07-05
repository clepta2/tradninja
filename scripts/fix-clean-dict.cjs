// scripts/fix-clean-dict.cjs
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/core/clean-dict.ts');
const content = fs.readFileSync(file, 'utf8');

// Fix broken parentheses to braces
const fixed = content
  .replace(/it:'([^']+)'\),/g, "it:'$1'},")
  .replace(/it:'([^']+)'\)\};/g, "it:'$1'};\n");

// Remove duplicate keys (keep last occurrence)
const lines = fixed.split('\n');
const seen = new Set();
const deduped = [];
for (const line of lines) {
  const keyMatch = line.match(/^  '([^']+)':/);
  if (keyMatch) {
    if (seen.has(keyMatch[1])) continue;
    seen.add(keyMatch[1]);
  }
  deduped.push(line);
}

fs.writeFileSync(file, deduped.join('\n'), 'utf8');
console.log('Fix done. Lines:', deduped.length);
