# WikiTok

A TikTok-style feed where AI agents race through Wikipedia live in a browser. Watch an AI navigate from one article to another by clicking hyperlinks, predict how many clicks it'll take, and see the results.

Built with [Firecrawl](https://firecrawl.dev) Browser Sandboxes, Claude Sonnet, and Next.js.

![Firecrawl](https://img.shields.io/badge/Firecrawl-Browser%20Sandbox-orange) ![Claude](https://img.shields.io/badge/Claude-Sonnet%204-blueviolet) ![Wikipedia Race UI](https://img.shields.io/badge/Next.js-16-black) 

## How it works

1. **Feed loads** — random Wikipedia start/target pairs are generated
2. **You predict** — guess how many clicks the AI will need (1–3, 4–6, 7–9, 10+)
3. **AI races live** — a Firecrawl browser sandbox opens the start page, and Claude navigates link-by-link toward the target
4. **Watch it happen** — the live browser viewport, agent terminal commands, and navigation steps update in real time via SSE
5. **Results** — see if the AI made it, how your prediction stacked up, and the full path taken



## Firecrawl Browser Sandbox

The core of WikiTok is the [Firecrawl Browser Sandbox API](https://docs.firecrawl.dev/features/browser) — a remote, sandboxed Chromium instance that the AI agent controls in real time.

### Session lifecycle

```
POST /v2/browser              → Create session (returns session_id + liveViewUrl)
POST /v2/browser/:id/execute  → Run bash commands (agent-browser CLI)
DELETE /v2/browser/:id        → Destroy session
```

### What happens during a race

```typescript
// 1. Create a sandboxed browser
const session = await createBrowserSession();
// → { id: "019c...", liveViewUrl: "https://..." }

// 2. Open the starting Wikipedia page
await executeBash(session.id, `agent-browser open "https://en.wikipedia.org/wiki/Dinosaur"`);

// 3. Claude takes over — snapshot, click, repeat
// The AI uses these commands inside the sandbox:
//   agent-browser snapshot -i   → get interactive elements (@refs)
//   agent-browser click @ref    → click a Wikipedia link
//   agent-browser scroll down   → scroll to find more links
//   agent-browser get title     → check current page title

// 4. Each step streams back to the client via SSE
// 5. Session auto-closes after the race (or TTL expiry)
```

### Live viewport

The `liveViewUrl` returned by Firecrawl is embedded as an `<iframe>` in the `BrowserViewport` component. Users see the actual browser navigating Wikipedia in real time — no screenshots or recordings, it's a live stream of the sandboxed Chromium.

### Why Firecrawl sandboxes

- **Isolated** — each race gets its own browser, no cross-contamination
- **Live streaming** — `liveViewUrl` provides a real-time viewport, no polling needed
- **CLI-driven** — `agent-browser` commands make it easy for Claude to interact via tool use
- **Auto-cleanup** — TTL and activity timeouts handle session teardown

## Setup

```bash
git clone https://github.com/nicholasgcamara/wikitok.git
cd wikitok
npm install
```

Create a `.env` file:

```env
FIRECRAWL_API_KEY=fc-...        # https://firecrawl.dev
ANTHROPIC_API_KEY=sk-ant-...    # https://console.anthropic.com
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js App (React 19 + Tailwind v4)       │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │  Feed (snap  │  │  Zustand Store        │  │
│  │  scroll)     │──│  cards, polls, races  │  │
│  │  FeedCard    │  │  SSE stream parsing   │  │
│  └─────────────┘  └──────────────────────┘  │
│         │                    │               │
│  ┌──────┴──────┐  ┌─────────┴────────────┐  │
│  │ Components  │  │  API Routes           │  │
│  │ Browser     │  │  /api/race/start      │  │
│  │ Viewport    │  │  /api/race/run (SSE)  │  │
│  │ Terminal    │  │  /api/cards            │  │
│  │ Poll        │  │  /api/poll             │  │
│  │ StepOverlay │  └─────────┬────────────┘  │
│  └─────────────┘            │               │
└─────────────────────────────┼───────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         │          Firecrawl Browser Sandbox       │
         │  ┌─────────────────────────────────────┐ │
         │  │  Remote Chromium instance            │ │
         │  │  • Live viewport via liveViewUrl     │ │
         │  │  • Bash execution (agent-browser CLI)│ │
         │  │  • 300s TTL, 120s activity timeout   │ │
         │  └─────────────────────────────────────┘ │
         │                    │                     │
         │  ┌─────────────────┴───────────────────┐ │
         │  │  Claude Sonnet 4 (AI SDK)            │ │
         │  │  • System prompt: navigate A → B     │ │
         │  │  • Tools: browser (snapshot/click),  │ │
         │  │    report_step (log progress)         │ │
         │  │  • Streams steps via SSE to client   │ │
         │  └─────────────────────────────────────┘ │
         └─────────────────────────────────────────┘
```

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| State | Zustand |
| AI | Vercel AI SDK + Claude Sonnet 4 |
| Browser | Firecrawl Browser Sandbox API |
| Streaming | Server-Sent Events (SSE) |
| Styling | Wikipedia-inspired design system |

## License

MIT
