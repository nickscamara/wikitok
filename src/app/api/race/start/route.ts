import { NextResponse } from "next/server";
import type { WikiCard } from "@/lib/types";
import { createBrowserSession, executeBash } from "@/lib/sandbox-pool";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const card: WikiCard = await request.json();

  try {
    const session = await createBrowserSession();
    const slug = card.start_title.replace(/ /g, "_");
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`;

    await executeBash(session.id, `agent-browser open "${url}"`);

    return NextResponse.json({
      session_id: session.id,
      live_view_url: session.liveViewUrl,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to start race";
    console.error("[race/start]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
