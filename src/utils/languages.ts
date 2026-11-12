import { LanguageConfig, SupportedLanguage } from '../types/chat';

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    greeting: 'नमस्ते! मैं भारतGPT हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    placeholder: 'भारतGPT से कुछ भी पूछें... (जैसे विज्ञान, इतिहास, कोडिंग, शायरी)',
    dir: 'ltr',
    speechCode: 'hi-IN',
    voiceLang: 'hi-IN',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting: 'Namaste! I am BharatGPT. How can I assist you today?',
    placeholder: 'Ask BharatGPT anything... (e.g. culture, science, coding, analysis)',
    dir: 'ltr',
    speechCode: 'en-IN',
    voiceLang: 'en-IN',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    greeting: 'آداب! میں بھارت جی پی ٹی ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟',
    placeholder: 'بھارت جی پی ٹی سے کچھ بھی پوچھیں... (شاعری، تاریخ، سائنس، کوڈنگ)',
    dir: 'rtl',
    speechCode: 'ur-IN',
    voiceLang: 'ur-PK',
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ಭಾರತ್‌ಜಿಪಿಟಿ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
    placeholder: 'ಭಾರತ್‌ಜಿಪಿಟಿಯನ್ನು ಏನು ಬೇಕಾದರೂ ಕೇಳಿ... (ವಿಜ್ಞಾನ, ಸಾಹಿತ್ಯ, ತಂತ್ರಜ್ಞಾನ)',
    dir: 'ltr',
    speechCode: 'kn-IN',
    voiceLang: 'kn-IN',
  },
};

export interface PromptSuggestion {
  id: string;
  category: string;
  title: string;
  prompt: string;
}

export const PROMPT_SUGGESTIONS: Record<SupportedLanguage, PromptSuggestion[]> = {
  hi: [
    {
      id: 'hi-1',
      category: 'ज्ञान एवं संविधान',
      title: 'भारतीय संविधान की प्रस्तावना',
      prompt: 'भारतीय संविधान की प्रस्तावना के मुख्य सिद्धांतों और इसके ऐतिहासिक महत्व को विस्तार से समझाइए।',
    },
    {
      id: 'hi-2',
      category: 'तकनीक एवं विज्ञान',
      title: 'भारत में UPI क्रांति',
      prompt: 'यूनिफाइड पेमेंट्स इंटरफेस (UPI) ने भारत के डिजिटल पब्लिक इंफ्रास्ट्रक्चर को कैसे बदल दिया? इसके मुख्य तकनीकी घटक क्या हैं?',
    },
    {
      id: 'hi-3',
      category: 'साहित्य व संस्कृति',
      title: 'तुलसीदास जी के दोहे',
      prompt: 'गोस्वामी तुलसीदास जी के तीन प्रसिद्ध नीतिपरक दोहे उनके सरल हिंदी अर्थ और जीवन में प्रासंगिकता सहित प्रस्तुत करें।',
    },
    {
      id: 'hi-4',
      category: 'स्वास्थ्य व आयुर्वेद',
      title: 'दैनिक दिनचर्या और आयुर्वेद',
      prompt: 'आयुर्वेद के अनुसार दिनचर्या (दैनिक जीवनशैली) के बुनियादी नियम क्या हैं जो आधुनिक जीवन में ऊर्जा बनाए रखने में मदद करते हैं?',
    },
  ],
  en: [
    {
      id: 'en-1',
      category: 'Technology & DPI',
      title: "India's Digital Revolution",
      prompt: "Explain how India's Digital Public Infrastructure (Aadhaar, UPI, DigiLocker, ONDC) became a global benchmark for public tech rails.",
    },
    {
      id: 'en-2',
      category: 'Space Exploration',
      title: "ISRO's Chandrayaan & Gaganyaan",
      prompt: "Provide an insightful overview of ISRO's frugal engineering achievements with Chandrayaan-3 and the roadmap for Gaganyaan.",
    },
    {
      id: 'en-3',
      category: 'Full-Stack Code',
      title: 'React Concurrent & Server Components',
      prompt: 'Write a modern React 19 component illustrating optimistic state updates with useOptimistic and clean TypeScript typing.',
    },
    {
      id: 'en-4',
      category: 'History & Arts',
      title: 'Classical Music Traditions',
      prompt: 'Compare and contrast Carnatic and Hindustani classical music traditions, highlighting their origins, raga systems, and key instruments.',
    },
  ],
  ur: [
    {
      id: 'ur-1',
      category: 'ادب و شاعری',
      title: 'مرزا غالب کی شاعری کا تجزیہ',
      prompt: 'مرزا غالب کے فلسفۂ زندگی اور ان کی شاعری کی انفرادی خصوصیات کا باوقار انداز میں تجزیہ فرمائیں۔',
    },
    {
      id: 'ur-2',
      category: 'تاریخ و تہذیب',
      title: 'دہلی اور لکھنؤ کے ادبی دبستان',
      prompt: 'دبستانِ دہلی اور دبستانِ لکھنؤ کے طرزِ تحریر، زبان اور موضوعات کے مابین بنیادی فرق واضح کریں۔',
    },
    {
      id: 'ur-3',
      category: 'سائنس و ٹیکنالوجی',
      title: 'مصنوعی ذہانت کے اثرات',
      prompt: 'جدید معاشرے اور روزمرہ زندگی پر مصنوعی ذہانت (AI) کے مثبت اور منفی اثرات پر مفصل روشنی ڈالیں۔',
    },
    {
      id: 'ur-4',
      category: 'حکمت و صحت',
      title: 'طب یونانی اور صحت مند طرزِ زندگی',
      prompt: 'طب یونانی کے مطابق روزمرہ صحت کو برقرار رکھنے کے بنیادی اصول کیا ہیں؟',
    },
  ],
  kn: [
    {
      id: 'kn-1',
      category: 'ಸಾಹಿತ್ಯ',
      title: 'ವಚನ ಸಾಹಿತ್ಯ ಮತ್ತು ಬಸವಣ್ಣ',
      prompt: 'ಬಸವಣ್ಣನವರ ಕಾಯಕ ಮತ್ತು ದಾಸೋಹ ತತ್ವಗಳನ್ನು ವಿವರಿಸುವ ಪ್ರಮುಖ ವಚನಗಳನ್ನು ಅವುಗಳ ಭಾವಾರ್ಥದೊಂದಿಗೆ ವಿವರಿಸಿ.',
    },
    {
      id: 'kn-2',
      category: 'ಇತಿಹಾಸ',
      title: 'ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ವೈಭವ',
      prompt: 'ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಕಲೆ, ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ಹಂಪಿಯ ಸ್ಮಾರಕಗಳ ಐತಿಹಾಸಿಕ ಮಹತ್ವವನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ತಿಳಿಸಿ.',
    },
    {
      id: 'kn-3',
      category: 'ತಂತ್ರಜ್ಞಾನ',
      title: 'ಕೃಷಿಯಲ್ಲಿ ನವೀನ ತಂತ್ರಜ್ಞಾನ',
      prompt: 'ಕರ್ನಾಟಕದ ರೈತರಿಗೆ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ, ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ತಂತ್ರಜ್ಞಾನಗಳು ಹೇಗೆ ನೆರವಾಗಬಹುದು?',
    },
    {
      id: 'kn-4',
      category: 'ಕಾವ್ಯ',
      title: 'ಕುವೆಂಪು ಅವರ ಮಂಕುತಿಮ್ಮನ ಕಗ್ಗ ಮತ್ತು ಅನಿಕೇತನ',
      prompt: 'ಕುವೆಂಪು ಅವರ "ವಿಶ್ವಮಾನವ ಸಂದೇಶ" ಮತ್ತು ಅನಿಕೇತನ ಕಲ್ಪನೆಯನ್ನು ಇಂದಿನ ಯುವ ಪೀಳಿಗೆಗೆ ಹೇಗೆ ಅನ್ವಯಿಸಬಹುದು?',
    },
  ],
};

export const UI_STRINGS: Record<SupportedLanguage, Record<string, string>> = {
  hi: {
    newChat: 'नया चैट',
    chatHistory: 'चैट इतिहास',
    searchChats: 'चैट खोजें...',
    today: 'आज',
    yesterday: 'कल',
    last7Days: 'पिछले 7 दिन',
    older: 'पुराने',
    pin: 'पिन करें',
    unpin: 'अनपिन करें',
    rename: 'नाम बदलें',
    delete: 'हटाएं',
    confirmDelete: 'क्या आप इस चैट को हटाना चाहते हैं?',
    clearAll: 'सभी चैट हटाएं',
    noChats: 'अभी तक कोई चैट नहीं है',
    settings: 'सेटिंग्स',
    theme: 'थीम',
    light: 'लाइट',
    dark: 'डार्क',
    system: 'सिस्टम',
    language: 'भाषा',
    copied: 'कॉपी हो गया!',
    copy: 'कॉपी करें',
    listening: 'सुन रहा हूँ...',
    speak: 'बोलकर सुनें',
    stop: 'रोकें',
    regenerate: 'फिर से लिखें',
    send: 'भेजें',
    poweredBy: 'पावर्ड बाय जेमिनी 3.8 फ्लैश',
    clearAllConfirm: 'क्या आप सुनिश्चित हैं कि आप संपूर्ण चैट इतिहास हटाना चाहते हैं?',
    exportChat: 'चैट एक्सपोर्ट करें',
    tabChat: 'AI चैट',
    tabImage: 'AI इमेज',
    tabVideo: 'AI वीडियो',
    generateImage: 'इमेज बनाएं',
    generateVideo: 'वीडियो बनाएं',
    imagePromptPlaceholder: 'इमेज का सजीव विवरण लिखें... (उदा. वाराणसी के घाटों पर दीपदान, साइबरपंक मुंबई)',
    videoPromptPlaceholder: 'वीडियो का दृश्य व गतिशीलता लिखें... (उदा. हिमालय के ऊपर उड़ता ड्रोन, बादलों की गति)',
    download: 'डाउनलोड',
    downloadImage: 'इमेज डाउनलोड करें',
    downloadVideo: 'वीडियो डाउनलोड करें',
    aspectRatio: 'पहलू अनुपात',
    duration: 'अवधि',
    recentCreations: 'हाल ही में बनाए गए',
    generatingImage: 'AI इमेज तैयार हो रही है...',
    generatingVideo: 'AI वीडियो तैयार हो रहा है... (20-40 सेकंड लग सकते हैं)',
    noCreationsYet: 'अभी तक कोई मीडिया नहीं बनाया गया। ऊपर प्रॉम्प्ट लिखकर शुरुआत करें!',
    imageNotice: 'पावर्ड बाय जेमिनी 3.1 फ्लैश-लाइट इमेज',
    videoNotice: 'पावर्ड बाय जेमिनी ऑम्नी 1.1 फ्लैश',
    tabCompare: 'AI तुलना',
    compareTitle: 'AI मॉडल तुलना',
    compareSubtitle: 'एक ही प्रश्न विभिन्न मॉडलों से पूछें और उत्तरों की गति व गुणवत्ता की तुलना करें',
    selectModelsNotice: 'तुलना के लिए कम से कम 2 मॉडल चुनें',
    compareButton: 'मॉडल तुलना करें',
    comparingModels: 'मॉडल तुलना जारी है...',
    responseTime: 'प्रतिक्रिया समय',
  },
  en: {
    newChat: 'New chat',
    chatHistory: 'Chat History',
    searchChats: 'Search chats...',
    today: 'Today',
    yesterday: 'Yesterday',
    last7Days: 'Previous 7 Days',
    older: 'Older',
    pin: 'Pin chat',
    unpin: 'Unpin chat',
    rename: 'Rename',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this chat?',
    clearAll: 'Clear all chats',
    noChats: 'No chat history yet',
    settings: 'Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    copied: 'Copied!',
    copy: 'Copy',
    listening: 'Listening...',
    speak: 'Read aloud',
    stop: 'Stop generating',
    regenerate: 'Regenerate response',
    send: 'Send message',
    poweredBy: 'Powered by Gemini 3.8 Flash',
    clearAllConfirm: 'Are you sure you want to delete all conversation history?',
    exportChat: 'Export chat',
    tabChat: 'AI Chat',
    tabImage: 'AI Image',
    tabVideo: 'AI Video',
    tabCompare: 'AI Compare',
    compareTitle: 'AI Model Compare',
    compareSubtitle: 'Ask one question across multiple AI models side by side and compare response times and quality',
    selectModelsNotice: 'Select at least 2 models to compare',
    compareButton: 'Compare Models',
    comparingModels: 'Comparing Models...',
    responseTime: 'Response Time',
    generateImage: 'Generate Image',
    generateVideo: 'Generate Video',
    imagePromptPlaceholder: 'Describe the image in detail... (e.g. Golden hour over Varanasi ghats, futuristic ISRO base)',
    videoPromptPlaceholder: 'Describe the scene and motion... (e.g. Dramatic waves crashing at Gateway of India sunset)',
    download: 'Download',
    downloadImage: 'Download Image',
    downloadVideo: 'Download Video',
    aspectRatio: 'Aspect Ratio',
    duration: 'Duration',
    recentCreations: 'Recent Creations',
    generatingImage: 'Crafting AI Image...',
    generatingVideo: 'Rendering AI Video... (takes 20-45 seconds)',
    noCreationsYet: 'No creations yet. Enter a prompt above to generate!',
    imageNotice: 'Powered by Gemini 3.1 Flash Lite Image',
    videoNotice: 'Powered by Gemini Omni 1.1 Flash',
  },
  ur: {
    newChat: 'نئی بات چیت',
    chatHistory: 'تاریخچہ گفتگو',
    searchChats: 'گفتگو تلاش کریں...',
    today: 'آج',
    yesterday: 'کل',
    last7Days: 'پچھلے 7 دن',
    older: 'پرانے',
    pin: 'پن کریں',
    unpin: 'ان پن کریں',
    rename: 'نام بدلیں',
    delete: 'حذف کریں',
    confirmDelete: 'کیا آپ واقعی اس گفتگو کو حذف کرنا چاہتے ہیں؟',
    clearAll: 'تمام گفتگو مٹائیں',
    noChats: 'ابھی تک کوئی گفتگو موجود نہیں',
    settings: 'ترتیبات',
    theme: 'تھیم',
    light: 'روشن',
    dark: 'تاریک',
    system: 'سسٹم',
    language: 'زبان',
    copied: 'کاپی ہو گیا!',
    copy: 'کاپی کریں',
    listening: 'سن رہا ہوں...',
    speak: 'آواز میں سنیں',
    stop: 'روک دیں',
    regenerate: 'دوبارہ تیار کریں',
    send: 'پیغام بھیجیں',
    poweredBy: 'جیمنائی 3.8 فلیش کی معاونت کے ساتھ',
    clearAllConfirm: 'کیا آپ واقعی تمام گفتگو کا ریکارڈ ختم کرنا چاہتے ہیں؟',
    exportChat: 'گفتگو محفوظ کریں',
    tabChat: 'AI چیٹ',
    tabImage: 'AI تصویر',
    tabVideo: 'AI ویڈیو',
    generateImage: 'تصویر بنائیں',
    generateVideo: 'ویڈیو بنائیں',
    imagePromptPlaceholder: 'تصویر کی تفصیلی وضاحت تحریر کریں... (مثلاً تاج محل صبح کی دھند میں)',
    videoPromptPlaceholder: 'ویڈیو کے مناظر اور حرکات بیان کریں... (مثلاً وادی کشمیر میں بہتی آبشار)',
    download: 'ڈاؤن لوڈ',
    downloadImage: 'تصویر ڈاؤن لوڈ کریں',
    downloadVideo: 'ویڈیو ڈاؤن لوڈ کریں',
    aspectRatio: 'تناسب (Aspect Ratio)',
    duration: 'مدت',
    recentCreations: 'حالیہ تخلیقات',
    generatingImage: 'AI تصویر تیار ہو رہی ہے...',
    generatingVideo: 'AI ویڈیو رینڈر ہو رہی ہے... (کچھ لمحات درکار ہیں)',
    noCreationsYet: 'ابھی تک کوئی میڈیا تیار نہیں ہوا۔ شروع کرنے کے لیے اوپر پرامپٹ لکھیں!',
    imageNotice: 'جیمنائی 3.1 فلیش لائٹ امیج کی معاونت',
    videoNotice: 'جیمنائی اومنی 1.1 فلیش کی معاونت',
    tabCompare: 'AI موازنہ',
    compareTitle: 'AI ماڈلز کا موازنہ',
    compareSubtitle: 'ایک ہی سوال بیک وقت متعدد AI ماڈلز سے پوچھیں اور ان کی کارکردگی کا موازنہ کریں',
    selectModelsNotice: 'موازنہ کے لیے کم از کم 2 ماڈلز کا انتخاب کریں',
    compareButton: 'ماڈلز کا موازنہ کریں',
    comparingModels: 'ماڈلز کا موازنہ جاری ہے...',
    responseTime: 'ردعمل کا وقت',
  },
  kn: {
    newChat: 'ಹೊಸ ಸಂಭಾಷಣೆ',
    chatHistory: 'ಸಂಭಾಷಣೆಯ ಇತಿಹಾಸ',
    searchChats: 'ಸಂಭಾಷಣೆಗಳನ್ನು ಹುಡುಕಿ...',
    today: 'ಇಂದು',
    yesterday: 'ನಿನ್ನೆ',
    last7Days: 'ಹಿಂದಿನ 7 ದಿನಗಳು',
    older: 'ಹಳೆಯವು',
    pin: 'ಪಿನ್ ಮಾಡಿ',
    unpin: 'ಅನ್‌ಪಿನ್ ಮಾಡಿ',
    rename: 'ಮರುಹೆಸರಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    confirmDelete: 'ನೀವು ಖಂಡಿತವಾಗಿಯೂ ಈ ಸಂಭಾಷಣೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?',
    clearAll: 'ಎಲ್ಲ ಸಂಭಾಷಣೆಗಳನ್ನು ಅಳಿಸಿ',
    noChats: 'ಇನ್ನೂ ಯಾವುದೇ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    theme: 'ಥೀಮ್',
    light: 'ಬೆಳಕು (Light)',
    dark: 'ಕತ್ತಲೆ (Dark)',
    system: 'ಸಿಸ್ಟಮ್',
    language: 'ಭಾಷೆ',
    copied: 'ನಕಲಿಸಲಾಗಿದೆ!',
    copy: 'ನಕಲಿಸಿ',
    listening: 'ಆಲಿಸುತ್ತಿದೆ...',
    speak: 'ಧ್ವನಿ ಪಠಣ',
    stop: 'ನಿಲ್ಲಿಸಿ',
    regenerate: 'ಮತ್ತೆ ರಚಿಸಿ',
    send: 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
    poweredBy: 'ಜೆಮಿನಿ 3.8 ಫ್ಲ್ಯಾಶ್ ಚಾಲಿತ',
    clearAllConfirm: 'ಎಲ್ಲಾ ಹಳೆಯ ಸಂಭಾಷಣೆಗಳನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ?',
    exportChat: 'ಸಂಭಾಷಣೆ ರಫ್ತು ಮಾಡಿ',
    tabChat: 'AI ಚಾಟ್',
    tabImage: 'AI ಚಿತ್ರ',
    tabVideo: 'AI ವೀಡಿಯೊ',
    tabCompare: 'AI ಹೋಲಿಕೆ',
    compareTitle: 'AI ಮಾದರಿಗಳ ಹೋಲಿಕೆ',
    compareSubtitle: 'ಒಂದೇ ಪ್ರಶ್ನೆಯನ್ನು ಅನೇಕ AI ಮಾದರಿಗಳಲ್ಲಿ ಒಂದೇ ಬಾರಿಗೆ ಹೋಲಿಕೆ ಮಾಡಿ',
    selectModelsNotice: 'ಹೋಲಿಕೆ ಮಾಡಲು ಕನಿಷ್ಠ 2 ಮಾದರಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    compareButton: 'ಮಾದರಿಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ',
    comparingModels: 'ಹೋಲಿಕೆ ನಡೆಯುತ್ತಿದೆ...',
    responseTime: 'ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ',
    generateImage: 'ಚಿತ್ರ ರಚಿಸಿ',
    generateVideo: 'ವೀಡಿಯೊ ರಚಿಸಿ',
    imagePromptPlaceholder: 'ಚಿತ್ರದ ವಿವರಣೆಯನ್ನು ಬರೆಯಿರಿ... (ಉದಾ: ಮೈಸೂರು ಅರಮನೆಯ ದೀಪಾಲಂಕಾರ, ಹಂಪಿಯ ಕಲ್ಲಿನ ರಥ)',
    videoPromptPlaceholder: 'ವೀಡಿಯೊ ದೃಶ್ಯ ಮತ್ತು ಚಲನೆಯನ್ನು ಬರೆಯಿರಿ... (ಉದಾ: ಪಶ್ಚಿಮ ಘಟ್ಟಗಳಲ್ಲಿ ಸಾಗುವ ರೈಲು)',
    download: 'ಡೌನ್‌ಲೋಡ್',
    downloadImage: 'ಚಿತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    downloadVideo: 'ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    aspectRatio: 'ಅನುಪಾತ',
    duration: 'ಅವಧಿ',
    recentCreations: 'ಇತ್ತೀಚಿನ ಸೃಷ್ಟಿಗಳು',
    generatingImage: 'AI ಚಿತ್ರ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    generatingVideo: 'AI ವೀಡಿಯೊ ತಯಾರಾಗುತ್ತಿದೆ... (20-40 ಸೆಕೆಂಡುಗಳು ಬೇಕಾಗಬಹುದು)',
    noCreationsYet: 'ಇನ್ನೂ ಯಾವುದೇ ಸೃಷ್ಟಿಗಳಿಲ್ಲ. ಪ್ರಾರಂಭಿಸಲು ಮೇಲೆ ವಿವರಣೆ ನೀಡಿ!',
    imageNotice: 'ಜೆಮಿನಿ 3.1 ಫ್ಲ್ಯಾಶ್ ಲೈಟ್ ಚಿತ್ರ ಚಾಲಿತ',
    videoNotice: 'ಜೆಮಿನಿ ಓಮ್ನಿ 1.1 ಫ್ಲ್ಯಾಶ್ ಚಾಲಿತ',
  },
};

export interface DetectedLanguageInfo {
  code: 'en' | 'hi' | 'kn' | 'ur' | 'hinglish';
  effectiveCode: 'en' | 'hi' | 'kn' | 'ur';
  name: string;
  script: string;
  instruction: string;
}

export function detectInputLanguage(text: string): DetectedLanguageInfo {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      code: 'en',
      effectiveCode: 'en',
      name: 'English',
      script: 'Latin script',
      instruction: 'The user wrote in English. Respond fluently and directly in clear English in Latin script.',
    };
  }

  // 1. Kannada script detection (\u0C80-\u0CFF)
  if (/[\u0C80-\u0CFF]/.test(trimmed)) {
    return {
      code: 'kn',
      effectiveCode: 'kn',
      name: 'Kannada (ಕನ್ನಡ)',
      script: 'Kannada script (ಕನ್ನಡ ಲಿಪಿ)',
      instruction:
        'The user wrote in Kannada script. Respond strictly in fluent and natural Kannada using Kannada script (ಕನ್ನಡ ಲಿಪಿ). Use polite, respectful address (ನೀವು, ನಮಸ್ಕಾರ).',
    };
  }

  // 2. Hindi / Devanagari script detection (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return {
      code: 'hi',
      effectiveCode: 'hi',
      name: 'Hindi (हिंदी)',
      script: 'Devanagari script (देवनागरी लिपि)',
      instruction:
        'The user wrote in Hindi in Devanagari script. Respond strictly in fluent standard Hindi using Devanagari script (देवनागरी लिपि). Use respectful address (आप, जी).',
    };
  }

  // 3. Urdu / Perso-Arabic script detection (\u0600-\u06FF)
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return {
      code: 'ur',
      effectiveCode: 'ur',
      name: 'Urdu (اردو)',
      script: 'Urdu Nastaliq script (نستعلیق)',
      instruction:
        'The user wrote in Urdu script. Respond strictly in fluent and graceful Urdu using Urdu script (نستعلیق / عربی رسم الخط).',
    };
  }

  // 4. Hinglish detection (Latin characters with Romanized Hindi/Urdu vocabulary)
  const lower = trimmed.toLowerCase();
  const strongHinglishMarkers = new Set([
    'kya', 'kyu', 'kyun', 'kaise', 'kese', 'kaun', 'kon', 'kahan', 'kaha', 'kidhar', 'kab', 'kitna', 'kitne', 'kitni',
    'batao', 'bataiye', 'bataye', 'batado', 'bata', 'bataana', 'samjhao', 'karein',
    'chahiye', 'hain', 'hoon', 'nhi', 'accha', 'achha', 'theek', 'thik',
    'bhai', 'yaar', 'aapka', 'aapki', 'aapko', 'tumhara', 'humara', 'hamara',
    'bohot', 'bahut', 'banaya', 'kisne', 'kiska', 'badhiya', 'suno', 'shukriya',
    'dhanyawad', 'namaste', 'kaif'
  ]);

  const contextualHinglishMarkers = new Set([
    'hai', 'ho', 'tha', 'thi', 'the', 'nahi', 'mat', 'sahi', 'dost',
    'mujhe', 'mera', 'meri', 'mere', 'tum', 'tumhe', 'aap', 'yeh', 'ye', 'woh', 'wo',
    'hum', 'kuch', 'thoda', 'zyada', 'jyada', 'karo', 'kare', 'karna', 'chalo', 'bolo', 'sun',
    'ki', 'ke', 'ko', 'se', 'mein', 'pe', 'par'
  ]);

  const words = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
  let strongCount = 0;
  let contextualCount = 0;

  for (const w of words) {
    if (strongHinglishMarkers.has(w)) {
      strongCount++;
    } else if (contextualHinglishMarkers.has(w)) {
      contextualCount++;
    }
  }

  if (strongCount >= 1 || contextualCount >= 2) {
    return {
      code: 'hinglish',
      effectiveCode: 'en',
      name: 'Hinglish (Hindi in Latin/Roman script)',
      script: 'Latin/Roman script (English alphabet)',
      instruction:
        'The user wrote in Hinglish (Hindi written in Latin/Roman script). Respond fluently and naturally in Hinglish using the exact same Latin/Roman script. Do NOT reply in Devanagari script. Keep it conversational, direct, and natural.',
    };
  }

  return {
    code: 'en',
    effectiveCode: 'en',
    name: 'English',
    script: 'Latin script',
    instruction:
      'The user wrote in English. Respond fluently, directly, and articulately in English in Latin script.',
  };
}
