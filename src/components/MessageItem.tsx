import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Volume2, VolumeX, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ChatMessage, SupportedLanguage } from '../types/chat';
import { ChakraLogo } from './ChakraLogo';
import { LANGUAGES } from '../utils/languages';

interface MessageItemProps {
  message: ChatMessage;
  language: SupportedLanguage;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
  isSpeaking?: boolean;
  onToggleSpeak?: (id: string, content: string, language: SupportedLanguage) => void;
}

// Stateful CodeBlock with copy-to-clipboard action and language badge
const CodeBlock: React.FC<{ language?: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-neutral-300/80 dark:border-neutral-700/80 bg-[#0d1117] dark:bg-[#090d16] text-neutral-100 shadow-sm not-prose">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-800/90 dark:bg-neutral-900/90 text-neutral-400 text-xs border-b border-neutral-700/60 font-mono select-none">
        <span className="font-semibold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied code' : 'Copy code to clipboard'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-neutral-700/70 text-neutral-300 hover:text-white transition-all cursor-pointer text-xs font-sans"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 sm:p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-neutral-100 selection:bg-amber-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Markdown components for AI responses
const createAssistantMarkdownComponents = (isUrdu: boolean) => ({
  // Bold text (**bold**)
  strong({ children }: any) {
    return (
      <strong className="font-bold text-neutral-950 dark:text-white bg-amber-500/10 dark:bg-amber-400/15 px-1 py-0.5 rounded-sm">
        {children}
      </strong>
    );
  },

  // Italic text (*italic* or _italic_)
  em({ children }: any) {
    return <em className="italic text-neutral-900 dark:text-neutral-100">{children}</em>;
  },

  // Bullet points (* or -)
  ul({ children }: any) {
    return (
      <ul
        className={`my-2.5 space-y-1.5 list-disc list-outside ${
          isUrdu ? 'mr-5 ml-0' : 'ml-5 mr-0'
        } marker:text-amber-500 dark:marker:text-amber-400 text-sm sm:text-base`}
      >
        {children}
      </ul>
    );
  },

  // Numbered lists (1., 2., etc.)
  ol({ children }: any) {
    return (
      <ol
        className={`my-2.5 space-y-1.5 list-decimal list-outside ${
          isUrdu ? 'mr-5 ml-0' : 'ml-5 mr-0'
        } marker:font-semibold marker:text-amber-600 dark:marker:text-amber-400 text-sm sm:text-base`}
      >
        {children}
      </ol>
    );
  },

  // List item
  li({ children }: any) {
    return (
      <li className="leading-relaxed pl-1 text-neutral-800 dark:text-neutral-100">
        {children}
      </li>
    );
  },

  // Paragraphs
  p({ children }: any) {
    return (
      <p className="my-2 sm:my-2.5 leading-relaxed text-sm sm:text-base last:mb-0 first:mt-0 text-neutral-800 dark:text-neutral-100">
        {children}
      </p>
    );
  },

  // Headings
  h1({ children }: any) {
    return (
      <h1 className="text-lg sm:text-xl font-bold mt-4 mb-2 text-neutral-950 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2 className="text-base sm:text-lg font-bold mt-3.5 mb-1.5 text-neutral-950 dark:text-white">
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3 className="text-sm sm:text-base font-bold mt-3 mb-1 text-neutral-900 dark:text-neutral-100">
        {children}
      </h3>
    );
  },

  // Blockquotes
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-3 border-amber-500 pl-3.5 my-2.5 italic text-neutral-700 dark:text-neutral-300 bg-amber-500/5 dark:bg-amber-500/10 py-1.5 rounded-r-lg">
        {children}
      </blockquote>
    );
  },

  // Horizontal rules
  hr() {
    return <hr className="my-3 sm:my-4 border-neutral-200 dark:border-neutral-800" />;
  },

  // Links
  a({ href, children }: any) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-sky-400 hover:underline font-medium break-all"
      >
        {children}
      </a>
    );
  },

  // Code & Code Blocks
  code({ node, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const isInline = !match && !codeString.includes('\n');

    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 mx-0.5 rounded-md text-xs sm:text-[13px] font-mono bg-neutral-200/80 dark:bg-neutral-800/90 text-amber-800 dark:text-amber-300 border border-neutral-300/70 dark:border-neutral-700/70 font-semibold"
          {...props}
        >
          {children}
        </code>
      );
    }

    return <CodeBlock language={match ? match[1] : undefined} code={codeString} />;
  },

  // Tables
  table({ children }: any) {
    return (
      <div className="overflow-x-auto my-3 rounded-lg border border-neutral-300 dark:border-neutral-700">
        <table className="min-w-full divide-y divide-neutral-300 dark:divide-neutral-700 text-xs sm:text-sm">
          {children}
        </table>
      </div>
    );
  },
  th({ children }: any) {
    return (
      <th className="px-3.5 py-2 text-left font-semibold uppercase tracking-wider bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border-b border-neutral-300 dark:border-neutral-700">
        {children}
      </th>
    );
  },
  td({ children }: any) {
    return (
      <td className="px-3.5 py-2 text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800">
        {children}
      </td>
    );
  },
});

// Markdown components for User messages
const userMarkdownComponents = {
  p({ children }: any) {
    return (
      <p className="leading-relaxed break-words whitespace-pre-wrap font-normal my-0.5 text-sm sm:text-base">
        {children}
      </p>
    );
  },
  strong({ children }: any) {
    return (
      <strong className="font-bold text-white underline decoration-white/40 decoration-1">
        {children}
      </strong>
    );
  },
  em({ children }: any) {
    return <em className="italic text-blue-100">{children}</em>;
  },
  ul({ children }: any) {
    return (
      <ul className="my-1.5 ml-4 space-y-1 list-disc list-outside text-sm sm:text-base">
        {children}
      </ul>
    );
  },
  ol({ children }: any) {
    return (
      <ol className="my-1.5 ml-4 space-y-1 list-decimal list-outside text-sm sm:text-base">
        {children}
      </ol>
    );
  },
  li({ children }: any) {
    return <li className="leading-relaxed pl-0.5">{children}</li>;
  },
  code({ node, className, children, ...props }: any) {
    const codeString = String(children).replace(/\n$/, '');
    const isInline = !codeString.includes('\n');

    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono bg-blue-700/80 text-white border border-blue-400/30"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="my-2 p-2.5 rounded-lg bg-blue-800/90 text-white font-mono text-xs overflow-x-auto border border-blue-500/40">
        <code>{codeString}</code>
      </pre>
    );
  },
};

export const MessageItemComponent: React.FC<MessageItemProps> = ({
  message,
  language,
  onRegenerate,
  isLastAssistant = false,
  isSpeaking = false,
  onToggleSpeak,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.role === 'user';
  const effectiveLanguage = message.language || language;
  const isUrdu =
    effectiveLanguage === 'ur' ||
    /[\u0600-\u06FF]/.test(message.content);

  const assistantMarkdown = React.useMemo(
    () => createAssistantMarkdownComponents(isUrdu),
    [isUrdu]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleSpeakClick = () => {
    if (onToggleSpeak) {
      onToggleSpeak(message.id, message.content, effectiveLanguage);
    }
  };

  if (isUser) {
    return (
      <div className="w-full flex justify-end group transition-all my-1 sm:my-1.5 self-end">
        <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[78%] ml-auto">
          {/* User Message Bubble with Blue Background */}
          <div className="flex flex-col items-end">
            <div
              dir={isUrdu ? 'rtl' : 'ltr'}
              className={`relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl rounded-br-xs shadow-xs text-white selection:bg-white/30 transition-all ${
                isUrdu
                  ? 'font-["Noto_Nastaliq_Urdu",system-ui] leading-[2.2rem] text-right'
                  : message.language === 'hi'
                  ? 'font-["Noto_Sans_Devanagari",sans-serif]'
                  : message.language === 'kn'
                  ? 'font-["Noto_Sans_Kannada",sans-serif]'
                  : ''
              } bg-blue-600 dark:bg-blue-600 text-white shadow-sm`}
            >
              <ReactMarkdown components={userMarkdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Time & Quick Copy Action below user bubble */}
            <div className="flex items-center gap-1.5 mt-1 px-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy"
                aria-label={copied ? 'Copied' : 'Copy message'}
                className="p-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* User Avatar */}
          <div className="shrink-0 mb-5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-xs ring-2 ring-white dark:ring-neutral-900">
              YOU
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Assistant Response Bubble (Left aligned with neutral background)
  return (
    <div className="w-full flex justify-start group transition-all my-1.5 sm:my-2 self-start">
      <div className="flex items-start gap-2.5 sm:gap-3.5 max-w-[96%] sm:max-w-[88%] w-full mr-auto">
        {/* BharatGPT Chakra Avatar */}
        <div className="shrink-0 mt-1">
          <div className="relative">
            <ChakraLogo size={32} showRings={true} />
          </div>
        </div>

        {/* AI Response Card/Bubble with Neutral Background */}
        <div className="flex-1 min-w-0">
          <div
            dir={isUrdu ? 'rtl' : 'ltr'}
            className="rounded-2xl rounded-tl-xs px-4 py-3.5 sm:px-5 sm:py-4 bg-neutral-100 dark:bg-[#151a26] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl rounded-tl-xs shadow-2xs text-neutral-900 dark:text-neutral-100 transition-colors"
          >
            {/* Header: Name, Time & Badge */}
            <div
              className={`flex items-center gap-2 mb-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium ${
                isUrdu ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                BharatGPT
              </span>
              <span>·</span>
              <span className="text-[11px]">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>·</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold tracking-tight">
                Gemini 1.5 Flash
              </span>
            </div>

            {/* Markdown Body Text */}
            <div
              className={`max-w-none break-words leading-relaxed text-neutral-800 dark:text-neutral-100 ${
                isUrdu
                  ? 'font-["Noto_Nastaliq_Urdu",system-ui] leading-[2.2rem]'
                  : message.language === 'hi'
                  ? 'font-["Noto_Sans_Devanagari",sans-serif]'
                  : message.language === 'kn'
                  ? 'font-["Noto_Sans_Kannada",sans-serif]'
                  : ''
              }`}
            >
              {message.content ? (
                <ReactMarkdown components={assistantMarkdown}>
                  {message.content}
                </ReactMarkdown>
              ) : null}

              {/* Loading animation while waiting for the first token */}
              {message.isStreaming && !message.content && (
                <div className="flex items-center gap-2.5 py-1.5 text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#138808] animate-bounce" />
                  </div>
                  <span className="text-xs font-medium tracking-tight animate-pulse">
                    {language === 'hi'
                      ? 'भारतGPT उत्तर तैयार कर रहा है...'
                      : language === 'ur'
                      ? 'بھارت جی پی ٹی سوچ رہا ہے...'
                      : language === 'kn'
                      ? 'ಭಾರತ್‌ಜಿಪಿಟಿ ಆಲೋಚಿಸುತ್ತಿದೆ...'
                      : 'BharatGPT is thinking...'}
                  </span>
                </div>
              )}

              {/* Live streaming cursor while text types out word-by-word */}
              {message.isStreaming && message.content && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-amber-500 animate-pulse align-middle rounded-xs shadow-xs" />
              )}
            </div>

            {/* Action Toolbar */}
            {!message.isStreaming && (
              <div
                className={`flex items-center gap-1 mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 text-neutral-500 dark:text-neutral-400 transition-opacity ${
                  isSpeaking ? 'opacity-100' : 'opacity-90 sm:opacity-80 group-hover:opacity-100'
                } ${isUrdu ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? 'Copied' : 'Copy response'}
                  className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                  title="Copy"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>

                {/* Text-to-speech speaker button */}
                <button
                  type="button"
                  onClick={handleSpeakClick}
                  aria-label={
                    isSpeaking
                      ? 'Stop reading'
                      : `Read aloud in ${LANGUAGES[effectiveLanguage]?.name || 'selected language'}`
                  }
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/40 opacity-100 shadow-xs'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title={
                    isSpeaking
                      ? 'Stop reading'
                      : `Read aloud in ${LANGUAGES[effectiveLanguage]?.name || 'selected language'}`
                  }
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="flex items-center gap-0.5 h-3" aria-hidden="true">
                        <span className="w-0.5 h-3 bg-amber-500 animate-pulse" />
                        <span className="w-0.5 h-2 bg-amber-500 animate-pulse [animation-delay:0.15s]" />
                        <span className="w-0.5 h-3.5 bg-amber-500 animate-pulse [animation-delay:0.3s]" />
                        <span className="w-0.5 h-1.5 bg-amber-500 animate-pulse [animation-delay:0.45s]" />
                      </span>
                      <span className="text-[11px] font-medium hidden sm:inline">Speaking</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} className="shrink-0" />
                      <span className="text-[11px] hidden sm:inline">Listen</span>
                    </>
                  )}
                </button>

                {onRegenerate && isLastAssistant && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    aria-label="Regenerate response"
                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                    title="Regenerate"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}

                <div className="flex items-center gap-0.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setLiked(liked === true ? null : true)}
                    className={`p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
                      liked === true ? 'text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                    title="Helpful"
                    aria-label="Helpful"
                  >
                    <ThumbsUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiked(liked === false ? null : false)}
                    className={`p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
                      liked === false ? 'text-rose-600 dark:text-rose-400' : ''
                    }`}
                    title="Not helpful"
                    aria-label="Not helpful"
                  >
                    <ThumbsDown size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MessageItem = React.memo(MessageItemComponent);
