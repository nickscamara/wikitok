"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFeedStore } from "@/store/feed-store";
import { FeedCard } from "./FeedCard";

export function Feed() {
  const { cards, activeIndex, setActiveIndex, fetchCards, loading } =
    useFeedStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (cards.length === 0) fetchCards(6);
  }, [cards.length, fetchCards]);

  useEffect(() => {
    if (activeIndex >= cards.length - 3 && !loading && cards.length > 0) {
      fetchCards(4);
    }
  }, [activeIndex, cards.length, loading, fetchCards]);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(index, el);
      } else {
        cardRefs.current.delete(index);
      }
    },
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    for (const [, el] of cardRefs.current) {
      observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [cards.length, setActiveIndex]);

  useEffect(() => {
    if (!observerRef.current) return;
    for (const [, el] of cardRefs.current) {
      observerRef.current.observe(el);
    }
  }, [cards.length]);

  if (cards.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-[#0645ad] border-r-[#0645ad]/40 border-b-[#0645ad]/10 border-l-[#0645ad]/5 animate-spin" />
          <p className="text-sm text-[#54595d]" style={{ fontFamily: "system-ui, sans-serif" }}>
            Loading WikiTok...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-[#f8f9fa]"
    >
      {cards.map((cardState, i) => (
        <div
          key={cardState.card.card_id}
          ref={setCardRef(i)}
          data-index={i}
          className="h-dvh w-full"
        >
          <FeedCard
            cardState={cardState}
            isActive={activeIndex === i}
            index={i}
          />
        </div>
      ))}
      {loading && (
        <div className="h-20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-t-[#0645ad] border-r-[#0645ad]/30 border-b-transparent border-l-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
