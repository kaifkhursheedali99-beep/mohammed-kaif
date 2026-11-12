import { SupportedLanguage } from '../types/chat';

/**
 * Clean markdown and syntax tokens into natural, fluid spoken text
 */
export function cleanMarkdownForSpeech(markdown: string): string {
  if (!markdown) return '';

  return (
    markdown
      // Remove code blocks entirely or replace with polite indication
      .replace(/```[\s\S]*?```/g, ' [Code snippet omitted] ')
      // Remove inline code backticks
      .replace(/`([^`]+)`/g, '$1')
      // Remove images ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      // Replace links [text](url) with just text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove Markdown headers (#, ##, etc.)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove horizontal rules
      .replace(/^(?:---|\*\*\*|___)\s*$/gm, '')
      // Remove blockquotes (>)
      .replace(/^\s*>\s*/gm, '')
      // Remove list markers (-, *, +, 1., 2.)
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove bold and italics (**, *, __, _)
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove strikethrough (~~)
      .replace(/~~([^~]+)~~/g, '$1')
      // Remove markdown tables (| col | col |)
      .replace(/\|[^\n]+\|/g, ' ')
      .replace(/[-:|]{3,}/g, ' ')
      // Clean up multiple whitespace and newlines into natural pauses
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Global reference for active speech queue and keepalive timer
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: any = null;

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Get the best matching voice for a given language code
 */
export function getBestVoice(voices: SpeechSynthesisVoice[], language: SupportedLanguage): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLangMap: Record<SupportedLanguage, string[]> = {
    hi: ['hi-IN', 'hi_IN', 'hi'],
    ur: ['ur-IN', 'ur-PK', 'ur_PK', 'ur_IN', 'ur', 'ar'],
    kn: ['kn-IN', 'kn_IN', 'kn'],
    en: ['en-IN', 'en_IN', 'en-GB', 'en-US', 'en'],
  };

  const candidateLocales = targetLangMap[language] || ['en-IN', 'en'];

  // 1. Try exact or prefix locale match
  for (const locale of candidateLocales) {
    const directMatch = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
    if (directMatch) return directMatch;
  }

  // 2. Try match by starting code (e.g. "hi-")
  for (const locale of candidateLocales) {
    const langPrefix = locale.split(/[-_]/)[0].toLowerCase();
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;
  }

  // 3. Try match by voice name (e.g. "Hindi", "Urdu", "Kannada")
  const nameKeywordMap: Record<SupportedLanguage, string[]> = {
    hi: ['hindi', 'हिन्दी', 'devanagari'],
    ur: ['urdu', 'اردو'],
    kn: ['kannada', 'ಕನ್ನಡ'],
    en: ['india', 'indian', 'english'],
  };

  const keywords = nameKeywordMap[language] || [];
  for (const kw of keywords) {
    const nameMatch = voices.find((v) => v.name.toLowerCase().includes(kw));
    if (nameMatch) return nameMatch;
  }

  // Fallback to default voice or first available
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Stop any ongoing speech synthesis immediately
 */
export function stopSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  window.speechSynthesis.cancel();
  activeUtterance = null;
}

/**
 * Speak text in the specified language with chunking and Chrome keepalive
 */
export function speakText(
  text: string,
  language: SupportedLanguage,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis is not supported on this browser.');
    return false;
  }

  stopSpeech();

  const cleanedText = cleanMarkdownForSpeech(text);
  if (!cleanedText) {
    onEnd?.();
    return false;
  }

  const langLocaleMap: Record<SupportedLanguage, string> = {
    hi: 'hi-IN',
    ur: 'ur-PK',
    kn: 'kn-IN',
    en: 'en-IN',
  };

  const targetLang = langLocaleMap[language] || 'en-IN';
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = getBestVoice(voices, language);

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = selectedVoice ? selectedVoice.lang : targetLang;
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Optimize speed and pitch for natural Indic & English listening
  utterance.rate = language === 'ur' || language === 'kn' ? 0.95 : 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    activeUtterance = utterance;
    onStart?.();

    // Chrome bug workaround: speech synthesis can freeze after ~15s; keepalive prevents premature cut-off
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  };

  utterance.onend = () => {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    activeUtterance = null;
    // Don't treat manual cancellation as an error
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('SpeechSynthesis error:', e.error);
      onError?.(e);
    }
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}
