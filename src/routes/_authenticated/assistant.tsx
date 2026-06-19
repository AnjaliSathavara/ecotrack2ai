import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { computeFootprint, loadAssessment } from "@/lib/assessment";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Sustainability Assistant — EcoTrack AI" },
      { name: "description", content: "Chat with an AI sustainability coach. Get personalized, science-based environmental guidance." },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "What are my top 3 highest-impact changes?",
  "How can I cut transport emissions this month?",
  "Is plant-based eating really better for the planet?",
  "Build me a 1-week sustainability challenge.",
];

function AssistantPage() {
  const { user } = useAuth();
  const assessment = useMemo(() => loadAssessment(), []);
  const footprint = useMemo(() => (assessment ? computeFootprint(assessment) : null), [assessment]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { context: assessment ? { assessment, footprint } : null },
      }),
    [assessment, footprint],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    onError: (e) => toast.error("Assistant error", { description: e.message }),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const savedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Persist completed messages
  useEffect(() => {
    if (!user || status !== "ready" || messages.length === 0) return;
    const toSave = messages.filter((m) => !savedIdsRef.current.has(m.id));
    if (toSave.length === 0) return;

    const persist = async () => {
      if (!conversationIdRef.current) {
        const firstUser = messages.find((m) => m.role === "user");
        const text = firstUser
          ? firstUser.parts.map((p) => (p.type === "text" ? p.text : "")).join("").slice(0, 80)
          : "New conversation";
        const { data: conv, error: cErr } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title: text || "New conversation" })
          .select("id")
          .single();
        if (cErr || !conv) return;
        conversationIdRef.current = conv.id;
      }
      const rows = toSave.map((m) => ({
        conversation_id: conversationIdRef.current!,
        user_id: user.id,
        role: m.role === "assistant" ? "assistant" : m.role === "user" ? "user" : "system",
        content: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
      }));
      const { error: mErr } = await supabase.from("chat_messages").insert(rows);
      if (!mErr) toSave.forEach((m) => savedIdsRef.current.add(m.id));
    };
    persist();
  }, [messages, status, user]);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = async (text: string) => {
    const t = text.trim();
    if (!t || isBusy) return;
    setInput("");
    await sendMessage({ text: t });
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Bot className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">AI Sustainability Assistant</h1>
            <p className="text-sm text-muted-foreground">
              {assessment
                ? "Personalized to your latest assessment."
                : "Tip: complete the assessment for personalized answers."}
            </p>
          </div>
        </div>

        <Card className="grid grid-rows-[1fr_auto] h-[68vh] overflow-hidden shadow-soft">
          <div
            ref={scrollRef}
            className="overflow-y-auto p-4 sm:p-6 space-y-5"
            role="log"
            aria-label="Conversation with AI sustainability assistant"
            aria-live="polite"
            aria-relevant="additions text"
            aria-atomic="false"
            tabIndex={0}
          >
            {messages.length === 0 && (
              <div className="grid place-items-center h-full text-center">
                <div className="max-w-md">
                  <div
                    className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant"
                    aria-hidden="true"
                  >
                    <Sparkles className="size-7" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">Ask me anything about sustainability</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From carbon footprints to climate-friendly recipes, I'm here to help.
                  </p>
                  <div
                    className="mt-6 grid gap-2 sm:grid-cols-2"
                    role="group"
                    aria-label="Suggested prompts"
                  >
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => submit(s)}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m: UIMessage) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              return (
                <article
                  key={m.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  aria-label={isUser ? "You said" : "Assistant said"}
                >
                  {!isUser && (
                    <div
                      className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground"
                      aria-hidden="true"
                    >
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={
                      isUser
                        ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-soft"
                        : "max-w-[80%] text-foreground"
                    }
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap text-sm">{text}</div>
                    ) : (
                      <div className="text-sm leading-relaxed [&>p]:my-2 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&_li]:my-1 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&>h1]:mt-3 [&>h1]:text-base [&>h1]:font-semibold [&>h2]:mt-3 [&>h2]:text-base [&>h2]:font-semibold [&>h3]:mt-3 [&>h3]:font-semibold">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div
                      className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <User className="size-4" />
                    </div>
                  )}
                </article>
              );
            })}

            <div role="status" aria-live="polite" className="sr-only">
              {status === "submitted"
                ? "Assistant is thinking"
                : status === "streaming"
                  ? "Assistant is replying"
                  : ""}
            </div>
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-hidden="true">
                <Loader2 className="size-4 animate-spin" /> Thinking…
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error.message}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="border-t border-border p-3 sm:p-4 flex items-end gap-2 bg-card"
            aria-label="Send a message to the assistant"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Message the AI sustainability assistant
            </label>
            <Textarea
              id="assistant-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="Ask about your footprint, sustainable swaps, climate science…"
              rows={1}
              className="min-h-[44px] max-h-32 resize-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isBusy}
              aria-describedby="assistant-input-help"
            />
            <span id="assistant-input-help" className="sr-only">
              Press Enter to send, Shift plus Enter for a new line.
            </span>
            <Button
              type="submit"
              size="icon"
              disabled={isBusy || !input.trim()}
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 shrink-0 min-h-11 min-w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={isBusy ? "Sending message" : "Send message"}
            >
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </Button>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
