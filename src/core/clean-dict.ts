// src/core/clean-dict.ts
// Correções word-to-word para traduções contextuais erradas
// Aplicado em runtime sobre o dicionário existente

import type { Language } from './types';

// 85 correções para palavras com traduções contextuais erradas
// Chave: PT, Valor: traduções corretas word-to-word
export const CLEAN_OVERRIDES: Record<string, Partial<Record<Language, string>>> = {
  // Corpo/Humano
  'preto': { en: 'black', es: 'negro', fr: 'noir', de: 'schwarz', it: 'nero' },
  'filho': { en: 'son', es: 'hijo', fr: 'fils', de: 'Sohn', it: 'figlio' },
  'mulher': { en: 'woman', es: 'mujer', fr: 'femme', de: 'Frau', it: 'donna' },
  'homem': { en: 'man', es: 'hombre', fr: 'homme', de: 'Mann', it: 'uomo' },
  'criança': { en: 'child', es: 'niño', fr: 'enfant', de: 'Kind', it: 'bambino' },
  'olho': { en: 'eye', es: 'ojo', fr: 'œil', de: 'Auge', it: 'occhio' },
  'mão': { en: 'hand', es: 'mano', fr: 'main', de: 'Hand', it: 'mano' },
  'pé': { en: 'foot', es: 'pie', fr: 'pied', de: 'Fuß', it: 'piede' },
  'cabeça': { en: 'head', es: 'cabeza', fr: 'tête', de: 'Kopf', it: 'testa' },
  'boca': { en: 'mouth', es: 'boca', fr: 'bouche', de: 'Mund', it: 'bocca' },
  'orelha': { en: 'ear', es: 'oreja', fr: 'oreille', de: 'Ohr', it: 'orecchio' },
  'nariz': { en: 'nose', es: 'nariz', fr: 'nez', de: 'Nase', it: 'naso' },
  'dente': { en: 'tooth', es: 'diente', fr: 'dent', de: 'Zahn', it: 'dente' },
  'língua': { en: 'tongue', es: 'lengua', fr: 'langue', de: 'Zunge', it: 'lingua' },
  'pescoço': { en: 'neck', es: 'cuello', fr: 'cou', de: 'Nacken', it: 'collo' },
  'ombro': { en: 'shoulder', es: 'hombro', fr: 'épaule', de: 'Schulter', it: 'spalla' },
  'braço': { en: 'arm', es: 'brazo', fr: 'bras', de: 'Arm', it: 'braccio' },
  'perna': { en: 'leg', es: 'pierna', fr: 'jambe', de: 'Bein', it: 'gamba' },
  'joelho': { en: 'knee', es: 'rodilla', fr: 'genou', de: 'Knie', it: 'ginocchio' },
  'costas': { en: 'back', es: 'espalda', fr: 'dos', de: 'Rücken', it: 'schiena' },
  'peito': { en: 'chest', es: 'pecho', fr: 'poitrine', de: 'Brust', it: 'petto' },
  'estômago': { en: 'stomach', es: 'estómago', fr: 'estomac', de: 'Magen', it: 'stomaco' },
  'coração': { en: 'heart', es: 'corazón', fr: 'coeur', de: 'Herz', it: 'cuore' },
  'cérebro': { en: 'brain', es: 'cerebro', fr: 'cerveau', de: 'Gehirn', it: 'cervello' },
  'sangue': { en: 'blood', es: 'sangre', fr: 'sang', de: 'Blut', it: 'sangue' },
  'osso': { en: 'bone', es: 'hueso', fr: 'os', de: 'Knochen', it: 'osso' },
  'músculo': { en: 'muscle', es: 'músculo', fr: 'muscle', de: 'Muskel', it: 'muscolo' },
  'pele': { en: 'skin', es: 'piel', fr: 'peau', de: 'Haut', it: 'pelle' },
  'cabelo': { en: 'hair', es: 'cabello', fr: 'cheveux', de: 'Haar', it: 'capello' },
  // Natureza
  'água': { en: 'water', es: 'agua', fr: 'eau', de: 'Wasser', it: 'acqua' },
  'fogo': { en: 'fire', es: 'fuego', fr: 'feu', de: 'Feuer', it: 'fuoco' },
  'terra': { en: 'earth', es: 'tierra', fr: 'terre', de: 'Erde', it: 'terra' },
  'ar': { en: 'air', es: 'aire', fr: 'air', de: 'Luft', it: 'aria' },
  'sol': { en: 'sun', es: 'sol', fr: 'soleil', de: 'Sonne', it: 'sole' },
  'lua': { en: 'moon', es: 'luna', fr: 'lune', de: 'Mond', it: 'luna' },
  'estrela': { en: 'star', es: 'estrella', fr: 'étoile', de: 'Stern', it: 'stella' },
  'nuvem': { en: 'cloud', es: 'nube', fr: 'nuage', de: 'Wolke', it: 'nuvola' },
  'vento': { en: 'wind', es: 'viento', fr: 'vent', de: 'Wind', it: 'vento' },
  'chuva': { en: 'rain', es: 'lluvia', fr: 'pluie', de: 'Regen', it: 'pioggia' },
  'neve': { en: 'snow', es: 'nieve', fr: 'neige', de: 'Schnee', it: 'neve' },
  'pedra': { en: 'stone', es: 'piedra', fr: 'pierre', de: 'Stein', it: 'pietra' },
  'montanha': { en: 'mountain', es: 'montaña', fr: 'montagne', de: 'Berg', it: 'montagna' },
  'rio': { en: 'river', es: 'río', fr: 'rivière', de: 'Fluss', it: 'fiume' },
  'mar': { en: 'sea', es: 'mar', fr: 'mer', de: 'Meer', it: 'mare' },
  'floresta': { en: 'forest', es: 'bosque', fr: 'forêt', de: 'Wald', it: 'foresta' },
  'pedra': { en: 'rock', es: 'roca', fr: 'rocher', de: 'Fels', it: 'roccia' },
  // Comida
  'comida': { en: 'food', es: 'comida', fr: 'nourriture', de: 'Essen', it: 'cibo' },
  'carne': { en: 'meat', es: 'carne', fr: 'viande', de: 'Fleisch', it: 'carne' },
  'fruta': { en: 'fruit', es: 'fruta', fr: 'fruit', de: 'Obst', it: 'frutta' },
  'legume': { en: 'vegetable', es: 'verdura', fr: 'légume', de: 'Gemüse', it: 'verdura' },
  'pão': { en: 'bread', es: 'pan', fr: 'pain', de: 'Brot', it: 'pane' },
  'leite': { en: 'milk', es: 'leche', fr: 'lait', de: 'Milch', it: 'latte' },
  'ovo': { en: 'egg', es: 'huevo', fr: 'œuf', de: 'Ei', it: 'uovo' },
  'arroz': { en: 'rice', es: 'arroz', fr: 'riz', de: 'Reis', it: 'riso' },
  'feijão': { en: 'beans', es: 'frijoles', fr: 'haricots', de: 'Bohnen', it: 'fagioli' },
  'queijo': { en: 'cheese', es: 'queso', fr: 'fromage', de: 'Käse', it: 'formaggio' },
  'frango': { en: 'chicken', es: 'pollo', fr: 'poulet', de: 'Hähnchen', it: 'pollo' },
  'peixe': { en: 'fish', es: 'pescado', fr: 'poisson', de: 'Fisch', it: 'pesce' },
  'sal': { en: 'salt', es: 'sal', fr: 'sel', de: 'Salz', it: 'sale' },
  'açúcar': { en: 'sugar', es: 'azúcar', fr: 'sucre', de: 'Zucker', it: 'zucchero' },
  'café': { en: 'coffee', es: 'café', fr: 'café', de: 'Kaffee', it: 'caffè' },
  'vinho': { en: 'wine', es: 'vino', fr: 'vin', de: 'Wein', it: 'vino' },
  'cerveja': { en: 'beer', es: 'cerveza', fr: 'bière', de: 'Bier', it: 'birra' },
  // Casa/Objetos
  'casa': { en: 'house', es: 'casa', fr: 'maison', de: 'Haus', it: 'casa' },
  'porta': { en: 'door', es: 'puerta', fr: 'porte', de: 'Tür', it: 'porta' },
  'janela': { en: 'window', es: 'ventana', fr: 'fenêtre', de: 'Fenster', it: 'finestra' },
  'mesa': { en: 'table', es: 'mesa', fr: 'table', de: 'Tisch', it: 'tavolo' },
  'cadeira': { en: 'chair', es: 'silla', fr: 'chaise', de: 'Stuhl', it: 'sedia' },
  'cama': { en: 'bed', es: 'cama', fr: 'lit', de: 'Bett', it: 'letto' },
  'carro': { en: 'car', es: 'coche', fr: 'voiture', de: 'Auto', it: 'macchina' },
  'rua': { en: 'street', es: 'calle', fr: 'rue', de: 'Straße', it: 'strada' },
  'sapato': { en: 'shoe', es: 'zapato', fr: 'chaussure', de: 'Schuh', it: 'scarpa' },
  'camisa': { en: 'shirt', es: 'camisa', fr: 'chemise', de: 'Hemd', it: 'camicia' },
  'livro': { en: 'book', es: 'libro', fr: 'livre', de: 'Buch', it: 'libro' },
  // Conceitos
  'dinheiro': { en: 'money', es: 'dinero', fr: 'argent', de: 'Geld', it: 'denaro' },
  'tempo': { en: 'time', es: 'tiempo', fr: 'temps', de: 'Zeit', it: 'tempo' },
  'vida': { en: 'life', es: 'vida', fr: 'vie', de: 'Leben', it: 'vita' },
  'trabalho': { en: 'work', es: 'trabajo', fr: 'travail', de: 'Arbeit', it: 'lavoro' },
  'escola': { en: 'school', es: 'escuela', fr: 'école', de: 'Schule', it: 'scuola' },
  'lugar': { en: 'place', es: 'lugar', fr: 'lieu', de: 'Ort', it: 'luogo' },
  'amor': { en: 'love', es: 'amor', fr: 'amour', de: 'Liebe', it: 'amore' },
  'morte': { en: 'death', es: 'muerte', fr: 'mort', de: 'Tod', it: 'morte' },
};

/**
 * Aplica correções word-to-word sobre um mapa de tradução.
 * Modifica o mapa in-place para corrigir traduções contextuais erradas.
 */
export function applyCleanOverrides(target: Language, translations: Map<string, string>): void {
  for (const [pt, overrides] of Object.entries(CLEAN_OVERRIDES)) {
    const corrected = overrides[target];
    if (corrected && translations.has(pt)) {
      translations.set(pt, corrected);
    }
  }
}
