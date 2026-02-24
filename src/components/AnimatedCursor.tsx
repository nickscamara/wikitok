"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CursorPosition {
  x: number;
  y: number;
}

interface AnimatedCursorProps {
  isActive: boolean;
  clickedLink?: string;
}

const CLICK_PHRASES = [
  "Hmm, this one...",
  "This looks promising",
  "Let me try this link",
  "Connecting the dots...",
  "Getting warmer!",
  "I see the path",
  "Almost there...",
  "Following the trail",
  "This should work",
  "Interesting connection...",
];

export function AnimatedCursor({ isActive, clickedLink }: AnimatedCursorProps) {
  const [pos, setPos] = useState<CursorPosition>({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [thought, setThought] = useState<string | null>(null);
  const prevLink = useRef(clickedLink);

  useEffect(() => {
    if (!isActive) return;

    const wanderInterval = setInterval(() => {
      const targetX = 15 + Math.random() * 70;
      const targetY = 20 + Math.random() * 60;
      setPos((prev) => ({
        x: prev.x + (targetX - prev.x) * 0.25,
        y: prev.y + (targetY - prev.y) * 0.25,
      }));
    }, 900);

    return () => clearInterval(wanderInterval);
  }, [isActive]);

  useEffect(() => {
    if (clickedLink && clickedLink !== prevLink.current) {
      prevLink.current = clickedLink;

      const randomX = 20 + Math.random() * 60;
      const randomY = 25 + Math.random() * 50;
      setPos({ x: randomX, y: randomY });

      setTimeout(() => {
        setIsClicking(true);
        setShowRipple(true);
        setThought(CLICK_PHRASES[Math.floor(Math.random() * CLICK_PHRASES.length)]);

        setTimeout(() => setIsClicking(false), 150);
        setTimeout(() => setShowRipple(false), 600);
        setTimeout(() => setThought(null), 2200);
      }, 250);
    }
  }, [clickedLink]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <motion.div
        className="absolute"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        animate={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 18,
          mass: 0.6,
        }}
      >
        {/* Classic cursor SVG - dark for light Wikipedia bg */}
        <svg
          width="18"
          height="22"
          viewBox="0 0 20 24"
          fill="none"
          className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          style={{ transform: "translate(-2px, -2px)" }}
        >
          <path
            d="M2 2L2 18L6.5 13.5L11 21L14 19.5L9.5 12L16 11L2 2Z"
            fill="#202122"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute top-0 left-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0645ad]/50"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {thought && (
            <motion.div
              className="absolute left-5 -top-1 whitespace-nowrap bg-white text-[#202122] text-[10px] px-2 py-1 rounded border border-[#a2a9b1] shadow-sm"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
              initial={{ opacity: 0, x: -4, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 4, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[#0645ad] font-medium">{thought}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
