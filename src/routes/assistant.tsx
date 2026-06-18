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

export const Route = createFileRoute("/assistant")({
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
          <div ref={scrollRef} className="overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.length === 0 && (
              <div className="grid place-items-center h-full text-center">
                <div className="max-w-md">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
                    <Sparkles className="size-7" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">Ask me anything about sustainability</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From carbon footprints to climate-friendly recipes, I'm here to help.
                  </p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => submit(s)}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
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
                <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
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
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-2 prose-li:my-0.5">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Thinking…
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
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
          >
            <Textarea
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
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isBusy}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isBusy || !input.trim()}
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 shrink-0"
              aria-label="Send"
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
