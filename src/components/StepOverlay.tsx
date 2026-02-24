"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StepObject } from "@/lib/types";

interface StepOverlayProps {
  currentStep?: StepObject;
  steps: StepObject[];
  targetTitle: string;
}

export function StepOverlay({ currentStep, steps, targetTitle }: StepOverlayProps) {
  return (
    <div className="w-full space-y-2" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-[#eaecf0] rounded-sm overflow-hidden flex gap-px">
          {steps.map((s) => (
            <motion.div
              key={s.step}
              className={`flex-1 ${
                s.step === currentStep?.step
                  ? "bg-[#0645ad] wiki-pulse"
                  : "bg-[#0645ad]/40"
              }`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.3 }}
              style={{ transformOrigin: "bottom" }}
            />
          ))}
          {Array.from({ length: Math.max(0, 6 - steps.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 bg-[#eaecf0]" />
          ))}
        </div>
        <motion.span
          className="text-[11px] font-mono text-[#0645ad] font-bold tabular-nums"
          key={currentStep?.step}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          Step {currentStep?.step ?? 0}
        </motion.span>
      </div>

      {/* Target indicator */}
      <div className="flex items-center gap-2 text-[12px] text-[#54595d]">
        <motion.span
          className="inline-block w-2 h-2 rounded-full bg-[#d73333]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        Target: <span className="text-[#0645ad] font-medium">{targetTitle}</span>
      </div>

      {/* Current step as Wikipedia-style reference */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-[#f8f9fa] border border-[#a2a9b1] p-3 wiki-highlight-flash"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#72777d] mb-0.5 font-semibold">
                  Clicked
                </p>
                <p className="text-[13px] font-semibold text-[#0645ad]">
                  {currentStep.selected_link_text}
                </p>
              </div>
              <span className="text-[10px] text-[#72777d] font-mono shrink-0 bg-[#eaecf0] px-1.5 py-0.5 rounded-sm">
                {currentStep.current_title}
              </span>
            </div>
            <p className="text-[11px] text-[#54595d] mt-1.5 leading-relaxed italic">
              &ldquo;{currentStep.reason_summary}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
