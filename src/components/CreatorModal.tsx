import React from 'react';
import { X, Sparkles, Award, Globe, Code2, Heart, CheckCircle2 } from 'lucide-react';
import { ChakraLogo } from './ChakraLogo';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#141923] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Tricolour Ribbon */}
        <div className="w-full h-[3px] bg-gradient-to-r from-[#FF9933] via-white dark:via-neutral-400 to-[#138808]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <ChakraLogo size={22} showRings={false} />
            <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              About the Creator
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Creator Hero Card */}
          <div className="relative overflow-hidden rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-neutral-50 dark:via-[#161d2b] to-emerald-500/5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF9933] via-[#000080] to-[#138808] p-[2px] shadow-md">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0c0f17] flex items-center justify-center">
                    <span className="text-2xl font-black bg-gradient-to-tr from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      K
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={13} strokeWidth={3} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                  Founder &amp; Creator
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Kaif
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                  <span>Project:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    BharatGPT
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Envisioned and engineered by <strong className="text-neutral-900 dark:text-white">Kaif</strong>,{' '}
              <strong className="text-amber-600 dark:text-amber-400">BharatGPT</strong> is an advanced, multilingual AI assistant built to bridge digital literacy and linguistic diversity across India, offering natural conversations in Hindi, Urdu, Kannada, and English.
            </p>
          </div>

          {/* Project Pillars */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121722] border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                <Globe size={14} className="text-sky-500" />
                <span>Indic Multilingual</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                Devanagari, Kannada, and Nastaliq RTL typography with native voice recognition.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121722] border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                <Code2 size={14} className="text-emerald-500" />
                <span>Modern Stack</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                Gemini 3.8 Flash, TypeScript, React 19, Server-Sent Events, and Web Speech API.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-[#0e121a] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <span>Designed with</span>
            <Heart size={12} className="text-rose-500 fill-current" />
            <span>for Bharat</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
