import React from 'react';
import {
  Menu,
  Plus,
  Download,
  Sun,
  Moon,
  Globe,
  MessageSquare,
  Sparkles,
  Film,
  GitCompare,
} from 'lucide-react';
import { ChakraLogo } from './ChakraLogo';
import { SupportedLanguage, ThemeMode, ActiveTab } from '../types/chat';
import { LANGUAGES, UI_STRINGS } from '../utils/languages';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onExportChat?: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  hasActiveMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onToggleSidebar,
  onNewChat,
  onExportChat,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  hasActiveMessages,
}) => {
  const ui = UI_STRINGS[language] || UI_STRINGS.en;

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'chat',
      label: ui.tabChat || 'AI Chat',
      icon: <MessageSquare size={14} className={activeTab === 'chat' ? 'text-amber-500' : ''} />,
    },
    {
      id: 'image',
      label: ui.tabImage || 'AI Image',
      icon: <Sparkles size={14} className={activeTab === 'image' ? 'text-orange-500' : ''} />,
    },
    {
      id: 'video',
      label: ui.tabVideo || 'AI Video',
      icon: <Film size={14} className={activeTab === 'video' ? 'text-emerald-500' : ''} />,
    },
    {
      id: 'compare',
      label: ui.tabCompare || 'AI Compare',
      icon: <GitCompare size={14} className={activeTab === 'compare' ? 'text-sky-500' : ''} />,
    },
  ];

  return (
    <header className="relative z-30 shrink-0 bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      {/* Tricolour National Ribbon on top edge */}
      <div className="w-full h-[3px] bg-gradient-to-r from-[#FF9933] via-white dark:via-neutral-400 to-[#138808]" />

      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Zone: Sidebar Toggle + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Toggle sidebar"
            aria-label="Toggle navigation sidebar"
          >
            <Menu size={20} />
          </button>

          <div
            className="flex items-center gap-2 select-none cursor-pointer"
            onClick={() => onTabChange('chat')}
            title="BharatGPT AI Platform"
          >
            <ChakraLogo size={26} showRings={true} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-neutral-900 dark:text-neutral-100">
                Bharat<span className="text-amber-500">GPT</span>
              </span>
              <span className="hidden lg:inline-block text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 px-1.5 py-0.5 rounded uppercase">
                Multi-AI
              </span>
            </div>
          </div>
        </div>

        {/* Center Zone: Desktop Platform Tabs */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-neutral-100 dark:bg-[#141824] border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#1e2436] text-neutral-900 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Zone: Actions & Language */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Switcher Dropdown / Pills on desktop */}
          <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60">
            {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
              const item = LANGUAGES[code];
              const isSelected = code === language;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLanguageChange(code)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <span>{item.nativeName}</span>
                </button>
              );
            })}
          </div>

          {/* Compact language button on smaller screens */}
          <div className="lg:hidden relative">
            <button
              type="button"
              onClick={() => {
                const codes: SupportedLanguage[] = ['en', 'hi', 'ur', 'kn'];
                const nextIndex = (codes.indexOf(language) + 1) % codes.length;
                onLanguageChange(codes[nextIndex]);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 min-h-[38px]"
              title="Switch language"
            >
              <Globe size={13} className="text-amber-500" />
              <span>{LANGUAGES[language]?.nativeName}</span>
            </button>
          </div>

          {/* Export Chat (only visible in chat mode with messages) */}
          {activeTab === 'chat' && hasActiveMessages && onExportChat && (
            <button
              type="button"
              onClick={onExportChat}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
              title={ui.exportChat}
              aria-label={ui.exportChat}
            >
              <Download size={17} />
            </button>
          )}

          {/* New Chat Button (only visible in chat mode) */}
          {activeTab === 'chat' && (
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors min-h-[38px] cursor-pointer"
              title={ui.newChat}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline">{ui.newChat}</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Moon size={18} className="text-sky-400" />
            ) : (
              <Sun size={18} className="text-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Tabs (visible on mobile / small screens) */}
      <div className="md:hidden flex items-center justify-center border-t border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/90 dark:bg-[#10141f]/90 py-1.5 px-3">
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 w-full max-w-sm justify-between">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#1e2436] text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
