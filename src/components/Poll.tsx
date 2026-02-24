"use client";

import { motion } from "framer-motion";
import type { PollOption, PollState } from "@/lib/types";

const OPTIONS: { key: PollOption; label: string; shortLabel: string; emoji: string }[] = [
  { key: "1-3", label: "1\u20133 clicks", shortLabel: "1\u20133", emoji: "\uD83C\uDFAF" },
  { key: "4-6", label: "4\u20136 clicks", shortLabel: "4\u20136", emoji: "\uD83D\uDD25" },
  { key: "7-9", label: "7\u20139 clicks", shortLabel: "7\u20139", emoji: "\uD83D\uDE05" },
  { key: "10+", label: "10+ clicks", shortLabel: "10+", emoji: "\uD83D\uDE2E" }
];

interface PollProps {
  poll: PollState;
  onVote: (option: PollOption) => void;
  showResults: boolean;
  actualSteps?: number;
  compact?: boolean;
}

function getCorrectBucket(steps: number): PollOption {
  if (steps <= 3) return "1-3";
  if (steps <= 6) return "4-6";
  if (steps <= 9) return "7-9";
  return "10+";
}

export function Poll({ poll, onVote, showResults, actualSteps, compact }: PollProps) {
  const hasVoted = !!poll.user_vote;
  const correctBucket = actualSteps !== undefined ? getCorrectBucket(actualSteps) : null;

  return (
    <div className={`w-full ${compact ? "space-y-1" : "space-y-1.5"}`} style={{ fontFamily: "system-ui, sans-serif" }}>
      {OPTIONS.map(({ key, label, shortLabel, emoji }) => {
        const voteCount = poll.votes[key];
        const pct = poll.total_votes > 0 ? (voteCount / poll.total_votes) * 100 : 0;
        const isUserVote = poll.user_vote === key;
        const isCorrect = correctBucket === key;
        const shouldShowBar = hasVoted || showResults;

        return (
          <motion.button
            key={key}
            onClick={() => !hasVoted && !showResults && onVote(key)}
            disabled={hasVoted || showResults}
            className={`
              relative w-full overflow-hidden transition-all text-left
              ${compact ? "h-8" : "h-10"}
              ${!shouldShowBar
                ? "border border-[#a2a9b1] bg-white hover:bg-[#eaecf0] active:bg-[#c8ccd1] cursor-pointer"
                : "border border-[#a2a9b1] bg-white cursor-default"
              }
              ${isUserVote ? "ring-2 ring-[#0645ad] border-[#0645ad]" : ""}
              ${isCorrect && showResults ? "ring-2 ring-[#14866d] border-[#14866d]" : ""}
            `}
            whileTap={!shouldShowBar ? { scale: 0.98 } : undefined}
          >
            {shouldShowBar && (
              <motion.div
                className={`absolute inset-y-0 left-0 ${
                  isCorrect && showResults
                    ? "bg-[#14866d]/15"
                    : isUserVote
                      ? "bg-[#0645ad]/10"
                      : "bg-[#eaecf0]"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
            <div className={`relative z-10 flex items-center justify-between h-full ${compact ? "px-2" : "px-3"}`}>
              <span className={`flex items-center gap-1.5 text-[#202122] ${compact ? "text-[11px]" : "text-[13px]"}`}>
                <span className={compact ? "text-xs" : "text-sm"}>{emoji}</span>
                <span className={isCorrect && showResults ? "font-bold" : "font-normal"}>
                  {compact ? shortLabel : label}
                </span>
              </span>
              {shouldShowBar && (
                <span className={`font-mono tabular-nums ${
                  isCorrect && showResults ? "text-[#14866d] font-bold" : "text-[#54595d]"
                } ${compact ? "text-[9px]" : "text-[11px]"}`}>
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
      {(hasVoted || showResults) && (
        <p className={`text-center text-[#72777d] mt-1 ${compact ? "text-[8px]" : "text-[10px]"}`}>
          {poll.total_votes} vote{poll.total_votes !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
