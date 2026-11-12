import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  X,
  Settings,
  Sun,
  Moon,
  Globe,
  Check,
  Sparkles,
  Film,
  GitCompare,
} from 'lucide-react';
import { ChatSession, SupportedLanguage, ThemeMode, ActiveTab } from '../types/chat';
import { ChakraLogo } from './ChakraLogo';
import { UI_STRINGS, LANGUAGES } from '../utils/languages';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onOpenSettings: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  isOpen,
  onClose,
  language,
  onOpenSettings,
  theme,
  onToggleTheme,
  activeTab = 'chat',
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const ui = UI_STRINGS[language] || UI_STRINGS.en;

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  // Group sessions by timeframe
  const groupedSessions = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const pinned: ChatSession[] = [];
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const last7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    filteredSessions.forEach((session) => {
      if (session.isPinned) {
        pinned.push(session);
        return;
      }
      const diff = now - session.updatedAt;
      if (diff < oneDay) {
        today.push(session);
      } else if (diff < 2 * oneDay) {
        yesterday.push(session);
      } else if (diff < 7 * oneDay) {
        last7Days.push(session);
      } else {
        older.push(session);
      }
    });

    return { pinned, today, yesterday, last7Days, older };
  }, [filteredSessions]);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;

    if (isEditing) {
      return (
        <form
          key={session.id}
          onSubmit={(e) => handleSaveRename(session.id, e)}
          className="px-2 py-1 flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg my-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            onBlur={() => handleSaveRename(session.id)}
            className="w-full text-xs bg-transparent border-0 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-0 px-1 py-0.5"
          />
          <button
            type="submit"
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          >
            <Check size={13} />
          </button>
        </form>
      );
    }

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          if (window.innerWidth < 768) {
            onClose();
          }
        }}
        className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors my-0.5 ${
          isActive
            ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 font-semibold border-l-2 border-amber-500'
            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {session.isPinned ? (
            <Pin size={13} className="text-amber-500 shrink-0 rotate-45" />
          ) : (
            <MessageSquare size={13} className="text-neutral-400 shrink-0" />
          )}
          <span className="truncate">{session.title}</span>
        </div>

        {/* Hover / Active Actions */}
        <div
          className={`flex items-center gap-0.5 shrink-0 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinSession(session.id);
            }}
            className="p-1 rounded text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title={session.isPinned ? ui.unpin : ui.pin}
          >
            <Pin size={12} className={session.isPinned ? 'fill-current' : ''} />
          </button>
          <button
            type="button"
            onClick={(e) => handleStartRename(session, e)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title={ui.rename}
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(ui.confirmDelete)) {
                onDeleteSession(session.id);
              }
            }}
            className="p-1 rounded text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title={ui.delete}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-neutral-50 dark:bg-[#0e121b] border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat button */}
        <div className="p-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <ChakraLogo size={24} showRings={false} />
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Bharat<span className="text-amber-500">GPT</span>
              </span>
            </div>
            {/* Close button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} strokeWidth={2.5} />
              <span>{ui.newChat}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">⌘N</span>
          </button>

          {/* Multi-AI Platform Navigation */}
          <div className="grid grid-cols-4 gap-1 mt-2.5 p-1 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-xl">
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('chat');
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#1a2030] text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title={ui.tabChat}
            >
              <MessageSquare size={13} className="mb-0.5" />
              <span className="truncate">{ui.tabChat || 'Chat'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab?.('image');
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'image'
                  ? 'bg-white dark:bg-[#1a2030] text-orange-600 dark:text-orange-400 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title={ui.tabImage}
            >
              <Sparkles size={13} className="mb-0.5" />
              <span className="truncate">{ui.tabImage || 'Image'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab?.('video');
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-white dark:bg-[#1a2030] text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title={ui.tabVideo}
            >
              <Film size={13} className="mb-0.5" />
              <span className="truncate">{ui.tabVideo || 'Video'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectTab?.('compare');
                if (window.innerWidth < 768) onClose();
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-white dark:bg-[#1a2030] text-sky-600 dark:text-sky-400 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title={ui.tabCompare}
            >
              <GitCompare size={13} className="mb-0.5" />
              <span className="truncate">{ui.tabCompare || 'Compare'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2.5">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ui.searchChats}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#141923] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              {ui.noChats}
            </div>
          ) : (
            <>
              {/* Pinned Group */}
              {groupedSessions.pinned.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                    <Pin size={10} className="rotate-45 fill-current" />
                    <span>Pinned</span>
                  </div>
                  {groupedSessions.pinned.map(renderSessionItem)}
                </div>
              )}

              {/* Today */}
              {groupedSessions.today.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    {ui.today}
                  </div>
                  {groupedSessions.today.map(renderSessionItem)}
                </div>
              )}

              {/* Yesterday */}
              {groupedSessions.yesterday.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    {ui.yesterday}
                  </div>
                  {groupedSessions.yesterday.map(renderSessionItem)}
                </div>
              )}

              {/* Last 7 Days */}
              {groupedSessions.last7Days.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    {ui.last7Days}
                  </div>
                  {groupedSessions.last7Days.map(renderSessionItem)}
                </div>
              )}

              {/* Older */}
              {groupedSessions.older.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                    {ui.older}
                  </div>
                  {groupedSessions.older.map(renderSessionItem)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Area with Settings and Theme switch */}
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-1">
          {/* Quick Language Indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Globe size={13} className="text-amber-500" />
              <span>{LANGUAGES[language]?.nativeName}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 uppercase font-mono">
              {language}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-500" />}
              <span>{theme === 'dark' ? ui.dark : ui.light}</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={ui.settings}
              aria-label={ui.settings}
            >
              <Settings size={16} />
            </button>
          </div>

          {/* About Creator Footer Tag */}
          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between px-1">
            <span>Founder &amp; Creator: <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">Kaif</strong></span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">BharatGPT</span>
          </div>
        </div>
      </aside>
    </>
  );
};
