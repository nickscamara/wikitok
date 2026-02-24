"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardState, PollOption } from "@/lib/types";
import { useFeedStore } from "@/store/feed-store";
import { Poll } from "./Poll";
import { StepOverlay } from "./StepOverlay";
import { BrowserViewport } from "./BrowserViewport";
import { AgentTerminal } from "./AgentTerminal";
import { ResultView } from "./ResultView";

interface FeedCardProps {
  cardState: CardState;
  isActive: boolean;
  index: number;
}

export function FeedCard({ cardState, isActive, index }: FeedCardProps) {
  const { vote, startRace } = useFeedStore();
  const hasStarted = useRef(false);

  const handleVote = useCallback(
    (option: PollOption) => vote(cardState.card.card_id, option),
    [vote, cardState.card.card_id]
  );

  useEffect(() => {
    if (isActive && !hasStarted.current && cardState.phase === "prediction") {
      hasStarted.current = true;
      startRace(cardState.card.card_id);
    }
  }, [isActive, cardState.phase, cardState.card.card_id, startRace]);

  const { card, phase, poll, run, current_step, live_view_url, agent_actions } = cardState;
  const isRunning = phase === "running";
  const showResult = phase === "result" && !!run;

  return (
    <div className="relative w-full h-full snap-start snap-always flex flex-col bg-white overflow-visible">
      {/* Prediction poll — sits in the right whitespace (only for active card to avoid stacking) */}
      {isActive && !showResult && !poll.user_vote && (
        <div
          className="fixed z-50 hidden lg:block w-[220px]"
          style={{
            top: "50%",
            right: "calc((100vw - 512px) / 4 - 110px)",
            marginTop: "-140px",
          }}
        >
          <div className="border border-[#a2a9b1] bg-[#f8f9fa] shadow-sm">
            <div className="bg-[#0645ad]/10 border-b border-[#a2a9b1] px-3 py-2 text-center">
              <span className="font-bold text-sm text-[#202122]"
                    style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                Prediction
              </span>
            </div>
            <div className="p-3">
              <p className="text-[12px] text-[#54595d] mb-3 leading-snug" style={{ fontFamily: "system-ui, sans-serif" }}>
                How many clicks will the AI take?
              </p>
              <Poll poll={poll} onVote={handleVote} showResults={false} />
            </div>
          </div>
        </div>
      )}

      {/* Wikipedia-style top bar */}
      <div className="shrink-0 border-b border-[#a7d7f9] bg-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Wikipedia globe mini */}
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#54595d] opacity-70">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" strokeWidth="1"/>
              <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="0.75"/>
              <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.75"/>
            </svg>
            <span className="text-xs text-[#54595d]" style={{ fontFamily: "system-ui, sans-serif" }}>
              WikiTok
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isRunning && (
              <motion.div
                className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#fee7e6] border border-[#d73333]/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#d73333]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[9px] font-bold text-[#d73333] uppercase" style={{ fontFamily: "system-ui, sans-serif" }}>
                  Live
                </span>
              </motion.div>
            )}
            <span className="text-[10px] text-[#72777d]" style={{ fontFamily: "system-ui, sans-serif" }}>
              Race #{index + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="flex-1 flex flex-col px-4 py-3 overflow-y-auto bg-white">
        {/* Wikipedia-style article title */}
        <motion.div
          className="mb-3 shrink-0"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-[22px] font-normal text-[#202122] leading-tight wiki-heading mb-2"
              style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
            Wikipedia Race
          </h1>
          <p className="text-[13px] text-[#202122] leading-relaxed">
            From <motion.span
              className="text-[#0645ad] font-semibold cursor-pointer hover:underline"
              whileHover={{ textDecoration: "underline" }}
            >{card.start_title}</motion.span>
            {" "}to{" "}
            <motion.span
              className="text-[#0645ad] font-semibold cursor-pointer hover:underline"
              whileHover={{ textDecoration: "underline" }}
            >{card.target_title}</motion.span>,
            {" "}an AI agent navigates through hyperlinks to reach the target article.
          </p>
        </motion.div>

        {/* Infobox - Start/Target */}
        <motion.div
          className="float-none mb-3 shrink-0 border border-[#a2a9b1] bg-[#f8f9fa] text-[13px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-[#0645ad]/10 border-b border-[#a2a9b1] px-3 py-1.5 text-center">
            <span className="font-bold text-[#202122] text-sm"
                  style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
              Race Parameters
            </span>
          </div>
          <table className="w-full text-[12px]" style={{ fontFamily: "system-ui, sans-serif" }}>
            <tbody>
              <tr className="border-b border-[#eaecf0]">
                <td className="px-3 py-1.5 font-semibold text-[#202122] bg-[#eaecf0]/50 w-24 align-top">Start</td>
                <td className="px-3 py-1.5 text-[#0645ad] font-medium">{card.start_title}</td>
              </tr>
              <tr className="border-b border-[#eaecf0]">
                <td className="px-3 py-1.5 font-semibold text-[#202122] bg-[#eaecf0]/50 align-top">Target</td>
                <td className="px-3 py-1.5 text-[#0645ad] font-medium">{card.target_title}</td>
              </tr>
              <tr className="border-b border-[#eaecf0]">
                <td className="px-3 py-1.5 font-semibold text-[#202122] bg-[#eaecf0]/50 align-top">Max steps</td>
                <td className="px-3 py-1.5 text-[#202122]">{card.max_steps}</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-semibold text-[#202122] bg-[#eaecf0]/50 align-top">Status</td>
                <td className="px-3 py-1.5">
                  {phase === "prediction" && <span className="text-[#54595d]">Starting...</span>}
                  {isRunning && (
                    <span className="text-[#14866d] font-semibold">
                      Navigating{run ? ` (step ${run.total_steps})` : "..."}
                    </span>
                  )}
                  {showResult && (
                    <span className={run.success ? "text-[#14866d] font-semibold" : "text-[#d73333] font-semibold"}>
                      {run.success ? `Reached in ${run.total_steps} steps` : `Failed after ${run.total_steps} steps`}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <AnimatePresence mode="wait">
            {showResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
              >
                <ResultView result={run} poll={poll} onVote={handleVote} />
              </motion.div>
            ) : (
              <motion.div
                key="running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col gap-3"
              >
                {/* Live browser — full width now that poll is on the side */}
                <div>
                  <h2 className="text-base font-normal text-[#202122] wiki-heading mb-2"
                      style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
                    Live browser
                  </h2>
                  <BrowserViewport
                    liveViewUrl={live_view_url}
                    currentLink={current_step?.selected_link_text}
                    isRunning={isRunning}
                  />
                </div>

                {/* Inline poll fallback for smaller screens where the side panel is hidden */}
                {!poll.user_vote && (
                  <motion.div
                    layout
                    className="shrink-0 lg:hidden"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-base font-normal text-[#202122] wiki-heading mb-2"
                        style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
                      Predict while watching
                    </h2>
                    <p className="text-[12px] text-[#54595d] mb-2" style={{ fontFamily: "system-ui, sans-serif" }}>
                      How many clicks will the AI take to reach the target?
                    </p>
                    <Poll poll={poll} onVote={handleVote} showResults={false} />
                  </motion.div>
                )}

                {/* Section: Agent terminal */}
                {isRunning && (
                  <div>
                    <h2 className="text-base font-normal text-[#202122] wiki-heading mb-2"
                        style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
                      Firecrawl browser
                    </h2>
                    <AgentTerminal actions={agent_actions} />
                  </div>
                )}

                {/* Section: Navigation steps */}
                {isRunning && run && run.steps.length > 0 && (
                  <div>
                    <h2 className="text-base font-normal text-[#202122] wiki-heading mb-2"
                        style={{ fontFamily: "'Libre Baskerville', 'Linux Libertine', Georgia, serif" }}>
                      Navigation
                    </h2>
                    <StepOverlay
                      currentStep={current_step}
                      steps={run.steps}
                      targetTitle={card.target_title}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swipe hint */}
        <div className="flex items-center justify-center pt-2 shrink-0">
          <motion.div
            className="flex flex-col items-center gap-0.5 text-[#a2a9b1]"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 7L10 13L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
