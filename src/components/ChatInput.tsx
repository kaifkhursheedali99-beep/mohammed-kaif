import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Mic, MicOff, Globe } from 'lucide-react';
import { SupportedLanguage } from '../types/chat';
import { LANGUAGES, UI_STRINGS } from '../utils/languages';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onStopStreaming: () => void;
  isStreaming: boolean;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  language,
  onLanguageChange,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const langConfig = LANGUAGES[language];
  const ui = UI_STRINGS[language] || UI_STRINGS.en;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Web Speech Recognition setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge on desktop or Android.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = langConfig.speechCode || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition start failed', e);
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      <div className="relative rounded-2xl sm:rounded-3xl border border-neutral-300/80 dark:border-neutral-700/80 bg-white dark:bg-[#141923] shadow-md focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500 transition-all p-2 sm:p-2.5">
        {/* Tricolour hairline top accent inside input card */}
        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full overflow-hidden opacity-40 dark:opacity-60">
          <div className="w-full h-full bg-gradient-to-r from-[#FF9933] via-white dark:via-neutral-400 to-[#138808]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? ui.listening : langConfig.placeholder}
            rows={1}
            dir={langConfig.dir}
            className={`w-full resize-none border-0 bg-transparent px-2 sm:px-3 pt-2 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-0 max-h-[180px] overflow-y-auto leading-relaxed ${
              language === 'ur'
                ? 'font-["Noto_Nastaliq_Urdu",system-ui] text-right'
                : language === 'hi'
                ? 'font-["Noto_Sans_Devanagari",sans-serif]'
                : language === 'kn'
                ? 'font-["Noto_Sans_Kannada",sans-serif]'
                : ''
            }`}
          />

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 px-1">
            {/* Left: Language Indicator & Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Change Language"
              >
                <Globe size={13} className="text-amber-500" />
                <span className="font-semibold">{langConfig.nativeName}</span>
                <span className="text-[11px] text-neutral-400">({langConfig.name})</span>
              </button>

              {/* Language Dropdown popover */}
              {showLangMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangMenu(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-2 w-48 rounded-xl bg-white dark:bg-[#182030] shadow-xl border border-neutral-200 dark:border-neutral-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Select Language
                    </div>
                    {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
                      const item = LANGUAGES[code];
                      const isSelected = code === language;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            onLanguageChange(code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span>{item.nativeName}</span>
                          <span className="text-[11px] text-neutral-400">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right: Dictate & Send */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mic / Speech Input Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-full transition-colors ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                title={isListening ? 'Stop listening' : 'Speak message'}
                aria-label={isListening ? 'Stop listening' : 'Speak message'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Submit or Stop Button */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopStreaming}
                  className="p-2 sm:p-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
                  title={ui.stop}
                  aria-label={ui.stop}
                >
                  <Square size={16} className="fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-2 sm:p-2.5 rounded-full transition-all ${
                    input.trim()
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600 cursor-pointer'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                  }`}
                  title={ui.send}
                  aria-label={ui.send}
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Disclaimers & Model note */}
      <div className="mt-2 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
        BharatGPT may occasionally produce inaccurate information. Powered by Gemini 3.8 Flash.
      </div>
    </div>
  );
};
