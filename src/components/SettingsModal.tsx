import React from 'react';
import { X, Trash2, Globe, Moon, Sun, Monitor, Cpu, Sparkles } from 'lucide-react';
import { SupportedLanguage, ThemeMode } from '../types/chat';
import { LANGUAGES, UI_STRINGS } from '../utils/languages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onClearAllChats: () => void;
  totalChats: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onClearAllChats,
  totalChats,
}) => {
  if (!isOpen) return null;

  const ui = UI_STRINGS[language] || UI_STRINGS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141923] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {ui.settings}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-sm">
          {/* Language Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              <Globe size={14} className="text-amber-500" />
              <span>{ui.language}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
                const item = LANGUAGES[code];
                const isSelected = code === language;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onLanguageChange(code)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <span>{item.nativeName}</span>
                    <span className="text-[11px] text-neutral-400">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              <Sun size={14} className="text-amber-500" />
              <span>{ui.theme}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <Sun size={14} className="text-amber-500" />
                <span>{ui.light}</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <Moon size={14} className="text-sky-400" />
                <span>{ui.dark}</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('system')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  theme === 'system'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <Monitor size={14} />
                <span>{ui.system}</span>
              </button>
            </div>
          </div>

          {/* Model & Architecture Info */}
          <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
              <Cpu size={14} className="text-amber-500" />
              <span>AI Engine: Gemini 3.8 Flash</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
              Server-side real-time streaming, high Indic multilingual proficiency, with support for Devanagari, Kannada, and Nastaliq scripts.
            </p>
          </div>

          {/* About the Creator Section */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-100/50 dark:via-neutral-800/40 to-emerald-500/10 border border-amber-500/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Founder &amp; Creator
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                Project: BharatGPT
              </span>
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 p-[1px] shadow-xs">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0f17] flex items-center justify-center text-[10px] font-bold text-amber-600">
                  K
                </div>
              </div>
              <span>Kaif</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
              Designed and developed by Kaif to deliver sovereign, multilingual AI conversations across India.
            </p>
          </div>

          {/* Data Management: Clear All */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Data Management
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  {ui.chatHistory}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {totalChats} saved {totalChats === 1 ? 'chat' : 'chats'} in local storage
                </div>
              </div>
              <button
                type="button"
                disabled={totalChats === 0}
                onClick={() => {
                  if (window.confirm(ui.clearAllConfirm)) {
                    onClearAllChats();
                    onClose();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  totalChats > 0
                    ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                    : 'text-neutral-400 cursor-not-allowed opacity-50'
                }`}
              >
                <Trash2 size={13} />
                <span>{ui.clearAll}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-50 dark:bg-[#11151e] border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
