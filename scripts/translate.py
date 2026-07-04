"""
Traduz PT→EN/ES/FR em batches usando deep-translator (Google Translate).
Cada batch traduz 80 palavras de uma vez. Salva a cada batch.

Uso:
  python scripts/translate.py              # traduz todos os 3 idiomas
  python scripts/translate.py --lang en    # só inglês
  python scripts/translate.py --resume     # retoma do último ponto
"""

import json
import sys
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Execute: pip install deep-translator")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
I18N_DIR = SCRIPT_DIR.parent / "src" / "i18n"
PROGRESS_FILE = I18N_DIR / "progress.json"
BATCH_SIZE = 80  # palavras por request (Google limita ~5000 chars)
DELAY = 1.0      # segundos entre batches

def load_json(name):
    p = I18N_DIR / name
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}

def save_json(name, data):
    (I18N_DIR / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"en": {}, "es": {}, "fr": {}}

def save_progress(p):
    PROGRESS_FILE.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding="utf-8")

def translate_batch(translator, words):
    """Traduz um batch de palavras. Divide em sub-batches se necessário."""
    results = {}
    # Google limita ~5000 chars por request
    # Dividi em sub-batches de 40 pra segurança
    sub = 40
    for i in range(0, len(words), sub):
        chunk = words[i:i+sub]
        try:
            translated = translator.translate_batch(chunk)
            for w, t in zip(chunk, translated):
                results[w] = t if t else w
        except Exception as e:
            print(f"\n    ⚠️  Erro batch: {e}")
            for w in chunk:
                results[w] = w
        time.sleep(0.5)
    return results

def translate_lang(lang, words, progress):
    lang_data = progress[lang]
    remaining = [w for w in words if w not in lang_data]

    if not remaining:
        print(f"  ✅ {lang}: completo ({len(words)} palavras)")
        return

    print(f"  🔄 {lang}: {len(remaining)} restantes...")
    translator = GoogleTranslator(source="pt", target=lang)
    total = len(remaining)
    done = 0

    for i in range(0, total, BATCH_SIZE):
        batch = remaining[i:i+BATCH_SIZE]
        translations = translate_batch(translator, batch)
        lang_data.update(translations)
        done += len(batch)

        # Salva a cada batch
        save_progress(progress)
        save_json(f"{lang}.json", lang_data)

        pct = round(done / total * 100)
        print(f"    {lang}: {done}/{total} ({pct}%)", end="\r")
        time.sleep(DELAY)

    print(f"\n  ✅ {lang}: {done} palavras traduzidas")

def main():
    args = sys.argv[1:]
    lang_filter = None
    resume = "--resume" in args

    if "--lang" in args:
        idx = args.index("--lang")
        lang_filter = args[idx + 1]

    print("🌐 Tradutor em batches (Google Translate)\n")

    pt = load_json("pt.json")
    words = list(pt.keys())
    print(f"📝 {len(words)} palavras PT\n")

    progress = load_progress()

    # Mostra progresso anterior
    for l in ["en", "es", "fr"]:
        c = len(progress.get(l, {}))
        if c > 0:
            print(f"  📊 {l}: {c}/{len(words)} já traduzidas")

    if resume:
        print("\n🔄 Retomando...\n")
    else:
        print()

    langs = [lang_filter] if lang_filter else ["en", "es", "fr"]

    for lang in langs:
        translate_lang(lang, words, progress)

    print("\n✨ Concluído! Arquivos: en.json, es.json, fr.json")

if __name__ == "__main__":
    main()
