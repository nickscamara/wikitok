"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentAction } from "@/lib/types";

interface AgentTerminalProps {
  actions: AgentAction[];
}

function toFirecrawlCommand(command: string): string {
  return command.replace(/^agent-browser\s*/, "firecrawl browser ");
}

function formatCommand(command: string): JSX.Element {
  const display = toFirecrawlCommand(command);
  const parts = display.split(" ");
  return (
    <span className="break-all">
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          return <span key={i} className="text-[#b58900]">{part}{" "}</span>;
        }
        if (part === "firecrawl") {
          return <span key={i} className="text-[#cb4b16]">{part}{" "}</span>;
        }
        if (part === "browser") {
          return <span key={i} className="text-[#6c71c4]">{part}{" "}</span>;
        }
        if (["click", "snapshot", "scroll", "get", "open"].includes(part)) {
          return <span key={i} className="text-[#268bd2]">{part}{" "}</span>;
        }
        if (part === "-i") {
          return <span key={i} className="text-[#2aa198]">{part}{" "}</span>;
        }
        return <span key={i} className="text-[#93a1a1]">{part}{" "}</span>;
      })}
    </span>
  );
}

function TypingText({ text }: { text: string }) {
  const display = toFirecrawlCommand(text);
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(display.slice(0, indexRef.current));
      if (indexRef.current >= display.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [display]);

  return <span className="text-[#93a1a1]">{displayed}</span>;
}

export function AgentTerminal({ actions }: AgentTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [commandCount, setCommandCount] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setCommandCount(actions.length);
  }, [actions.length]);

  if (actions.length === 0) {
    return (
      <div className="w-full h-20 bg-[#002b36] border border-[#a2a9b1] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 shimmer opacity-30" />
        <motion.div
          className="flex items-center gap-2 text-[#586e75] z-10"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="font-mono text-[11px]">Initializing agent...</span>
          <motion.span
            className="inline-block w-1.5 h-3 bg-[#859900]"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#002b36] border border-[#a2a9b1] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1 bg-[#073642] border-b border-[#586e75]/30"
           style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[9px] font-mono text-[#586e75] uppercase tracking-wider">
          firecrawl browser
        </span>
        <div className="ml-auto flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1 px-1.5 py-0.5"
            key={commandCount}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
          >
            <span className="text-[8px] font-mono text-[#586e75]">
              {commandCount} cmd{commandCount !== 1 ? "s" : ""}
            </span>
          </motion.div>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#859900]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="px-3 py-2 max-h-28 overflow-y-auto scrollbar-hide font-mono text-[11px] leading-relaxed"
      >
        <AnimatePresence mode="popLayout">
          {actions.map((action, i) => (
            <motion.div
              key={action.timestamp + i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-1.5"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[#859900] shrink-0 select-none">$</span>
                {i === actions.length - 1 ? (
                  <TypingText text={action.command} />
                ) : (
                  formatCommand(action.command)
                )}
              </div>
              {action.result_preview && (
                <motion.div
                  className="text-[#586e75] pl-4 truncate text-[10px] mt-0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {action.result_preview}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex items-center gap-1.5">
          <span className="text-[#859900] select-none">$</span>
          <motion.span
            className="inline-block w-1.5 h-3.5 bg-[#839496]"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}
