"use client";

import { create } from "zustand";
import type {
  WikiCard,
  CardState,
  PollOption,
  StepObject,
  PollState,
  AgentAction,
} from "@/lib/types";

interface FeedStore {
  cards: CardState[];
  activeIndex: number;
  loading: boolean;

  setActiveIndex: (index: number) => void;
  fetchCards: (count?: number) => Promise<void>;
  vote: (cardId: string, option: PollOption) => Promise<void>;
  startRace: (cardId: string) => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  cards: [],
  activeIndex: 0,
  loading: false,

  setActiveIndex: (index) => set({ activeIndex: index }),

  fetchCards: async (count = 5) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const res = await fetch(`/api/cards?count=${count}`);
      const data = await res.json();
      const newCards: CardState[] = data.cards.map((card: WikiCard) => ({
        card,
        phase: "prediction" as const,
        poll: {
          card_id: card.card_id,
          votes: { "1-3": 0, "4-6": 0, "7-9": 0, "10+": 0 },
          total_votes: 0,
        },
        agent_actions: [],
      }));
      set((state) => ({
        cards: [...state.cards, ...newCards],
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  vote: async (cardId, option) => {
    const cardState = get().cards.find((c) => c.card.card_id === cardId);
    if (!cardState || cardState.poll.user_vote) return;

    set((state) => ({
      cards: state.cards.map((c) =>
        c.card.card_id === cardId
          ? {
              ...c,
              poll: {
                ...c.poll,
                user_vote: option,
                votes: { ...c.poll.votes, [option]: c.poll.votes[option] + 1 },
                total_votes: c.poll.total_votes + 1,
              },
            }
          : c
      ),
    }));

    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId, vote: option }),
      });
      const poll: PollState = await res.json();
      set((state) => ({
        cards: state.cards.map((c) =>
          c.card.card_id === cardId
            ? { ...c, poll: { ...poll, user_vote: option } }
            : c
        ),
      }));
    } catch {
      // keep optimistic
    }
  },

  startRace: (cardId) => {
    const cardState = get().cards.find((c) => c.card.card_id === cardId);
    if (!cardState || cardState.phase !== "prediction") return;

    set((state) => ({
      cards: state.cards.map((c) =>
        c.card.card_id === cardId
          ? { ...c, phase: "running" as const }
          : c
      ),
    }));

    const updateCard = (updater: (c: CardState) => CardState) => {
      set((state) => ({
        cards: state.cards.map((c) =>
          c.card.card_id === cardId ? updater(c) : c
        ),
      }));
    };

    const card = cardState.card;

    (async () => {
      try {
        const startRes = await fetch("/api/race/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });
        if (!startRes.ok) {
          console.error("[feed] Start failed:", startRes.status);
          updateCard((c) => ({
            ...c,
            phase: "result",
            run: { card_id: cardId, success: false, steps: [], path_titles: [], total_steps: 0 },
          }));
          return;
        }

        const { session_id, live_view_url } = await startRes.json();
        updateCard((c) => ({ ...c, session_id, live_view_url }));

        const runRes = await fetch("/api/race/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id,
            start_title: card.start_title,
            target_title: card.target_title,
            max_steps: card.max_steps,
            card_id: cardId,
          }),
        });

        if (!runRes.ok || !runRes.body) {
          console.error("[feed] Run failed:", runRes.status);
          updateCard((c) => ({
            ...c,
            phase: "result",
            run: { card_id: cardId, success: false, steps: [], path_titles: [], total_steps: 0 },
          }));
          return;
        }

        const reader = runRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const steps: StepObject[] = [];
        let raceSuccess = false;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            const dataLine = chunk.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            try {
              const payload = JSON.parse(dataLine.slice(5).trim());

              if (payload.type === "browser") {
                const action: AgentAction = {
                  command: payload.command,
                  result_preview: payload.result,
                  timestamp: Date.now(),
                };
                updateCard((c) => ({
                  ...c,
                  agent_actions: [...c.agent_actions, action].slice(-20),
                }));
              }

              if (payload.type === "step") {
                const s = payload.step;
                const step: StepObject = {
                  step: s.step_number,
                  current_title: s.current_title,
                  target_title: s.target,
                  selected_link_text: s.selected_link,
                  reason_summary: s.reason,
                };
                steps.push(step);
                if (s.success) raceSuccess = true;

                updateCard((c) => ({
                  ...c,
                  current_step: step,
                  run: {
                    card_id: cardId,
                    success: raceSuccess,
                    steps: [...steps],
                    path_titles: [card.start_title, ...steps.map((st) => st.selected_link_text)],
                    total_steps: steps.length,
                  },
                }));
              }

              if (payload.type === "done") {
                raceSuccess = payload.success;
              }

              if (payload.type === "error") {
                console.error("[feed] Race error:", payload.error);
              }
            } catch {
              // skip malformed
            }
          }
        }

        const pathTitles = [card.start_title, ...steps.map((s) => s.selected_link_text)];
        updateCard((c) => ({
          ...c,
          phase: "result",
          run: {
            card_id: cardId,
            success: raceSuccess,
            steps,
            path_titles: pathTitles,
            total_steps: steps.length,
          },
        }));
      } catch (err) {
        console.error("[feed] Race error:", err);
        updateCard((c) => ({
          ...c,
          phase: "result",
          run: { card_id: cardId, success: false, steps: [], path_titles: [], total_steps: 0 },
        }));
      }
    })();
  },
}));
