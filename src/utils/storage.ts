import { ChatSession, SupportedLanguage, ThemeMode } from '../types/chat';

const SESSIONS_KEY = 'bharatgpt_sessions_v1';
const ACTIVE_SESSION_KEY = 'bharatgpt_active_session_id';
const LANGUAGE_KEY = 'bharatgpt_language';
const THEME_KEY = 'bharatgpt_theme';

export function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load sessions from localStorage', e);
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_SESSION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to set active session ID', e);
  }
}

export function getStoredLanguage(): SupportedLanguage {
  try {
    const lang = localStorage.getItem(LANGUAGE_KEY) as SupportedLanguage;
    if (lang && ['en', 'hi', 'ur', 'kn'].includes(lang)) {
      return lang;
    }
  } catch {}
  return 'en';
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.error('Failed to save language', e);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      return theme;
    }
  } catch {}
  return 'system';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}
