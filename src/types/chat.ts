export type SupportedLanguage = 'en' | 'hi' | 'ur' | 'kn';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  greeting: string;
  placeholder: string;
  dir: 'ltr' | 'rtl';
  speechCode: string;
  voiceLang: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language?: SupportedLanguage;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  language: SupportedLanguage;
  isPinned?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ActiveTab = 'chat' | 'image' | 'video' | 'compare';

export interface GeneratedImage {
  id: string;
  prompt: string;
  aspectRatio: string;
  imageUrl: string;
  timestamp: number;
  language?: SupportedLanguage;
  source?: string;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  aspectRatio: string;
  duration: string;
  videoUrl: string;
  timestamp: number;
  language?: SupportedLanguage;
  source?: string;
}

export interface ModelComparisonResult {
  modelId: string;
  modelName: string;
  text: string;
  responseTimeMs: number;
  success: boolean;
  error?: string;
}

export interface ComparisonSession {
  id: string;
  prompt: string;
  timestamp: number;
  results: ModelComparisonResult[];
}
