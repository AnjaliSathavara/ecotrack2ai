// Lovable AI Gateway provider helper (server-only)
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Creates an OpenAI-compatible provider instance pre-configured for the Lovable AI Gateway.
 * This is used server-side to communicate with LLM endpoints through the Lovable Cloud AI proxy.
 *
 * @param {string} apiKey - The Lovable API key used to authorize gateway requests.
 * @returns {object} The configured OpenAI-compatible AI provider.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
