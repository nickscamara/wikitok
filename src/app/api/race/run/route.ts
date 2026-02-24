import { anthropic } from "@ai-sdk/anthropic";
import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { executeBash, closeBrowserSession } from "@/lib/sandbox-pool";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_TOOL_OUTPUT = 8000;

function truncateOutput(text: string): string {
  if (text.length <= MAX_TOOL_OUTPUT) return text;
  return text.slice(0, MAX_TOOL_OUTPUT) + "\n\n... (truncated, use scroll down + snapshot -i to see more)";
}

export async function POST(request: Request) {
  const { session_id, start_title, target_title, max_steps, card_id } =
    await request.json();

  const SYSTEM_PROMPT = `You are a Wikipedia Race agent. Navigate from "${start_title}" to "${target_title}" by clicking Wikipedia links.

RULES:
- You are on "${start_title}". ONLY click internal /wiki/ links.
- No search bar, no URL typing, no back button.
- Max ${max_steps} clicks. Loops = lose.

CRITICAL: Always use "agent-browser snapshot -i" (interactive only). NEVER use "agent-browser snapshot" without -i. The full page is too large. The -i flag shows only clickable links which is all you need.

WORKFLOW — repeat for each step:
1. "agent-browser snapshot -i" → see clickable links with @refs
2. Find the link closest to "${target_title}" and click it with "agent-browser click @ref"
3. Call report_step with what you clicked and why
4. If page title = "${target_title}", set success=true and STOP

Be direct. Pick the most obvious connection. Don't overthink it.`;

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: unknown) =>
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)).catch(() => {});

  (async () => {
    try {
      const result = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: SYSTEM_PROMPT,
        prompt: `Begin! Take a snapshot of the interactive elements on the current page.`,
        tools: {
          browser: tool({
            description: `Run an agent-browser CLI command. ALWAYS use "snapshot -i" (never bare "snapshot").
Available:
- agent-browser snapshot -i    Links and interactive elements only (ALWAYS use this)
- agent-browser click @ref     Click element by ref
- agent-browser scroll down    Scroll to see more links
- agent-browser get title      Get page title`,
            inputSchema: z.object({
              command: z.string().describe("agent-browser command, e.g. 'agent-browser snapshot -i'"),
            }),
            execute: async ({ command }) => {
              const sanitized = command.replace(/\bsnapshot\b(?!\s+-i)/g, "snapshot -i");
              const res = await executeBash(session_id, sanitized);
              await send({ type: "browser", command: sanitized, result: res.result?.slice(0, 200) });
              const output = res.error
                ? { error: res.error }
                : { result: truncateOutput(res.result || "(no output)") };
              return output;
            },
          }),
          report_step: tool({
            description: `Log navigation progress after each click. Set success=true when page title matches target.`,
            inputSchema: z.object({
              step_number: z.number().describe("Step (1-based)"),
              current_title: z.string().describe("Page you are on now"),
              selected_link: z.string().describe("Link text you clicked"),
              reason: z.string().describe("Why this link"),
              success: z.boolean().describe("true if on the target page"),
            }),
            execute: async ({ step_number, current_title, selected_link, reason, success }) => {
              const step = { step_number, current_title, selected_link, reason, success, target: target_title, card_id };
              await send({ type: "step", step });
              return { ok: true, success };
            },
          }),
        },
        stopWhen: stepCountIs(max_steps * 3),
        onStepFinish: async ({ toolResults }) => {
          for (const tr of toolResults) {
            if ("toolName" in tr && tr.toolName === "report_step" && "result" in tr) {
              const r = tr.result as { success?: boolean };
              if (r?.success) {
                await send({ type: "done", success: true });
              }
            }
          }
        },
      });

      const hasSuccess = result.steps.some((step) =>
        step.toolResults.some((tr) => {
          if ("toolName" in tr && tr.toolName === "report_step" && "result" in tr) {
            return (tr.result as { success?: boolean })?.success;
          }
          return false;
        })
      );
      if (!hasSuccess) {
        await send({ type: "done", success: false });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Race failed";
      console.error("[race/run] error:", msg);
      await send({ type: "error", error: msg });
    } finally {
      closeBrowserSession(session_id).catch(() => {});
      try { await writer.close(); } catch { /* already closed */ }
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
