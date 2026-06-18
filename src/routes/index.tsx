import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  FileText,
  Globe2,
  Leaf,
  LineChart,
  Sparkles,
  TreePine,
  Wind,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoTrack AI — Measure & Reduce Your Carbon Footprint" },
      {
        name: "description",
        content:
          "AI-powered sustainability platform. Assess your carbon footprint, get personalized action plans, and track real-world impact with beautiful dashboards.",
      },
      { property: "og:title", content: "EcoTrack AI — Sustainability, intelligently." },
      {
        property: "og:description",
        content: "Assess your footprint, get personalized AI guidance, and act on what matters.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: BarChart3,
    title: "Carbon Footprint Assessment",
    body: "Six lifestyle categories, smart defaults, and an instant breakdown of your annual emissions.",
  },
  {
    icon: LineChart,
    title: "Live Sustainability Dashboard",
    body: "Visualize your score, progress, and impact split across transport, food, energy, and more.",
  },
  {
    icon: Bot,
    title: "AI Sustainability Assistant",
    body: "Chat with an expert assistant trained on climate science and behavior-change research.",
  },
  {
    icon: Wind,
    title: "Pollution Reduction Guide",
    body: "Personalized weekly action plans calibrated to your highest-impact categories.",
  },
  {
    icon: FileText,
    title: "Shareable Reports",
    body: "Generate a polished monthly sustainability report — perfect for teams, schools, and ESG.",
  },
  {
    icon: Globe2,
    title: "Built for Scale",
    body: "From individuals to enterprises, the same engine powers personal goals and org-wide impact.",
  },
];

const stats = [
  { value: "2.1M", label: "Tonnes CO₂e modeled" },
  { value: "94%", label: "Users reduce within 30 days" },
  { value: "180+", label: "Countries supported" },
  { value: "4.9★", label: "Average rating" },
];

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      {/* Hero */}
      <section className="relative bg-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-leaf" />
                AI-powered sustainability intelligence
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Measure your impact.
                <br />
                <span className="text-gradient">Act on what matters.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                EcoTrack AI turns your daily habits into a clear carbon picture — then guides
                you, week by week, toward a lower-impact life with an AI sustainability coach
                in your pocket.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
                  <Link to="/assessment">
                    Start free assessment <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/dashboard">Explore dashboard</Link>
                </Button>
              </div>
              <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {["No signup required", "Private by default", "Science-based factors", "Beautiful exports"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-leaf" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: "120ms" }}>
              <div className="absolute -inset-6 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
              <div className="relative glass rounded-3xl p-6 shadow-elegant">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Your footprint</div>
                    <div className="mt-1 text-4xl font-bold font-display">3.2<span className="text-base text-muted-foreground"> t CO₂e/yr</span></div>
                  </div>
                  <div className="grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
                    <Leaf className="size-7" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Transportation", pct: 38, icon: Zap },
                    { label: "Food", pct: 24, icon: TreePine },
                    { label: "Energy", pct: 18, icon: Wind },
                    { label: "Shopping", pct: 12, icon: Sparkles },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <r.icon className="size-3.5" /> {r.label}
                        </span>
                        <span className="font-medium">{r.pct}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-primary"
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <Bot className="size-4 text-leaf" /> AI Coach
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    Switching two car trips per week to cycling could cut <b className="text-foreground">~210 kg CO₂e/yr</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-leaf">Platform</div>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Everything you need to live lighter.</h2>
          <p className="mt-3 text-muted-foreground">
            A complete toolkit: science-based assessment, AI guidance, action plans, and
            polished reports — all in one elegant workspace.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="absolute -right-12 -top-12 size-32 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />
              <div className="grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-primary-foreground shadow-elegant sm:p-16">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Your lower-carbon life starts in 2 minutes.</h2>
              <p className="mt-3 max-w-xl text-primary-foreground/90">
                Answer six quick questions. Get a personalized footprint, an AI coach, and a
                weekly action plan tuned to where it counts most for you.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="self-start lg:self-auto">
              <Link to="/assessment">
                Begin assessment <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
