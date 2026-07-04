// src/core/phrasebook.ts
// Frases prontas para 31 idiomas — cumprimentos, fitness, viagem, etc.

import type { Language } from './types';

type PhraseMap = Record<Language, string>;

interface PhraseCategory {
  id: string;
  label: string;
  phrases: Array<{ key: string; translations: PhraseMap }>;
}

const PHRASEBOOK: PhraseCategory[] = [
  {
    id: 'greetings',
    label: 'Cumprimentos',
    phrases: [
      { key: 'bom_dia', translations: { pt:'Bom dia', en:'Good morning', es:'Buenos días', fr:'Bonjour', de:'Guten Morgen', it:'Buongiorno', ja:'おはようございます', ko:'좋은 아침이에요', zh:'早上好', ar:'صباح الخير', ru:'Доброе утро', hi:'सुप्रभात', nl:'Goedemorgen', pl:'Dzień dobry', sv:'God morgon', da:'Godmorgen', no:'God morgen', fi:'Hyvää huomenta', cs:'Dobré ráno', el:'Καλημέρα', hu:'Jó reggelt', ro:'Bună dimineața', uk:'Доброго ранку', id:'Selamat pagi', ms:'Selamat pagi', th:'สวัสดีตอนเช้า', tr:'Günaydın', he:'בוקר טוב', bn:'সুপ্রভাত', sw:'Habari za asubuhi' }},
      { key: 'boa_tarde', translations: { pt:'Boa tarde', en:'Good afternoon', es:'Buenas tardes', fr:'Bonjour', de:'Guten Tag', it:'Buon pomeriggio', ja:'こんにちは', ko:'안녕하세요', zh:'下午好', ar:'مساء الخير', ru:'Добрый день', hi:'नमस्ते', nl:'Goedemiddag', pl:'Dzień dobry', sv:'God eftermiddag', da:'God eftermiddag', no:'God ettermiddag', fi:'Hyvää iltapäivää', cs:'Dobré odpoledne', el:'Καλησπέρα', hu:'Jó napot', ro:'Bună ziua', uk:'Доброго дня', id:'Selamat siang', ms:'Selamat petang', th:'สวัสดีตอนบ่าย', tr:'İyi günler', he:'צהריים טובים', bn:'শুভ অপরাহ্ন', sw:'Habari za mchana' }},
      { key: 'boa_noite', translations: { pt:'Boa noite', en:'Good evening', es:'Buenas noches', fr:'Bonsoir', de:'Guten Abend', it:'Buona sera', ja:'こんばんは', ko:'안녕하세요', zh:'晚上好', ar:'مساء الخير', ru:'Добрый вечер', hi:'शुभ संध्या', nl:'Goedenavond', pl:'Dobry wieczór', sv:'God kväll', da:'God aften', no:'God kveld', fi:'Hyvää iltaa', cs:'Dobrý večer', el:'Καλησπέρα', hu:'Jó estét', ro:'Bună seara', uk:'Доброго вечора', id:'Selamat malam', ms:'Selamat malam', th:'สวัสดีตอนเย็น', tr:'İyi akşamlar', he:'ערב טוב', bn:'শুভ সন্ধ্যা', sw:'Habari za jioni' }},
      { key: 'obrigado', translations: { pt:'Obrigado', en:'Thank you', es:'Gracias', fr:'Merci', de:'Danke', it:'Grazie', ja:'ありがとう', ko:'감사합니다', zh:'谢谢', ar:'شكرا', ru:'Спасибо', hi:'धन्यवाद', nl:'Dank je', pl:'Dziękuję', sv:'Tack', da:'Tak', no:'Takk', fi:'Kiitos', cs:'Děkuji', el:'Ευχαριστώ', hu:'Köszönöm', ro:'Mulțumesc', uk:'Дякую', id:'Terima kasih', ms:'Terima kasih', th:'ขอบคุณ', tr:'Teşekkürler', he:'תודה', bn:'ধন্যবাদ', sw:'Asante' }},
      { key: 'desculpa', translations: { pt:'Desculpe', en:'Sorry', es:'Lo siento', fr:'Désolé', de:'Entschuldigung', it:'Scusa', ja:'すみません', ko:'죄송합니다', zh:'对不起', ar:'آسف', ru:'Извините', hi:'माफ़ कीजिए', nl:'Sorry', pl:'Przepraszam', sv:'Förlåt', da:'Undskyld', no:'Beklager', fi:'Anteeksi', cs:'Promiňte', el:'Συγγνώμη', hu:'Sajnálom', ro:'Scuze', uk:'Вибачте', id:'Maaf', ms:'Maaf', th:'ขอโทษ', tr:'Özür dilerim', he:'סליחה', bn:'দুঃখিত', sw:'Pole' }},
      { key: 'tudo_bem', translations: { pt:'Tudo bem', en:'How are you?', es:'¿Cómo estás?', fr:'Comment allez-vous?', de:'Wie geht es?', it:'Come stai?', ja:'お元気ですか', ko:'어떻게 지내세요', zh:'你好吗', ar:'كيف حالك', ru:'Как дела?', hi:'कैसे हो?', nl:'Hoe gaat het?', pl:'Jak się masz?', sv:'Hur mår du?', da:'Hvordan har du det?', no:'Hvordan har du det?', fi:'Miten menee?', cs:'Jak se máte?', el:'Τι κάνετε;', hu:'Hogy vagy?', ro:'Ce mai faci?', uk:'Як справи?', id:'Apa kabar?', ms:'Apa khabar?', th:'สบายดีไหม', tr:'Nasılsınız?', he:'מה שלומך?', bn:'কেমন আছেন?', sw:'Habari yako' }},
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness',
    phrases: [
      { key: 'iniciar_treino', translations: { pt:'Iniciar treino', en:'Start workout', es:'Iniciar entrenamiento', fr:'Commencer l\'entraînement', de:'Training starten', it:'Inizia allenamento', ja:'トレーニング開始', ko:'운동 시작', zh:'开始训练', ar:'ابدأ التمرين', ru:'Начать тренировку', hi:'वर्कआउट शुरू करें', nl:'Workout starten', pl:'Rozpocznij trening', sv:'Starta träning', da:'Start træning', no:'Start trening', fi:'Aloita harjoitus', cs:'Začít trénink', el:'Ξεκινήστε προπόνηση', hu:'Edzés indítása', ro:'Începe antrenamentul', uk:'Почати тренування', id:'Mulai latihan', ms:'Mulakan latihan', th:'เริ่มออกกำลังกาย', tr:'Antrenmana başla', he:'התחל אימון', bn:'অনুশীলন শুরু করুন', sw:'Anza mazoezi' }},
      { key: 'parar_treino', translations: { pt:'Parar treino', en:'Stop workout', es:'Detener entrenamiento', fr:'Arrêter l\'entraînement', de:'Training stoppen', it:'Ferma allenamento', ja:'トレーニング停止', ko:'운동 중지', zh:'停止训练', ar:'إيقاف التمرين', ru:'Остановить тренировку', hi:'वर्कआउट बंद करें', nl:'Workout stoppen', pl:'Zatrzymaj trening', sv:'Stoppa träning', da:'Stop træning', no:'Stop trening', fi:'Pysäytä harjoitus', cs:'Zastavit trénink', el:'Σταματήστε προπόνηση', hu:'Edzés leállítása', ro:'Oprește antrenamentul', uk:'Зупинити тренування', id:'Hentikan latihan', ms:'Hentikan latihan', th:'หยุดออกกำลังกาย', tr:'Antrenmanı durdur', he:'עצור אימון', bn:'অনুশীলন বন্ধ করুন', sw:'Simamisha mazoezi' }},
      { key: 'proximo_exercicio', translations: { pt:'Próximo exercício', en:'Next exercise', es:'Siguiente ejercicio', fr:'Exercice suivant', de:'Nächste Übung', it:'Esercizio successivo', ja:'次のエクササイズ', ko:'다음 운동', zh:'下一个练习', ar:'التمرين التالي', ru:'Следующее упражнение', hi:'अगला व्यायाम', nl:'Volgende oefening', pl:'Następne ćwiczenie', sv:'Nästa övning', da:'Næste øvelse', no:'Neste øvelse', fi:'Seuraava harjoitus', cs:'Další cvik', el:'Επόμενη άσκηση', hu:'Következő gyakorlat', ro:'Următorul exercițiu', uk:'Наступна вправа', id:'Latihan berikutnya', ms:'Latihan seterusnya', th:'แบบฝึกหัดถัดไป', tr:'Sonraki egzersiz', he:'תרגיל הבא', bn:'পরবর্তী ব্যায়াম', sw:'Mazoezi yajayo' }},
      { key: 'excelente', translations: { pt:'Excelente!', en:'Excellent!', es:'¡Excelente!', fr:'Excellent !', de:'Ausgezeichnet!', it:'Eccellente!', ja:'素晴らしい！', ko:'훌륭해요!', zh:'太棒了！', ar:'رائع!', ru:'Отлично!', hi:'बहुत बढ़िया!', nl:'Uitstekend!', pl:'Świetnie!', sv:'Utmärkt!', da:'Fremragende!', no:'Fremragende!', fi:'Erinomainen!', cs:'Výborně!', el:'Εξαιρετικά!', hu:'Kiváló!', ro:'Excelent!', uk:'Відмінно!', id:'Luar biasa!', ms:'Hebat!', th:'ยอดเยี่ยม!', tr:'Mükemmel!', he:'מצוין!', bn:'চমৎকার!', sw:'Bora sana!' }},
      { key: 'ultimo_exercicio', translations: { pt:'Último exercício', en:'Last exercise', es:'Último ejercicio', fr:'Dernier exercice', de:'Letzte Übung', it:'Ultimo esercizio', ja:'最後のエクササイズ', ko:'마지막 운동', zh:'最后一个练习', ar:'التمرين الأخير', ru:'Последнее упражнение', hi:'अंतिम व्यायाम', nl:'Laatste oefening', pl:'Ostatnie ćwiczenie', sv:'Sista övningen', da:'Sidste øvelse', no:'Siste øvelse', fi:'Viimeinen harjoitus', cs:'Poslední cvik', el:'Τελευταία άσκηση', hu:'Utolsó gyakorlat', ro:'Ultimul exercițiu', uk:'Остання вправа', id:'Latihan terakhir', ms:'Latihan terakhir', th:'แบบฝึกหัดสุดท้าย', tr:'Son egzersiz', he:'תרגיל אחרון', bn:'শেষ ব্যায়াম', sw:'Mazoezi ya mwisho' }},
    ],
  },
  {
    id: 'travel',
    label: 'Viagem',
    phrases: [
      { key: 'onde_fica', translations: { pt:'Onde fica?', en:'Where is?', es:'¿Dónde está?', fr:'Où est?', de:'Wo ist?', it:'Dove si trova?', ja:'どこですか？', ko:'어디에 있나요?', zh:'在哪里？', ar:'أين؟', ru:'Где?', hi:'कहाँ है?', nl:'Waar is het?', pl:'Gdzie to jest?', sv:'Var ligger det?', da:'Hvor er det?', no:'Hvor er det?', fi:'Missä se on?', cs:'Kde je?', el:'Πού είναι;', hu:'Hol van?', ro:'Unde este?', uk:'Де це?', id:'Di mana?', ms:'Di mana?', th:'อยู่ที่ไหน?', tr:'Nerede?', he:'איפה?', bn:'কোথায়?', sw:'Iko wapi?' }},
      { key: 'quanto_custa', translations: { pt:'Quanto custa?', en:'How much does it cost?', es:'¿Cuánto cuesta?', fr:'Combien ça coûte?', de:'Wie viel kostet es?', it:'Quanto costa?', ja:'いくらですか？', ko:'얼마예요?', zh:'多少钱？', ar:'بكم؟', ru:'Сколько стоит?', hi:'कितना है?', nl:'Hoeveel kost het?', pl:'Ile to kosztuje?', sv:'Hur mycket kostar det?', da:'Hvor meget koster det?', no:'Hvor mye koster det?', fi:'Paljonko se maksaa?', cs:'Kolik to stojí?', el:'Πόσο κοστίζει;', hu:'Mennyibe kerül?', ro:'Cât costă?', uk:'Скільки це коштує?', id:'Berapa harganya?', ms:'Berapa harganya?', th:'ราคาเท่าไร?', tr:'Ne kadar?', he:'כמה זה עולה?', bn:'কত দাম?', sw:'Bei gani?' }},
      { key: 'pode_ajudar', translations: { pt:'Pode me ajudar?', en:'Can you help me?', es:'¿Puede ayudarme?', fr:'Pouvez-vous m\'aider?', de:'Können Sie mir helfen?', it:'Può aiutarmi?', ja:'助けてもらえますか？', ko:'도와주실 수 있나요?', zh:'能帮我吗？', ar:'هل يمكنك مساعدتي؟', ru:'Вы можете мне помочь?', hi:'क्या आप मेरी मदद कर सकते हैं?', nl:'Kunt u me helpen?', pl:'Czy możesz mi pomóc?', sv:'Kan du hjälpa mig?', da:'Kan du hjælpe mig?', no:'Kan du hjelpe meg?', fi:'Voitko auttaa minua?', cs:'Můžete mi pomoct?', el:'Μπορείτε να με βοηθήσετε;', hu:'Segíthet nekem?', ro:'Mă puteți ajuta?', uk:'Ви можете мені допомогти?', id:'Bisakah Anda membantu saya?', ms:'Bolehkah anda membantu saya?', th:'ช่วยได้ไหม?', tr:'Bana yardım eder misiniz?', he:'你能帮我吗？', bn:'আপনি কি আমাকে সাহায্য করতে পারেন?', sw:'Unaweza kunisaidia?' }},
      { key: 'obrigado_pela_ajuda', translations: { pt:'Obrigado pela ajuda', en:'Thanks for the help', es:'Gracias por la ayuda', fr:'Merci pour l\'aide', de:'Danke für die Hilfe', it:'Grazie per l\'aiuto', ja:'助けてくれてありがとう', ko:'도움 감사합니다', zh:'谢谢你的帮助', ar:'شكرا على المساعدة', ru:'Спасибо за помощь', hi:'मदद के लिए धन्यवाद', nl:'Bedankt voor de hulp', pl:'Dziękuję za pomoc', sv:'Tack för hjälpen', da:'Tak for hjælpen', no:'Takk for hjelpen', fi:'Kiitos avusta', cs:'Děkuji za pomoc', el:'Ευχαριστώ για τη βοήθεια', hu:'Köszönöm a segítséget', ro:'Mulțumesc pentru ajutor', uk:'Дякую за допомогу', id:'Terima kasih atas bantuannya', ms:'Terima kasih atas bantuannya', th:'ขอบคุณสำหรับความช่วยเหลือ', tr:'Yardımınız için teşekkürler', he:'תודה על העזרה', bn:'সাহায্যের জন্য ধন্যবাদ', sw:'Asante kwa msaada' }},
    ],
  },
];

/**
 * Busca frase no phrasebook.
 * @param key - chave da frase (ex: 'bom_dia')
 * @param target - idioma destino
 */
export function getPhrase(key: string, target: Language): string | null {
  for (const cat of PHRASEBOOK) {
    const phrase = cat.phrases.find(p => p.key === key);
    if (phrase) return phrase.translations[target] || null;
  }
  return null;
}

/**
 * Lista todas as frases de uma categoria.
 */
export function getPhrases(categoryId: string, target: Language): Array<{ key: string; text: string }> {
  const cat = PHRASEBOOK.find(c => c.id === categoryId);
  if (!cat) return [];
  return cat.phrases.map(p => ({ key: p.key, text: p.translations[target] || p.translations.pt }));
}

/**
 * Lista todas as categorias disponíveis.
 */
export function getCategories(): Array<{ id: string; label: string }> {
  return PHRASEBOOK.map(c => ({ id: c.id, label: c.label }));
}
