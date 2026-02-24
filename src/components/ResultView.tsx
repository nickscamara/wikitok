"use client";

import { motion } from "framer-motion";
import type { RunResult, PollState, PollOption } from "@/lib/types";
import { Poll } from "./Poll";

interface ResultViewProps {
  result: RunResult;
  poll: PollState;
  onVote: (option: PollOption) => void;
}

export function ResultView({ result, poll, onVote }: ResultViewProps) {
  return (
    <motion.div
      className="w-full space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Result banner - Wikipedia ambox style */}
      <div
        className={`border-l-4 p-3 ${
          result.success
            ? "bg-[#dff0d8] border-l-[#14866d] border border-[#a2a9b1]"
            : "bg-[#fee7e6] border-l-[#d73333] border border-[#a2a9b1]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{result.success ? "\u2714\uFE0F" : "\u274C"}</span>
          <div>
            <p className="text-base font-bold text-[#202122]"
               style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
              {result.success ? "Target reached!" : "Navigation failed"}
            </p>
            <p className={`text-[13px] ${result.success ? "text-[#14866d]" : "text-[#d73333]"}`}
               style={{ fontFamily: "system-ui, sans-serif" }}>
              {result.success
                ? `Completed in ${result.total_steps} step${result.total_steps !== 1 ? "s" : ""}`
                : `Exhausted after ${result.total_steps} steps`}
            </p>
          </div>
        </div>
      </div>

      {/* Path taken - Wikipedia infobox style */}
      {result.path_titles.length > 0 && (
        <div className="border border-[#a2a9b1] bg-[#f8f9fa]">
          <div className="bg-[#0645ad]/10 border-b border-[#a2a9b1] px-3 py-1.5 text-center">
            <span className="font-bold text-[13px] text-[#202122]"
                  style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
              Path taken
            </span>
          </div>
          <div className="px-3 py-2">
            <div className="flex flex-wrap items-center gap-0.5"
                 style={{ fontFamily: "system-ui, sans-serif" }}>
              {result.path_titles.map((title, i) => (
                <span key={`${title}-${i}`} className="flex items-center">
                  <span
                    className={`text-[12px] px-1.5 py-0.5 ${
                      i === 0
                        ? "bg-[#0645ad]/10 text-[#0645ad] font-semibold border border-[#0645ad]/20"
                        : i === result.path_titles.length - 1 && result.success
                          ? "bg-[#14866d]/10 text-[#14866d] font-semibold border border-[#14866d]/20"
                          : "text-[#0645ad] hover:underline"
                    }`}
                  >
                    {title}
                  </span>
                  {i < result.path_titles.length - 1 && (
                    <span className="text-[#a2a9b1] mx-0.5 text-[11px]">&rarr;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Community predictions */}
      <div>
        <h2 className="text-base font-normal text-[#202122] wiki-heading mb-2"
            style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
          Community predictions
        </h2>
        <Poll
          poll={poll}
          onVote={onVote}
          showResults
          actualSteps={result.total_steps}
        />
      </div>

      {/* CTAs */}
      <div className="flex gap-2" style={{ fontFamily: "system-ui, sans-serif" }}>
        <button className="flex-1 h-10 bg-white text-[#0645ad] text-[13px] font-medium border border-[#a2a9b1] hover:bg-[#eaecf0] active:bg-[#c8ccd1] transition-colors">
          Replay
        </button>
        <button className="flex-1 h-10 bg-[#0645ad] text-white text-[13px] font-medium border border-[#0645ad] hover:bg-[#0b0080] transition-colors">
          Share result
        </button>
      </div>

      {/* Wikipedia-style "See also" footer */}
      <div className="border-t border-[#a2a9b1] pt-2">
        <p className="text-[11px] text-[#72777d] text-center" style={{ fontFamily: "system-ui, sans-serif" }}>
          Swipe down for the next race
        </p>
      </div>
    </motion.div>
  );
}
