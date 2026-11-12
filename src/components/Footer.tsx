import React, { useState } from 'react';
import { Sparkles, Heart, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { ChakraLogo } from './ChakraLogo';

interface FooterProps {
  onOpenCreatorModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCreatorModal }) => {
  return (
    <footer className="w-full shrink-0 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
        {/* About the Creator Section */}
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              About the Creator:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-neutral-500 dark:text-neutral-400">Founder &amp; Creator:</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Kaif
              </span>
              <span className="text-neutral-400 dark:text-neutral-500 font-normal" aria-hidden="true">
                ·
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">Project:</span>
              <span className="font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 dark:from-amber-400 dark:via-orange-400 dark:to-emerald-400 bg-clip-text text-transparent">
                BharatGPT
              </span>
            </div>
          </div>
        </div>

        {/* Right Details / Quick View */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="hidden md:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck size={12} />
            <span>AI Verified</span>
          </span>
          <span className="hidden md:inline text-neutral-300 dark:text-neutral-700 font-light">·</span>
          <span>Crafted with pride for India</span>
          {onOpenCreatorModal && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700 font-light">·</span>
              <button
                type="button"
                onClick={onOpenCreatorModal}
                className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer transition-colors"
              >
                More Info
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
