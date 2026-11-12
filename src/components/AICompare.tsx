import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  GitCompare,
  Sparkles,
  Zap,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Compass,
  ArrowRight,
  RotateCcw,
  Layers,
  CheckSquare,
  Square,
} from 'lucide-react';
import { SupportedLanguage, ModelComparisonResult, ComparisonSession } from '../types/chat';
import { UI_STRINGS } from '../utils/languages';

interface AICompareProps {
  language: SupportedLanguage;
}

interface ModelMeta {
  id: string;
  name: string;
  badge: string;
  description: string;
  tagColor: string;
}

const DEFAULT_MODELS: ModelMeta[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Flagship Flash',
    description: 'Advanced reasoning, deep comprehension & high speed',
    tagColor: 'amber',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Fast Lite',
    description: 'Lightweight model engineered for minimum latency',
    tagColor: 'emerald',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    badge: 'Stable Production',
    description: 'Dependable general-purpose production model',
    tagColor: 'sky',
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    badge: 'High Performance',
    description: 'Comprehensive technical and linguistic depth',
    tagColor: 'purple',
  },
];

const COMPARE_PROMPTS: Record<SupportedLanguage, string[]> = {
  hi: [
    'यूनिफाइड पेमेंट्स इंटरफेस (UPI) और भारत के डिजिटल पब्लिक इंफ्रास्ट्रक्चर की मुख्य ताकत 3 बिंदुओं में बताएं।',
    'क्वांटम कंप्यूटिंग और पारंपरिक कंप्यूटिंग के बीच सबसे बड़ा अंतर क्या है? सरल उदाहरण से समझाएं।',
    'किसने बनाया भारतGPT? (Who created BharatGPT?)',
    'जावास्क्रिप्ट में Promises और Async/Await में क्या बुनियादी अंतर है? कोड उदाहरण सहित बताएं।',
  ],
  en: [
    'Explain the fundamental difference between classical and quantum computing in simple bullet points.',
    'Who created BharatGPT?',
    'What makes India’s Digital Public Infrastructure (UPI, Aadhaar, DigiLocker) unique globally?',
    'Write a concise TypeScript function to debounce an event with proper generics and explanation.',
  ],
  ur: [
    'مصنوعی ذہانت کے مستقبل اور انسانی معاشرے پر اس کے بنیادی اثرات تین نکات میں بیان کریں۔',
    'بھارت جی پی ٹی کس نے بنایا؟ (Who created BharatGPT?)',
    'کوانٹم کمپیوٹنگ اور روایتی کمپیوٹنگ میں کیا فرق ہے؟ آسان الفاظ میں واضح کریں۔',
    'اردو شاعری میں مرزا غالب کی انفرادی شان اور فلسفہ کیا ہے؟',
  ],
  kn: [
    'ಕ್ವಾಂಟಮ್ ಕಂಪ್ಯೂಟಿಂಗ್ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಕಂಪ್ಯೂಟಿಂಗ್ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಿ.',
    'ಭಾರತ್‌ಜಿಪಿಟಿಯನ್ನು ಯಾರು ರಚಿಸಿದರು? (Who created BharatGPT?)',
    'ಕರ್ನಾಟಕದ ಕೃಷಿ ವಲಯಕ್ಕೆ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ತಂತ್ರಜ್ಞಾನಗಳು ಹೇಗೆ ನೆರವಾಗಬಹುದು?',
    'ಭಾರತದ ಯುಪಿಐ (UPI) ಡಿಜಿಟಲ್ ಪಾವತಿ ಕ್ರಾಂತಿಯ ಮುಖ್ಯ ಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಿ.',
  ],
};

const STORAGE_KEY = 'bharatgpt_compare_history';

const compareMarkdownComponents = {
  strong({ children }: any) {
    return (
      <strong className="font-bold text-neutral-950 dark:text-white bg-amber-500/10 dark:bg-amber-400/15 px-1 py-0.5 rounded-sm">
        {children}
      </strong>
    );
  },
  em({ children }: any) {
    return <em className="italic text-neutral-900 dark:text-neutral-100">{children}</em>;
  },
  ul({ children }: any) {
    return (
      <ul className="my-1.5 ml-4 space-y-1 list-disc list-outside marker:text-amber-500 dark:marker:text-amber-400">
        {children}
      </ul>
    );
  },
  ol({ children }: any) {
    return (
      <ol className="my-1.5 ml-4 space-y-1 list-decimal list-outside marker:font-semibold marker:text-amber-600 dark:marker:text-amber-400">
        {children}
      </ol>
    );
  },
  li({ children }: any) {
    return <li className="leading-relaxed pl-0.5">{children}</li>;
  },
  p({ children }: any) {
    return <p className="my-1.5 leading-relaxed">{children}</p>;
  },
  code({ node, className, children, ...props }: any) {
    const codeString = String(children).replace(/\n$/, '');
    const isInline = !codeString.includes('\n');
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-neutral-200/80 dark:bg-neutral-800 text-amber-800 dark:text-amber-300 font-semibold"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="my-2 p-2.5 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto border border-neutral-700">
        <code>{codeString}</code>
      </pre>
    );
  },
};

export const AICompare: React.FC<AICompareProps> = ({ language }) => {
  const ui = UI_STRINGS[language] || UI_STRINGS.en;
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ]);
  const [availableModels] = useState<ModelMeta[]>(DEFAULT_MODELS);
  const [isComparing, setIsComparing] = useState(false);
  const [currentResults, setCurrentResults] = useState<ModelComparisonResult[] | null>(null);
  const [activeSessionPrompt, setActiveSessionPrompt] = useState<string>('');
  const [history, setHistory] = useState<ComparisonSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save comparison history to localStorage');
    }
  }, [history]);

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          return prev; // keep at least 2 models
        }
        return prev.filter((m) => m !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleRunComparison = async () => {
    if (!prompt.trim() || selectedModels.length < 2 || isComparing) return;

    setIsComparing(true);
    setError(null);
    setCurrentResults(null);
    setActiveSessionPrompt(prompt.trim());

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          models: selectedModels,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Comparison did not return valid result models.');
      }

      setCurrentResults(data.results);

      const newSession: ComparisonSession = {
        id: data.id || `compare-${Date.now()}`,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        results: data.results,
      };

      setHistory((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err?.message || 'Failed to complete model comparison. Please check your network.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find the fastest responding model
  const fastestModelId = React.useMemo(() => {
    if (!currentResults) return null;
    const successful = currentResults.filter((r) => r.success && r.responseTimeMs > 0);
    if (successful.length < 2) return null;
    return successful.reduce((prev, curr) =>
      curr.responseTimeMs < prev.responseTimeMs ? curr : prev
    ).modelId;
  }, [currentResults]);

  const suggestions = COMPARE_PROMPTS[language] || COMPARE_PROMPTS.en;

  const getTagColorClass = (color: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'sky':
        return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'purple':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
      default:
        return 'bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border-neutral-500/30';
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'amber':
        return 'border-t-amber-500';
      case 'emerald':
        return 'border-t-emerald-500';
      case 'sky':
        return 'border-t-sky-500';
      case 'purple':
        return 'border-t-purple-500';
      default:
        return 'border-t-neutral-400';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-6xl mx-auto w-full">
      {/* Hero Badge & Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-amber-500/20 text-neutral-800 dark:text-neutral-200 mb-2">
          <GitCompare size={14} className="text-amber-500" />
          <span>{ui.tabCompare || 'AI Compare'} · Multi-Model Benchmark</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Side-by-Side <span className="text-amber-500">AI Model</span> Comparison
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl mx-auto">
          {ui.compareSubtitle ||
            'Ask one question across multiple real Gemini models simultaneously to compare answers, response times, and reasoning speed.'}
        </p>
      </div>

      {/* Main Comparison Input Box */}
      <div className="bg-neutral-50 dark:bg-[#121622] border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        {/* Model Selection Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Layers size={14} className="text-amber-500" />
              <span>Select Models to Compare (Choose 2 or more):</span>
            </label>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                selectedModels.length >= 2
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {selectedModels.length} of {availableModels.length} selected
            </span>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {availableModels.map((model) => {
              const isSelected = selectedModels.includes(model.id);
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-[#181f2f] border-amber-500/60 dark:border-amber-500/60 shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-white/60 dark:bg-[#0f131d]/60 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                      {model.name}
                    </span>
                    <span className="shrink-0 text-amber-500">
                      {isSelected ? (
                        <CheckSquare size={16} className="text-amber-500" />
                      ) : (
                        <Square size={16} className="text-neutral-400" />
                      )}
                    </span>
                  </div>

                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border w-fit mb-1.5 ${getTagColorClass(
                      model.tagColor
                    )}`}
                  >
                    {model.badge}
                  </span>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    {model.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Prompt Input */}
        <div className="space-y-2 mt-4 pt-4 border-t border-neutral-200/70 dark:border-neutral-800/70">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Enter Your Question
            </span>
            <span className="text-[11px] font-normal text-neutral-400">
              {prompt.length} / 1000 characters
            </span>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask any question, logic puzzle, code task, or inquiry to compare how each AI model answers..."
              rows={3}
              maxLength={1000}
              className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-[#0c0f17] border border-neutral-200 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Quick Sample Questions */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-1.5">
            <Compass size={12} className="text-amber-500" />
            Comparison Ideas:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(s)}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0c0f17] border border-neutral-200/80 dark:border-neutral-700/70 text-neutral-700 dark:text-neutral-300 hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors line-clamp-1 max-w-full cursor-pointer"
                title={s}
              >
                ⚖️ {s}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button & Model Count */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200/70 dark:border-neutral-800/70">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sends real parallel requests with millisecond response timing</span>
          </div>

          <button
            type="button"
            disabled={!prompt.trim() || selectedModels.length < 2 || isComparing}
            onClick={handleRunComparison}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              !prompt.trim() || selectedModels.length < 2 || isComparing
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white active:scale-[0.98]'
            }`}
          >
            {isComparing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Comparing {selectedModels.length} Models...</span>
              </>
            ) : (
              <>
                <GitCompare size={16} />
                <span>{ui.compareButton || 'Compare Models'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-semibold underline cursor-pointer hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton Indicator */}
      {isComparing && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Running parallel benchmarks across selected models...</span>
          </div>
          <div
            className={`grid gap-4 ${
              selectedModels.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : selectedModels.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {selectedModels.map((mId) => {
              const meta = availableModels.find((m) => m.id === mId);
              return (
                <div
                  key={mId}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121622] p-4 animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
                      {meta?.name || mId}
                    </span>
                    <span className="w-16 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="w-5/6 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="w-4/6 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Side-by-Side Results Display */}
      {currentResults && !isComparing && (
        <div className="mt-8">
          {/* Active Question Banner */}
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-[#121622] border border-neutral-200 dark:border-neutral-800 mb-4 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                Evaluated Question:
              </span>
              <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                "{activeSessionPrompt}"
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPrompt(activeSessionPrompt);
                handleRunComparison();
              }}
              className="shrink-0 p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
              title="Rerun comparison"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Rerun</span>
            </button>
          </div>

          {/* Columns Grid */}
          <div
            className={`grid gap-4 ${
              currentResults.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : currentResults.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {currentResults.map((result) => {
              const meta = availableModels.find((m) => m.id === result.modelId);
              const isFastest = result.modelId === fastestModelId;
              const wordCount = result.text.trim().split(/\s+/).filter(Boolean).length;

              return (
                <div
                  key={result.modelId}
                  className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#121622] shadow-sm overflow-hidden transition-all border-t-4 ${
                    getBorderColorClass(meta?.tagColor || 'amber')
                  } ${
                    isFastest
                      ? 'ring-2 ring-emerald-500/40 dark:ring-emerald-500/30'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#151a28]/70">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {result.modelName}
                      </h3>
                      {isFastest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                          <Zap size={10} fill="currentColor" />
                          Fastest
                        </span>
                      )}
                    </div>

                    {/* Performance Metrics Bar */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Clock size={11} className="text-amber-500" />
                        {result.responseTimeMs > 0 ? (
                          <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
                            {result.responseTimeMs < 1000
                              ? `${result.responseTimeMs} ms`
                              : `${(result.responseTimeMs / 1000).toFixed(2)} s`}
                          </span>
                        ) : (
                          <span>N/A</span>
                        )}
                      </span>

                      {result.success && (
                        <span className="text-[10px] text-neutral-400">
                          {wordCount} words
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column Response Content */}
                  <div className="p-4 flex-1 overflow-y-auto max-h-[500px] text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans selection:bg-amber-500/20">
                    {result.success ? (
                      <ReactMarkdown components={compareMarkdownComponents}>
                        {result.text}
                      </ReactMarkdown>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                        <span>{result.error || 'Failed to generate response.'}</span>
                      </div>
                    )}
                  </div>

                  {/* Column Footer with Copy Action */}
                  <div className="p-2.5 bg-neutral-50 dark:bg-[#10141f] border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 truncate">
                      {meta?.badge || 'Gemini Model'}
                    </span>
                    {result.success && (
                      <button
                        type="button"
                        onClick={() => handleCopy(result.modelId, result.text)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Copy this model's answer"
                      >
                        {copiedId === result.modelId ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison History */}
      {history.length > 0 && (
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock size={13} className="text-amber-500" />
              Previous Comparisons ({history.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear comparison history?')) {
                  setHistory([]);
                  localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="text-xs text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveSessionPrompt(item.prompt);
                  setCurrentResults(item.results);
                }}
                className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-[#121622] hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-all cursor-pointer flex flex-col justify-between"
              >
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2 mb-2">
                  "{item.prompt}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                  <span>{item.results.length} Models</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
