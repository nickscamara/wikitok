const FIRECRAWL_API = "https://api.firecrawl.dev/v2";

function getApiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");
  return key;
}

export interface BrowserSession {
  id: string;
  liveViewUrl: string;
}

export async function createBrowserSession(): Promise<BrowserSession> {
  const res = await fetch(`${FIRECRAWL_API}/browser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ ttl: 300, activityTtl: 120 }),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json();
  if (!data.success || !data.id) {
    throw new Error(data.error ?? "Failed to create browser session");
  }
  return { id: data.id, liveViewUrl: data.liveViewUrl ?? "" };
}

export async function executeBash(
  sessionId: string,
  code: string
): Promise<{ result?: string; error?: string }> {
  const res = await fetch(`${FIRECRAWL_API}/browser/${sessionId}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ code, language: "bash", timeout: 30 }),
    signal: AbortSignal.timeout(35_000),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };
  if (!data.success) return { error: "Execution failed" };
  const output = (data.stdout || data.result || "").trim();
  return { result: output || "(no output)" };
}

export async function closeBrowserSession(sessionId: string): Promise<void> {
  await fetch(`${FIRECRAWL_API}/browser/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => {});
}
