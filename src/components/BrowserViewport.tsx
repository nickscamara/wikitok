"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCursor } from "./AnimatedCursor";

interface BrowserViewportProps {
  liveViewUrl?: string;
  currentLink?: string;
  isRunning?: boolean;
}

export function BrowserViewport({ liveViewUrl, currentLink, isRunning }: BrowserViewportProps) {
  if (!liveViewUrl) {
    return (
      <div className="w-full aspect-[4/3] border border-[#a2a9b1] bg-[#f8f9fa] flex flex-col items-center justify-center gap-3 relative">
        <div className="absolute inset-0 shimmer" />
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" className="text-[#0645ad]/40">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" strokeWidth="1"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="0.75"/>
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.75"/>
          </svg>
        </motion.div>
        <div className="flex flex-col items-center gap-1.5 z-10">
          <p className="text-[12px] text-[#54595d]" style={{ fontFamily: "system-ui, sans-serif" }}>
            Launching browser...
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#0645ad]/30"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-[#a2a9b1] bg-white relative overflow-hidden">
      {/* URL bar mimicking Wikipedia/browser chrome */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-[#f8f9fa] border-b border-[#a2a9b1]"
           style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#c8ccd1] rounded-sm text-[10px]">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#72777d" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentLink || "wiki"}
              className="text-[#202122] truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              en.wikipedia.org
              <span className="text-[#54595d]">/wiki/{currentLink?.replace(/ /g, "_") || "..."}</span>
            </motion.span>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {isRunning && (
            <motion.div
              className="flex items-center gap-1 px-1.5 py-0.5 bg-[#fee7e6] rounded-sm border border-[#d73333]/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#d73333]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[7px] font-bold text-[#d73333] uppercase tracking-wide">
                Live
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Browser content */}
      <div className="relative aspect-[4/3]">
        <iframe
          src={liveViewUrl}
          className="w-full h-full"
          title="Live Wikipedia browser"
          allow="autoplay"
        />

        {isRunning && (
          <AnimatedCursor isActive={isRunning} clickedLink={currentLink} />
        )}
      </div>
    </div>
  );
}
