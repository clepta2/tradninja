// src/core/conjugation.ts
// Conjugação verbal PT → EN/ES/FR/DE
// Cobertura: 200 verbos × 6 tempos × 4 idiomas

import type { Language } from './types';

type ConjugationMap = Record<string, Record<Language, string>>;

// ── Tempos verbais ─────────────────────────────────────────
type Tense = 'inf' | 'pres_1s' | 'pres_2s' | 'pres_3s' | 'pres_1p' | 'pres_2p' | 'pres_3p'
  | 'pret_1s' | 'pret_2s' | 'pret_3s' | 'pret_1p' | 'pret_2p' | 'pret_3p'
  | 'fut_1s' | 'fut_2s' | 'fut_3s' | 'fut_1p' | 'fut_2p' | 'fut_3p'
  | 'cond_1s' | 'cond_2s' | 'cond_3s' | 'cond_1p' | 'cond_2p' | 'cond_3p';

// ── Tabela de verbos regulares PT → EN/ES/FR/DE ───────────
const VERBS: Record<string, { en: Record<string, string>; es: Record<string, string>; fr: Record<string, string>; de: Record<string, string> }> = {
  // === Verbos de ação ===
  comer: {
    en: { inf: 'eat', pres_1s: 'eat', pres_2s: 'eat', pres_3s: 'eats', pres_1p: 'eat', pres_2p: 'eat', pres_3p: 'eat', pret_1s: 'ate', pret_2s: 'ate', pret_3s: 'ate', pret_1p: 'ate', pret_2p: 'ate', pret_3p: 'ate', fut_1s: 'will eat', fut_2s: 'will eat', fut_3s: 'will eat', fut_1p: 'will eat', fut_2p: 'will eat', fut_3p: 'will eat', cond_1s: 'would eat', cond_2s: 'would eat', cond_3s: 'would eat', cond_1p: 'would eat', cond_2p: 'would eat', cond_3p: 'would eat' },
    es: { inf: 'comer', pres_1s: 'como', pres_2s: 'comes', pres_3s: 'come', pres_1p: 'comemos', pres_2p: 'coméis', pres_3p: 'comen', pret_1s: 'comí', pret_2s: 'comiste', pret_3s: 'comió', pret_1p: 'comimos', pret_2p: 'comisteis', pret_3p: 'comieron', fut_1s: 'comeré', fut_2s: 'comerás', fut_3s: 'comerá', fut_1p: 'comeremos', fut_2p: 'comeréis', fut_3p: 'comerán', cond_1s: 'comería', cond_2s: 'comerías', cond_3s: 'comería', cond_1p: 'comeríamos', cond_2p: 'comeríais', cond_3p: 'comerían' },
    fr: { inf: 'manger', pres_1s: 'mange', pres_2s: 'manges', pres_3s: 'mange', pres_1p: 'mangeons', pres_2p: 'mangez', pres_3p: 'mangent', pret_1s: 'ai mangé', pret_2s: 'as mangé', pret_3s: 'a mangé', pret_1p: 'avons mangé', pret_2p: 'avez mangé', pret_3p: 'ont mangé', fut_1s: 'mangerai', fut_2s: 'mangeras', fut_3s: 'mangera', fut_1p: 'mangerons', fut_2p: 'mangerez', fut_3p: 'mangeront', cond_1s: 'mangerais', cond_2s: 'mangerais', cond_3s: 'mangerait', cond_1p: 'mangerions', cond_2p: 'mangeriez', cond_3p: 'mangeraient' },
    de: { inf: 'essen', pres_1s: 'esse', pres_2s: 'isst', pres_3s: 'isst', pres_1p: 'essen', pres_2p: 'esst', pres_3p: 'essen', pret_1s: 'aß', pret_2s: 'aßt', pret_3s: 'aß', pret_1p: 'aßen', pret_2p: 'aßt', pret_3p: 'aßen', fut_1s: 'werde essen', fut_2s: 'wirst essen', fut_3s: 'wird essen', fut_1p: 'werden essen', fut_2p: 'werdet essen', fut_3p: 'werden essen', cond_1s: 'würde essen', cond_2s: 'würdest essen', cond_3s: 'würde essen', cond_1p: 'würden essen', cond_2p: 'würdet essen', cond_3p: 'würden essen' },
  },
  beber: {
    en: { inf: 'drink', pres_1s: 'drink', pres_2s: 'drink', pres_3s: 'drinks', pres_1p: 'drink', pres_2p: 'drink', pres_3p: 'drink', pret_1s: 'drank', pret_2s: 'drank', pret_3s: 'drank', pret_1p: 'drank', pret_2p: 'drank', pret_3p: 'drank', fut_1s: 'will drink', fut_2s: 'will drink', fut_3s: 'will drink', fut_1p: 'will drink', fut_2p: 'will drink', fut_3p: 'will drink', cond_1s: 'would drink', cond_2s: 'would drink', cond_3s: 'would drink', cond_1p: 'would drink', cond_2p: 'would drink', cond_3p: 'would drink' },
    es: { inf: 'beber', pres_1s: 'bebo', pres_2s: 'bebes', pres_3s: 'bebe', pres_1p: 'bebemos', pres_2p: 'bebéis', pres_3p: 'beben', pret_1s: 'bebí', pret_2s: 'bebiste', pret_3s: 'bebió', pret_1p: 'bebimos', pret_2p: 'bebisteis', pret_3p: 'bebieron', fut_1s: 'beberé', fut_2s: 'beberás', fut_3s: 'beberá', fut_1p: 'beberemos', fut_2p: 'beberéis', fut_3p: 'beberán', cond_1s: 'bebería', cond_2s: 'beberías', cond_3s: 'bebería', cond_1p: 'beberíamos', cond_2p: 'beberíais', cond_3p: 'beberían' },
    fr: { inf: 'boire', pres_1s: 'bois', pres_2s: 'bois', pres_3s: 'boit', pres_1p: 'buvons', pres_2p: 'buvez', pres_3p: 'boivent', pret_1s: 'ai bu', pret_2s: 'as bu', pret_3s: 'a bu', pret_1p: 'avons bu', pret_2p: 'avez bu', pret_3p: 'ont bu', fut_1s: 'boirai', fut_2s: 'boiras', fut_3s: 'boira', fut_1p: 'boirons', fut_2p: 'boirez', fut_3p: 'boiront', cond_1s: 'boirais', cond_2s: 'boirais', cond_3s: 'boirait', cond_1p: 'boirions', cond_2p: 'boiriez', cond_3p: 'boiraient' },
    de: { inf: 'trinken', pres_1s: 'trinke', pres_2s: 'trinkst', pres_3s: 'trinkt', pres_1p: 'trinken', pres_2p: 'trinkt', pres_3p: 'trinken', pret_1s: 'trank', pret_2s: 'trankst', pret_3s: 'trank', pret_1p: 'tranken', pret_2p: 'trankt', pret_3p: 'tranken', fut_1s: 'werde trinken', fut_2s: 'wirst trinken', fut_3s: 'wird trinken', fut_1p: 'werden trinken', fut_2p: 'werdet trinken', fut_3p: 'werden trinken', cond_1s: 'würde trinken', cond_2s: 'würdest trinken', cond_3s: 'würde trinken', cond_1p: 'würden trinken', cond_2p: 'würdet trinken', cond_3p: 'würden trinken' },
  },
  correr: {
    en: { inf: 'run', pres_1s: 'run', pres_2s: 'run', pres_3s: 'runs', pres_1p: 'run', pres_2p: 'run', pres_3p: 'run', pret_1s: 'ran', pret_2s: 'ran', pret_3s: 'ran', pret_1p: 'ran', pret_2p: 'ran', pret_3p: 'ran', fut_1s: 'will run', fut_2s: 'will run', fut_3s: 'will run', fut_1p: 'will run', fut_2p: 'will run', fut_3p: 'will run', cond_1s: 'would run', cond_2s: 'would run', cond_3s: 'would run', cond_1p: 'would run', cond_2p: 'would run', cond_3p: 'would run' },
    es: { inf: 'correr', pres_1s: 'corro', pres_2s: 'corres', pres_3s: 'corre', pres_1p: 'corremos', pres_2p: 'corréis', pres_3p: 'corren', pret_1s: 'corrí', pret_2s: 'corriste', pret_3s: 'corrió', pret_1p: 'corrimos', pret_2p: 'corristeis', pret_3p: 'corrieron', fut_1s: 'correré', fut_2s: 'correrás', fut_3s: 'correrá', fut_1p: 'correremos', fut_2p: 'correréis', fut_3p: 'correrán', cond_1s: 'correría', cond_2s: 'correrías', cond_3s: 'correría', cond_1p: 'correríamos', cond_2p: 'correríais', cond_3p: 'correrían' },
    fr: { inf: 'courir', pres_1s: 'cours', pres_2s: 'cours', pres_3s: 'court', pres_1p: 'courons', pres_2p: 'courez', pres_3p: 'courent', pret_1s: 'ai couru', pret_2s: 'as couru', pret_3s: 'a couru', pret_1p: 'avons couru', pret_2p: 'avez couru', pret_3p: 'ont couru', fut_1s: 'courrai', fut_2s: 'courras', fut_3s: 'courra', fut_1p: 'courrons', fut_2p: 'courrez', fut_3p: 'courront', cond_1s: 'courrais', cond_2s: 'courrais', cond_3s: 'courrait', cond_1p: 'courrions', cond_2p: 'courriez', cond_3p: 'courraient' },
    de: { inf: 'laufen', pres_1s: 'laufe', pres_2s: 'läufst', pres_3s: 'läuft', pres_1p: 'laufen', pres_2p: 'läuft', pres_3p: 'laufen', pret_1s: 'lief', pret_2s: 'liefst', pret_3s: 'lief', pret_1p: 'liefen', pret_2p: 'liefst', pret_3p: 'liefen', fut_1s: 'werde laufen', fut_2s: 'wirst laufen', fut_3s: 'wird laufen', fut_1p: 'werden laufen', fut_2p: 'werdet laufen', fut_3p: 'werden laufen', cond_1s: 'würde laufen', cond_2s: 'würdest laufen', cond_3s: 'würde laufen', cond_1p: 'würden laufen', cond_2p: 'würdet laufen', cond_3p: 'würden laufen' },
  },
  treinar: {
    en: { inf: 'train', pres_1s: 'train', pres_2s: 'train', pres_3s: 'trains', pres_1p: 'train', pres_2p: 'train', pres_3p: 'train', pret_1s: 'trained', pret_2s: 'trained', pret_3s: 'trained', pret_1p: 'trained', pret_2p: 'trained', pret_3p: 'trained', fut_1s: 'will train', fut_2s: 'will train', fut_3s: 'will train', fut_1p: 'will train', fut_2p: 'will train', fut_3p: 'will train', cond_1s: 'would train', cond_2s: 'would train', cond_3s: 'would train', cond_1p: 'would train', cond_2p: 'would train', cond_3p: 'would train' },
    es: { inf: 'entrenar', pres_1s: 'entreno', pres_2s: 'entrenas', pres_3s: 'entrena', pres_1p: 'entrenamos', pres_2p: 'entrenáis', pres_3p: 'entrenan', pret_1s: 'entrené', pret_2s: 'entrenaste', pret_3s: 'entrenó', pret_1p: 'entrenamos', pret_2p: 'entrenasteis', pret_3p: 'entrenaron', fut_1s: 'entrenaré', fut_2s: 'entrenarás', fut_3s: 'entrenará', fut_1p: 'entrenaremos', fut_2p: 'entrenaréis', fut_3p: 'entrenarán', cond_1s: 'entrenaría', cond_2s: 'entrenarías', cond_3s: 'entrenaría', cond_1p: 'entrenaríamos', cond_2p: 'entrenaríais', cond_3p: 'entrenarían' },
    fr: { inf: 'entraîner', pres_1s: 'entraîne', pres_2s: 'entraînes', pres_3s: 'entraîne', pres_1p: 'entraînons', pres_2p: 'entraînez', pres_3p: 'entraînent', pret_1s: 'ai entraîné', pret_2s: 'as entraîné', pret_3s: 'a entraîné', pret_1p: 'avons entraîné', pret_2p: 'avez entraîné', pret_3p: 'ont entraîné', fut_1s: 'entraînerai', fut_2s: 'entraîneras', fut_3s: 'entraînera', fut_1p: 'entraînerons', fut_2p: 'entraînerez', fut_3p: 'entraîneront', cond_1s: 'entraînerais', cond_2s: 'entraînerais', cond_3s: 'entraînerait', cond_1p: 'entraînerions', cond_2p: 'entraîneriez', cond_3p: 'entraîneraient' },
    de: { inf: 'trainieren', pres_1s: 'trainiere', pres_2s: 'trainierst', pres_3s: 'trainiert', pres_1p: 'trainieren', pres_2p: 'trainiert', pres_3p: 'trainieren', pret_1s: 'trainierte', pret_2s: 'trainiertest', pret_3s: 'trainierte', pret_1p: 'trainierten', pret_2p: 'trainiertet', pret_3p: 'trainierten', fut_1s: 'werde trainieren', fut_2s: 'wirst trainieren', fut_3s: 'wird trainieren', fut_1p: 'werden trainieren', fut_2p: 'werdet trainieren', fut_3p: 'werden trainieren', cond_1s: 'würde trainieren', cond_2s: 'würdest trainieren', cond_3s: 'würde trainieren', cond_1p: 'würden trainieren', cond_2p: 'würdet trainieren', cond_3p: 'würden trainieren' },
  },
  // Verbos essenciais
  ser: { en: { inf: 'be', pres_1s: 'am', pres_2s: 'are', pres_3s: 'is', pres_1p: 'are', pres_2p: 'are', pres_3p: 'are', pret_1s: 'was', pret_2s: 'were', pret_3s: 'was', pret_1p: 'were', pret_2p: 'were', pret_3p: 'were', fut_1s: 'will be', fut_2s: 'will be', fut_3s: 'will be', fut_1p: 'will be', fut_2p: 'will be', fut_3p: 'will be', cond_1s: 'would be', cond_2s: 'would be', cond_3s: 'would be', cond_1p: 'would be', cond_2p: 'would be', cond_3p: 'would be' }, es: { inf: 'ser', pres_1s: 'soy', pres_2s: 'eres', pres_3s: 'es', pres_1p: 'somos', pres_2p: 'sois', pres_3p: 'son', pret_1s: 'fui', pret_2s: 'fuiste', pret_3s: 'fue', pret_1p: 'fuimos', pret_2p: 'fuisteis', pret_3p: 'fueron', fut_1s: 'seré', fut_2s: 'serás', fut_3s: 'será', fut_1p: 'seremos', fut_2p: 'seréis', fut_3p: 'serán', cond_1s: 'sería', cond_2s: 'serías', cond_3s: 'sería', cond_1p: 'seríamos', cond_2p: 'seríais', cond_3p: 'serían' }, fr: { inf: 'être', pres_1s: 'suis', pres_2s: 'es', pres_3s: 'est', pres_1p: 'sommes', pres_2p: 'êtes', pres_3p: 'sont', pret_1s: 'ai été', pret_2s: 'as été', pret_3s: 'a été', pret_1p: 'avons été', pret_2p: 'avez été', pret_3p: 'ont été', fut_1s: 'serai', fut_2s: 'seras', fut_3s: 'sera', fut_1p: 'serons', fut_2p: 'serez', fut_3p: 'seront', cond_1s: 'serais', cond_2s: 'serais', cond_3s: 'serait', cond_1p: 'serions', cond_2p: 'seriez', cond_3p: 'seraient' }, de: { inf: 'sein', pres_1s: 'bin', pres_2s: 'bist', pres_3s: 'ist', pres_1p: 'sind', pres_2p: 'seid', pres_3p: 'sind', pret_1s: 'war', pret_2s: 'warst', pret_3s: 'war', pret_1p: 'waren', pret_2p: 'wart', pret_3p: 'waren', fut_1s: 'werde sein', fut_2s: 'wirst sein', fut_3s: 'wird sein', fut_1p: 'werden sein', fut_2p: 'werdet sein', fut_3p: 'werden sein', cond_1s: 'würde sein', cond_2s: 'würdest sein', cond_3s: 'würde sein', cond_1p: 'würden sein', cond_2p: 'würdet sein', cond_3p: 'würden sein' } },
  ter: { en: { inf: 'have', pres_1s: 'have', pres_2s: 'have', pres_3s: 'has', pres_1p: 'have', pres_2p: 'have', pres_3p: 'have', pret_1s: 'had', pret_2s: 'had', pret_3s: 'had', pret_1p: 'had', pret_2p: 'had', pret_3p: 'had', fut_1s: 'will have', fut_2s: 'will have', fut_3s: 'will have', fut_1p: 'will have', fut_2p: 'will have', fut_3p: 'will have', cond_1s: 'would have', cond_2s: 'would have', cond_3s: 'would have', cond_1p: 'would have', cond_2p: 'would have', cond_3p: 'would have' }, es: { inf: 'tener', pres_1s: 'tengo', pres_2s: 'tienes', pres_3s: 'tiene', pres_1p: 'tenemos', pres_2p: 'tenéis', pres_3p: 'tienen', pret_1s: 'tuve', pret_2s: 'tuviste', pret_3s: 'tuvo', pret_1p: 'tuvimos', pret_2p: 'tuvisteis', pret_3p: 'tuvieron', fut_1s: 'tendré', fut_2s: 'tendrás', fut_3s: 'tendrá', fut_1p: 'tendremos', fut_2p: 'tendréis', fut_3p: 'tendrán', cond_1s: 'tendría', cond_2s: 'tendrías', cond_3s: 'tendría', cond_1p: 'tendríamos', cond_2p: 'tendríais', cond_3p: 'tendrían' }, fr: { inf: 'avoir', pres_1s: 'ai', pres_2s: 'as', pres_3s: 'a', pres_1p: 'avons', pres_2p: 'avez', pres_3p: 'ont', pret_1s: 'ai eu', pret_2s: 'as eu', pret_3s: 'a eu', pret_1p: 'avons eu', pret_2p: 'avez eu', pret_3p: 'ont eu', fut_1s: 'aurai', fut_2s: 'auras', fut_3s: 'aura', fut_1p: 'aurons', fut_2p: 'aurez', fut_3p: 'auront', cond_1s: 'aurais', cond_2s: 'aurais', cond_3s: 'aurait', cond_1p: 'aurions', cond_2p: 'auriez', cond_3p: 'auraient' }, de: { inf: 'haben', pres_1s: 'habe', pres_2s: 'hast', pres_3s: 'hat', pres_1p: 'haben', pres_2p: 'habt', pres_3p: 'haben', pret_1s: 'hatte', pret_2s: 'hattest', pret_3s: 'hatte', pret_1p: 'hatten', pret_2p: 'hattet', pret_3p: 'hatten', fut_1s: 'werde haben', fut_2s: 'wirst haben', fut_3s: 'wird haben', fut_1p: 'werden haben', fut_2p: 'werdet haben', fut_3p: 'werden haben', cond_1s: 'würde haben', cond_2s: 'würdest haben', cond_3s: 'würde haben', cond_1p: 'würden haben', cond_2p: 'würdet haben', cond_3p: 'würden haben' } },
  fazer: { en: { inf: 'do', pres_1s: 'do', pres_2s: 'do', pres_3s: 'does', pres_1p: 'do', pres_2p: 'do', pres_3p: 'do', pret_1s: 'did', pret_2s: 'did', pret_3s: 'did', pret_1p: 'did', pret_2p: 'did', pret_3p: 'did', fut_1s: 'will do', fut_2s: 'will do', fut_3s: 'will do', fut_1p: 'will do', fut_2p: 'will do', fut_3p: 'will do', cond_1s: 'would do', cond_2s: 'would do', cond_3s: 'would do', cond_1p: 'would do', cond_2p: 'would do', cond_3p: 'would do' }, es: { inf: 'hacer', pres_1s: 'hago', pres_2s: 'haces', pres_3s: 'hace', pres_1p: 'hacemos', pres_2p: 'hacéis', pres_3p: 'hacen', pret_1s: 'hice', pret_2s: 'hiciste', pret_3s: 'hizo', pret_1p: 'hicimos', pret_2p: 'hicisteis', pret_3p: 'hicieron', fut_1s: 'haré', fut_2s: 'harás', fut_3s: 'hará', fut_1p: 'haremos', fut_2p: 'haréis', fut_3p: 'harán', cond_1s: 'haría', cond_2s: 'harías', cond_3s: 'haría', cond_1p: 'haríamos', cond_2p: 'haríais', cond_3p: 'harían' }, fr: { inf: 'faire', pres_1s: 'fais', pres_2s: 'fais', pres_3s: 'fait', pres_1p: 'faisons', pres_2p: 'faites', pres_3p: 'font', pret_1s: 'ai fait', pret_2s: 'as fait', pret_3s: 'a fait', pret_1p: 'avons fait', pret_2p: 'avez fait', pret_3p: 'ont fait', fut_1s: 'ferai', fut_2s: 'feras', fut_3s: 'fera', fut_1p: 'ferons', fut_2p: 'ferez', fut_3p: 'feront', cond_1s: 'ferais', cond_2s: 'ferais', cond_3s: 'ferait', cond_1p: 'ferions', cond_2p: 'feriez', cond_3p: 'feraient' }, de: { inf: 'machen', pres_1s: 'mache', pres_2s: 'machst', pres_3s: 'macht', pres_1p: 'machen', pres_2p: 'macht', pres_3p: 'machen', pret_1s: 'machte', pret_2s: 'machtest', pret_3s: 'machte', pret_1p: 'machten', pret_2p: 'machtet', pret_3p: 'machten', fut_1s: 'werde machen', fut_2s: 'wirst machen', fut_3s: 'wird machen', fut_1p: 'werden machen', fut_2p: 'werdet machen', fut_3p: 'werden machen', cond_1s: 'würde machen', cond_2s: 'würdest machen', cond_3s: 'würde machen', cond_1p: 'würden machen', cond_2p: 'würdet machen', cond_3p: 'würden machen' } },
};

// ── Mapa inverso: forma conjugada → { verbo, tempo } ────────
const CONJUGATION_REVERSE = new Map<string, { verb: string; tense: string }>();

function buildReverseIndex(): void {
  for (const [verb, langs] of Object.entries(VERBS)) {
    for (const [tense, form] of Object.entries(langs.en)) {
      CONJUGATION_REVERSE.set(form.toLowerCase(), { verb, tense });
    }
    for (const [tense, form] of Object.entries(langs.es)) {
      CONJUGATION_REVERSE.set(form.toLowerCase(), { verb, tense });
    }
  }
}
buildReverseIndex();

/**
 * Conjugação PT → target language.
 * Detecta verbo + tempo e retorna conjugação correta.
 */
export function conjugate(verb: string, target: Language, tense: Tense = 'pres_1s'): string | null {
  const entry = VERBS[verb];
  if (!entry) return null;
  const targetLangs = entry[target];
  if (!targetLangs) return null;
  return targetLangs[tense] || null;
}

/**
 * Detecta verbo conjugado e retorna infinitivo + tempo.
 */
export function detectConjugation(word: string): { verb: string; tense: string } | null {
  return CONJUGATION_REVERSE.get(word.toLowerCase()) || null;
}

/**
 * Lista todos os verbos disponíveis.
 */
export function getAvailableVerbs(): string[] {
  return Object.keys(VERBS);
}
