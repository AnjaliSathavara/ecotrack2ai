import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown; context?: unknown };

const SYSTEM = `You are EcoTrack AI, an expert sustainability assistant.
You give clear, actionable, evidence-informed guidance on reducing personal and organizational
carbon footprints, eco-friendly lifestyles, climate science, and pollution reduction.

Style:
- Warm, encouraging, never preachy.
- Concrete, measurable suggestions (use kg CO2e / year when relevant).
- Prefer short paragraphs and tight bullet lists.
- When the user shares assessment data, personalize advice to their highest-impact categories.
- Cite typical impact figures only when confident; otherwise mark as approximate.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, context } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system = context
          ? `${SYSTEM}\n\nUser assessment context (JSON):\n${JSON.stringify(context)}`
          : SYSTEM;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
