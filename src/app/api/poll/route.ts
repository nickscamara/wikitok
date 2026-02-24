import { NextResponse } from "next/server";
import type { PollOption, PollState } from "@/lib/types";

const pollStore = new Map<string, PollState>();

export async function POST(request: Request) {
  const { card_id, vote } = (await request.json()) as {
    card_id: string;
    vote: PollOption;
  };

  let poll = pollStore.get(card_id);
  if (!poll) {
    poll = {
      card_id,
      votes: { "1-3": 0, "4-6": 0, "7-9": 0, "10+": 0 },
      total_votes: 0,
    };
    pollStore.set(card_id, poll);
  }

  poll.votes[vote]++;
  poll.total_votes++;

  return NextResponse.json(poll);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const card_id = searchParams.get("card_id");
  if (!card_id) {
    return NextResponse.json({ error: "card_id required" }, { status: 400 });
  }

  const poll = pollStore.get(card_id) || {
    card_id,
    votes: { "1-3": 0, "4-6": 0, "7-9": 0, "10+": 0 },
    total_votes: 0,
  };

  return NextResponse.json(poll);
}
