import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { useEffect, useMemo, useState } from "react";
import { computeFootprint, loadAssessment, DEFAULT_ASSESSMENT } from "@/lib/assessment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Leaf, Sparkles, TrendingDown, Trophy } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Sustainability Dashboard — EcoTrack AI" },
      { name: "description", content: "See your carbon score, impact breakdown, and progress toward a sustainable footprint." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = ["var(--leaf)", "var(--ocean)", "var(--sun)", "var(--earth)", "#7dd3fc", "#a78bfa", "#f472b6"];

function DashboardPage() {
  const [data, setData] = useState(() => loadAssessment() ?? DEFAULT_ASSESSMENT);
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    const a = loadAssessment();
    if (a) {
      setData(a);
      setHasAssessment(true);
    }
  }, []);

  const fp = useMemo(() => computeFootprint(data), [data]);

  const breakdownData = Object.entries(fp.breakdown).map(([name, value]) => ({ name, value }));
  const radarData = breakdownData.map((d) => ({
    category: d.name,
    you: Math.min(100, Math.round((d.value / fp.totalKg) * 100 * 3)),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-leaf">Overview</div>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Your sustainability dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              {hasAssessment
                ? "Updated from your latest assessment."
                : "Showing example data — complete the assessment for personalized results."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/assessment">Retake assessment</Link>
          </Button>
        </div>

        {/* Top cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ScoreCard score={fp.score} rating={fp.rating} />
          <StatCard
            icon={Leaf}
            label="Annual footprint"
            value={`${fp.totalTonnes} t`}
            sub="CO₂e per year"
            tone="leaf"
          />
          <StatCard
            icon={TrendingDown}
            label="Vs. global average"
            value={`${Math.round(((4.7 - fp.totalTonnes) / 4.7) * 100)}%`}
            sub={fp.totalTonnes < 4.7 ? "below average" : "above average"}
            tone={fp.totalTonnes < 4.7 ? "leaf" : "destructive"}
          />
          <StatCard
            icon={Trophy}
            label="Path to 1.5°C"
            value={`${Math.max(0, Math.round(((fp.totalTonnes - 2) / fp.totalTonnes) * 100))}%`}
            sub="reduction needed"
            tone="ocean"
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Impact breakdown</CardTitle>
              <CardDescription>Annual kg CO₂e by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="h-72"
                role="img"
                aria-label={`Bar chart of annual emissions by category: ${breakdownData.map((d) => `${d.name} ${d.value} kilograms`).join(", ")}.`}
              >
                <ResponsiveContainer>
                  <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                      }}
                      formatter={(v: number) => [`${v} kg`, "CO₂e"]}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {breakdownData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Share of emissions</CardTitle>
              <CardDescription>Where your impact comes from</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="h-72"
                role="img"
                aria-label={`Pie chart of emission share. Total ${fp.totalKg} kilograms across ${breakdownData.length} categories.`}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {breakdownData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--card)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                      }}
                      formatter={(v: number) => [`${v} kg`, "CO₂e"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress + radar */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Progress indicators</CardTitle>
              <CardDescription>Distance to a sustainable 2 t CO₂e target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-5" aria-label="Emissions by category">
                {breakdownData.map((row, i) => {
                  const max = Math.max(...breakdownData.map((b) => b.value));
                  const pct = Math.round((row.value / max) * 100);
                  return (
                    <li key={row.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-muted-foreground tabular-nums">{row.value} kg</span>
                      </div>
                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label={`${row.name} share of largest category`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        aria-valuetext={`${row.value} kilograms, ${pct} percent of largest category`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Lifestyle radar</CardTitle>
              <CardDescription>Relative footprint per area</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="h-72"
                role="img"
                aria-label="Radar chart showing your relative footprint across categories compared to your own totals."
              >
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="category" style={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Radar
                      dataKey="you"
                      stroke="var(--leaf)"
                      fill="var(--leaf)"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <CTA
            title="Chat with your AI coach"
            body="Ask anything. Get personalized, science-based answers tied to your assessment."
            to="/assistant"
            cta="Open assistant"
          />
          <CTA
            title="Your weekly action plan"
            body="A focused, achievable plan calibrated to your top-impact categories."
            to="/guide"
            cta="View action plan"
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ScoreCard({ score, rating }: { score: number; rating: string }) {
  return (
    <Card className="relative overflow-hidden shadow-elegant border-0 bg-gradient-primary text-primary-foreground">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      <CardContent className="relative p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
          <Sparkles className="size-3.5" /> Carbon Score
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="font-display text-5xl font-bold tabular-nums">{score}</div>
          <div className="mb-1 text-sm opacity-80">/ 100</div>
        </div>
        <div className="mt-1 text-sm font-medium">{rating}</div>
        <Progress value={score} className="mt-4 bg-white/20 [&>div]:bg-white" />
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone: "leaf" | "ocean" | "destructive";
}) {
  const toneClass = tone === "leaf" ? "text-leaf" : tone === "ocean" ? "text-ocean" : "text-destructive";
  return (
    <Card className="shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
          <Icon className={`size-4 ${toneClass}`} />
        </div>
        <div className="mt-3 font-display text-3xl font-bold tabular-nums">{value}</div>
        <div className={`mt-1 text-sm ${toneClass}`}>{sub}</div>
      </CardContent>
    </Card>
  );
}

function CTA({ title, body, to, cta }: { title: string; body: string; to: string; cta: string }) {
  return (
    <Card className="shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{body}</div>
        </div>
        <Button asChild variant="outline">
          <Link to={to}>
            {cta} <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
