import React from 'react';
import { ChakraLogo } from './ChakraLogo';
import { SupportedLanguage } from '../types/chat';
import { LANGUAGES, PROMPT_SUGGESTIONS } from '../utils/languages';
import { Sparkles, Languages, Mic, Shield } from 'lucide-react';

interface WelcomeViewProps {
  language: SupportedLanguage;
  onSelectPrompt: (prompt: string) => void;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  language,
  onSelectPrompt,
  onSelectLanguage,
}) => {
  const langConfig = LANGUAGES[language];
  const suggestions = PROMPT_SUGGESTIONS[language] || PROMPT_SUGGESTIONS.en;
  const isUrdu = language === 'ur';

  return (
    <div
      className={`max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center ${
        isUrdu ? 'font-["Noto_Nastaliq_Urdu",system-ui]' : ''
      }`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Brand Emblem */}
      <div className="relative mb-5 group">
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-500/20 via-sky-500/20 to-emerald-500/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
        <ChakraLogo size={64} showRings={true} className="relative shadow-lg" />
      </div>

      {/* Main Title with Tricolour Accent */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">
        <span>Bharat</span>
        <span className="bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-600 bg-clip-text text-transparent">
          GPT
        </span>
      </h1>

      {/* Greeting in active language */}
      <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mb-6 leading-relaxed">
        {langConfig.greeting}
      </p>

      {/* Quick Language Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
          const item = LANGUAGES[code];
          const isSelected = code === language;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelectLanguage(code)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30'
                  : 'bg-white dark:bg-[#161d2b] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <span>{item.nativeName}</span>
              <span className="text-[11px] opacity-75 ml-1">({item.name})</span>
            </button>
          );
        })}
      </div>

      {/* Feature capabilities banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-8 text-left">
        <div className="p-3 rounded-xl bg-white dark:bg-[#141a26] border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
          <Languages className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              4 Languages
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Hindi, English, Urdu, Kannada
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-[#141a26] border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Gemini 3.8 Flash
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Fast, high reasoning
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-[#141a26] border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
          <Mic className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Voice Dictation
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Speak in native tongue
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-[#141a26] border border-neutral-200/80 dark:border-neutral-800/80 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Secure Storage
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Local chat history
            </div>
          </div>
        </div>
      </div>

      {/* Suggested prompts grid */}
      <div className="w-full">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 text-left">
          {language === 'hi'
            ? 'सुझाए गए विषय'
            : language === 'ur'
            ? 'تجویز کردہ موضوعات'
            : language === 'kn'
            ? 'ಸೂಚಿಸಲಾದ ವಿಷಯಗಳು'
            : 'Suggested Inquiries'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-3.5 rounded-xl bg-white dark:bg-[#141a26] border border-neutral-200/80 dark:border-neutral-800/80 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-sm text-left transition-all cursor-pointer"
            >
              <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mb-1">
                {item.category}
              </div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {item.prompt}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* About the Creator Section */}
      <div className="mt-8 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 w-full flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 p-[1px] shadow-xs">
          <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0f17] flex items-center justify-center text-[9px] font-bold text-amber-600 dark:text-amber-400">
            K
          </div>
        </div>
        <span>Founder &amp; Creator: <strong className="text-neutral-800 dark:text-neutral-200">Kaif</strong></span>
        <span className="text-neutral-300 dark:text-neutral-700">·</span>
        <span>Project: <strong className="text-amber-600 dark:text-amber-400">BharatGPT</strong></span>
      </div>
    </div>
  );
};
