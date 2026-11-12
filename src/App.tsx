import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeView } from './components/WelcomeView';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { CreatorModal } from './components/CreatorModal';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { AICompare } from './components/AICompare';
import { ChatSession, ChatMessage, SupportedLanguage, ThemeMode, ActiveTab } from './types/chat';
import {
  loadSessions,
  saveSessions,
  getActiveSessionId,
  setActiveSessionId as storeActiveSessionId,
  getStoredLanguage,
  setStoredLanguage,
  getStoredTheme,
  setStoredTheme,
} from './utils/storage';
import { speakText, stopSpeech } from './utils/textToSpeech';
import { detectInputLanguage } from './utils/languages';
import { ArrowDown, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => getActiveSessionId());
  const [language, setLanguage] = useState<SupportedLanguage>(() => getStoredLanguage());
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Active session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Apply Theme to documentElement
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  // Apply Language to documentElement
  useEffect(() => {
    document.documentElement.lang = language;
    setStoredLanguage(language);
  }, [language]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Save sessions to localStorage only when not actively streaming to eliminate main-thread stutter
  useEffect(() => {
    if (!isStreaming) {
      saveSessions(sessions);
    }
  }, [sessions, isStreaming]);

  // Save activeSessionId to localStorage
  useEffect(() => {
    storeActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Fast scroll to bottom
  const scrollToBottom = useCallback((smooth = false) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Monitor scroll position to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  // Keyboard shortcuts (Cmd+N / Ctrl+N for new chat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // New Chat Handler
  const handleNewChat = () => {
    setActiveTab('chat');
    stopSpeech();
    setSpeakingMessageId(null);
    if (isStreaming) {
      handleStopStreaming();
    }
    setActiveSessionId(null);
    setErrorMessage(null);
  };

  // Select Session
  const handleSelectSession = (id: string) => {
    setActiveTab('chat');
    stopSpeech();
    setSpeakingMessageId(null);
    if (isStreaming) {
      handleStopStreaming();
    }
    setActiveSessionId(id);
    setErrorMessage(null);
    setTimeout(() => scrollToBottom(false), 50);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    stopSpeech();
    setSpeakingMessageId(null);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Toggle Pin Session
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Clear all chats
  const handleClearAllChats = () => {
    stopSpeech();
    setSpeakingMessageId(null);
    setSessions([]);
    setActiveSessionId(null);
  };

  // Toggle Read Aloud Text-to-Speech
  const handleToggleSpeak = useCallback(
    (id: string, text: string, msgLang?: SupportedLanguage) => {
      if (speakingMessageId === id) {
        stopSpeech();
        setSpeakingMessageId(null);
        return;
      }

      const targetLang = msgLang || activeSession?.language || language;
      setSpeakingMessageId(id);

      speakText(
        text,
        targetLang,
        () => {
          setSpeakingMessageId(id);
        },
        () => {
          setSpeakingMessageId((current) => (current === id ? null : current));
        },
        () => {
          setSpeakingMessageId((current) => (current === id ? null : current));
        }
      );
    },
    [speakingMessageId, activeSession?.language, language]
  );

  // Toggle Theme mode (light -> dark -> light)
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Stop generation
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Finalize assistant message streaming state
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) => ({ ...m, isStreaming: false })),
          };
        })
      );
    }
  };

  // Send Message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    stopSpeech();
    setSpeakingMessageId(null);
    setErrorMessage(null);

    // Automatically detect input language (English, Hinglish, Hindi, Kannada, Urdu)
    const detected = detectInputLanguage(text);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
      language: detected.effectiveCode,
    };

    let targetSessionId = activeSessionId;
    let currentMessages: ChatMessage[] = [];

    // If no active session, create a new one
    if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
      const newSessionTitle =
        text.length > 36 ? `${text.substring(0, 36).trim()}...` : text;
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: newSessionTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        language: detected.effectiveCode,
        messages: [userMessage],
      };
      targetSessionId = newSession.id;
      currentMessages = [userMessage];
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(targetSessionId);
    } else {
      currentMessages = [...(activeSession?.messages || []), userMessage];
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...s.messages, userMessage],
              }
            : s
        )
      );
    }

    // Prepare assistant placeholder message with detected language styling
    const assistantMessageId = `msg-${Date.now() + 1}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      language: detected.effectiveCode,
      isStreaming: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              messages: [...s.messages, initialAssistantMessage],
            }
          : s
      )
    );

    setIsStreaming(true);
    scrollToBottom(false);

    // Call server API with streaming
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Reduce unnecessary API payload: send only recent conversation turns (last 8)
      const contextWindow = currentMessages.slice(-8);

      const SYSTEM_INSTRUCTION =
        "You are BharatGPT, a warm, helpful, and direct AI assistant for India. Respond naturally, answer directly in sentence 1 without unnecessary fluff, use bold text for key points, and match the user's language (English, Hindi, Hinglish, or Kannada).";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-1.5-flash',
          systemInstruction: SYSTEM_INSTRUCTION,
          messages: contextWindow.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
          detectedLanguage: detected.code,
          stream: true,
          temperature: 0.4,
          maxTokens: 200,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamBuffer = '';
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split('\n');
        streamBuffer = lines.pop() || '';

        let hasNewTokens = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              fullResponse += parsed.text;
              hasNewTokens = true;
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }

        if (hasNewTokens) {
          const current = fullResponse;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== targetSessionId) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: current, isStreaming: true }
                    : m
                ),
              };
            })
          );

          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }
      }

      // Finalize assistant message with full response text
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fullResponse, isStreaming: false }
                : m
            ),
          };
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat generation aborted by user.');
      } else {
        console.error('Chat error:', err);
        const errText =
          err?.message || 'Failed to reach BharatGPT server. Please check connection.';
        setErrorMessage(errText);

        // Update assistant message to show error if empty
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId && !m.content
                  ? {
                      ...m,
                      content: `⚠️ ${errText}`,
                      isStreaming: false,
                    }
                  : { ...m, isStreaming: false }
              ),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length < 2 || isStreaming) return;
    const lastUserIndex = [...activeSession.messages]
      .reverse()
      .findIndex((m) => m.role === 'user');

    if (lastUserIndex === -1) return;
    const actualUserIndex = activeSession.messages.length - 1 - lastUserIndex;
    const lastUserMessage = activeSession.messages[actualUserIndex];

    // Truncate messages after user message
    const prunedMessages = activeSession.messages.slice(0, actualUserIndex);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id ? { ...s, messages: prunedMessages } : s
      )
    );

    handleSendMessage(lastUserMessage.content);
  };

  // Export current chat as Markdown
  const handleExportChat = () => {
    if (!activeSession || activeSession.messages.length === 0) return;

    let content = `# ${activeSession.title}\n\n`;
    content += `*Exported from BharatGPT on ${new Date().toLocaleString()}*\n\n---\n\n`;

    activeSession.messages.forEach((m) => {
      const sender = m.role === 'user' ? '👤 User' : '🇮🇳 BharatGPT';
      const time = new Date(m.timestamp).toLocaleTimeString();
      content += `### ${sender} (${time})\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSession.title.replace(/[^a-zA-Z0-9_\u0900-\u097F\u0C80-\u0CFF\u0600-\u06FF]/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#0c0f17] text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={language}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onExportChat={handleExportChat}
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          hasActiveMessages={Boolean(activeSession && activeSession.messages.length > 0)}
        />

        {/* Tab 1: AI Chat View */}
        {activeTab === 'chat' && (
          <>
            {/* Chat Scroll Container */}
            <div
              ref={chatScrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto relative scroll-smooth focus:outline-none"
            >
              {errorMessage && (
                <div className="max-w-3xl mx-auto px-4 pt-3">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-rose-500" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="font-semibold underline cursor-pointer hover:opacity-80"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {!activeSession || activeSession.messages.length === 0 ? (
                <WelcomeView
                  language={language}
                  onSelectPrompt={(p) => handleSendMessage(p)}
                  onSelectLanguage={(l) => setLanguage(l)}
                />
              ) : (
                <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-4 flex flex-col space-y-3 sm:space-y-4 pb-8">
                  {activeSession.messages.map((message, idx) => (
                    <div
                      key={message.id}
                      className={`w-full flex flex-col ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <MessageItem
                        message={message}
                        language={activeSession.language || language}
                        onRegenerate={handleRegenerate}
                        isLastAssistant={
                          idx === activeSession.messages.length - 1 &&
                          message.role === 'assistant'
                        }
                        isSpeaking={speakingMessageId === message.id}
                        onToggleSpeak={handleToggleSpeak}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Floating Scroll to Bottom Button */}
              {showScrollBottom && (
                <button
                  type="button"
                  onClick={() => scrollToBottom(true)}
                  className="fixed bottom-24 right-6 sm:right-10 p-2.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all z-20 cursor-pointer"
                  title="Scroll to bottom"
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown size={16} />
                </button>
              )}
            </div>

            {/* Fixed Chat Input Area */}
            <div className="shrink-0 z-20 bg-gradient-to-t from-white via-white dark:from-[#0c0f17] dark:via-[#0c0f17] to-transparent pt-3">
              <ChatInput
                onSendMessage={handleSendMessage}
                onStopStreaming={handleStopStreaming}
                isStreaming={isStreaming}
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </>
        )}

        {/* Tab 2: AI Image Generator View */}
        {activeTab === 'image' && <ImageGenerator language={language} />}

        {/* Tab 3: AI Video Generator View */}
        {activeTab === 'video' && <VideoGenerator language={language} />}

        {/* Tab 4: AI Compare View */}
        {activeTab === 'compare' && <AICompare language={language} />}

        {/* Website Footer with About the Creator section across all tabs */}
        <Footer onOpenCreatorModal={() => setIsCreatorModalOpen(true)} />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        onClearAllChats={handleClearAllChats}
        totalChats={sessions.length}
      />

      {/* Creator Profile Modal */}
      <CreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
      />
    </div>
  );
}
