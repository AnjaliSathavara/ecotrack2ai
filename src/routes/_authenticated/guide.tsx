import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bike,
  Bus,
  Droplets,
  Leaf,
  Lightbulb,
  Recycle,
  ShoppingBag,
  Sprout,
  TreePine,
  Utensils,
  Wind,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/guide")({
  head: () => ({
    meta: [
      { title: "Pollution Reduction Guide — EcoTrack AI" },
      { name: "description", content: "Practical, AI-curated actions to reduce pollution and live more sustainably — with weekly action plans." },
    ],
  }),
  component: GuidePage,
});

const ACTIONS = [
  {
    icon: Bike,
    category: "Transport",
    title: "Swap two car trips per week",
    impact: "~210 kg CO₂e/yr",
    body: "Cycle or walk short errands under 5 km. Combine with one weekly remote-work day for compounding gains.",
  },
  {
    icon: Bus,
    category: "Transport",
    title: "Take transit for your commute",
    impact: "~750 kg CO₂e/yr",
    body: "Replacing a 15 km car commute with bus or rail typically cuts emissions per km by 70%+.",
  },
  {
    icon: Utensils,
    category: "Food",
    title: "Two plant-based days/week",
    impact: "~300 kg CO₂e/yr",
    body: "Beans, lentils, and tofu deliver protein at a fraction of the footprint of beef or lamb.",
  },
  {
    icon: Sprout,
    category: "Food",
    title: "Buy local & seasonal",
    impact: "~120 kg CO₂e/yr",
    body: "Short supply chains use less refrigeration, packaging, and freight emissions.",
  },
  {
    icon: Lightbulb,
    category: "Energy",
    title: "Switch to LED + smart thermostat",
    impact: "~250 kg CO₂e/yr",
    body: "LEDs use 75% less energy; a smart thermostat trims heating/cooling 8–12%.",
  },
  {
    icon: Zap,
    category: "Energy",
    title: "Sign up for a green tariff",
    impact: "~900 kg CO₂e/yr",
    body: "Many regions offer 100%-renewable electricity for a few dollars more per month.",
  },
  {
    icon: ShoppingBag,
    category: "Shopping",
    title: "30-day pause on impulse buys",
    impact: "~200 kg CO₂e/yr",
    body: "Wishlist non-essentials for 30 days. Most urges fade — and your wallet thanks you.",
  },
  {
    icon: Recycle,
    category: "Waste",
    title: "Compost food scraps",
    impact: "~120 kg CO₂e/yr",
    body: "Landfilled food produces methane. Composting at home or via municipal pickup avoids it.",
  },
  {
    icon: Droplets,
    category: "Water",
    title: "Cut shower time by 2 minutes",
    impact: "~140 kg CO₂e/yr",
    body: "Less hot water = less energy. A low-flow head doubles the savings.",
  },
];

const WEEK = [
  { day: "Mon", action: "Plan two plant-based meals for the week" },
  { day: "Tue", action: "Walk or bike one trip you'd normally drive" },
  { day: "Wed", action: "Audit standby electronics — unplug what you don't need" },
  { day: "Thu", action: "Buy local produce for tonight's dinner" },
  { day: "Fri", action: "Skip an impulse purchase — add to a 30-day wishlist" },
  { day: "Sat", action: "Compost the week's food scraps" },
  { day: "Sun", action: "Reflect: track wins in your dashboard" },
];

const CATEGORIES = ["All", "Transport", "Food", "Energy", "Shopping", "Waste", "Water"] as const;

function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-3xl">
          <div className="text-sm font-medium text-leaf">Pollution Reduction Guide</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Small actions. Real impact.</h1>
          <p className="mt-2 text-muted-foreground">
            A curated library of high-leverage moves — paired with a focused weekly plan so progress
            is inevitable.
          </p>
        </div>

        {/* Weekly plan */}
        <Card className="mt-8 overflow-hidden border-0 bg-gradient-primary text-primary-foreground shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
              <Wind className="size-3.5" /> This week's plan
            </div>
            <CardTitle className="text-2xl">7-day sustainability sprint</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              A balanced mix of food, energy, and transport — built for momentum.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {WEEK.map((w) => (
                <div key={w.day} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{w.day}</div>
                  <div className="mt-1 text-sm">{w.action}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-10">
          <Tabs defaultValue="All">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">Action library</h2>
              <TabsList className="flex-wrap h-auto">
                {CATEGORIES.map((c) => (
                  <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
                ))}
              </TabsList>
            </div>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-6">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {ACTIONS.filter((a) => cat === "All" || a.category === cat).map((a) => (
                    <Card key={a.title} className="shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                            <a.icon className="size-5" />
                          </div>
                          <Badge variant="secondary" className="text-xs">{a.category}</Badge>
                        </div>
                        <h3 className="mt-4 font-semibold">{a.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                          <Leaf className="size-3 text-leaf" /> {a.impact}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Card className="mt-10 shadow-soft">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <TreePine className="size-6 text-leaf" />
              <div>
                <div className="font-semibold">Want a plan tuned to you?</div>
                <div className="text-sm text-muted-foreground">Your AI coach can build one in seconds.</div>
              </div>
            </div>
            <Button asChild className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              <Link to="/assistant">Open assistant</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
