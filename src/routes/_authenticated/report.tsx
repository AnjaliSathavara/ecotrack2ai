import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeFootprint, loadAssessment, DEFAULT_ASSESSMENT } from "@/lib/assessment";
import { useMemo } from "react";
import { Download, FileText, Leaf, Sparkles, Trophy, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "Sustainability Report — EcoTrack AI" },
      {
        name: "description",
        content:
          "Generate a monthly sustainability report summarizing your footprint, top categories, and recommended actions.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { user } = useAuth();
  const assessment = useMemo(() => loadAssessment() ?? DEFAULT_ASSESSMENT, []);
  const fp = useMemo(() => computeFootprint(assessment), [assessment]);
  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const topCategory = Object.entries(fp.breakdown).sort((a, b) => b[1] - a[1])[0];

  const downloadReport = async () => {
    const lines = [
      "EcoTrack AI — Sustainability Report",
      `Period: ${month}`,
      "",
      `Carbon Score: ${fp.score}/100  (${fp.rating})`,
      `Annual Footprint: ${fp.totalTonnes} tonnes CO2e`,
      `Vs. global average (4.7 t): ${fp.totalTonnes < 4.7 ? "below" : "above"} by ${Math.abs((4.7 - fp.totalTonnes).toFixed(2) as unknown as number)} t`,
      "",
      "Impact breakdown (kg CO2e/yr):",
      ...Object.entries(fp.breakdown).map(([k, v]) => `  - ${k}: ${v}`),
      "",
      `Top focus area: ${topCategory[0]} (${topCategory[1]} kg)`,
      "",
      "Recommended actions:",
      "  1. Replace two car trips per week with cycling or transit",
      "  2. Add two plant-based meal days per week",
      "  3. Switch to a renewable electricity tariff",
      "",
      `Generated ${new Date().toLocaleString()} by EcoTrack AI`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecotrack-report-${month.replace(" ", "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (user) {
      await supabase.from("reports").insert({
        user_id: user.id,
        month,
        payload: {
          score: fp.score,
          rating: fp.rating,
          totalTonnes: fp.totalTonnes,
          breakdown: fp.breakdown,
        } as never,
      });
    }
    toast.success("Report saved & downloaded");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-leaf">Sustainability Report</div>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Your impact, {month}</h1>
            <p className="mt-2 text-muted-foreground">
              A polished overview — ready to share or archive.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
            <Button
              onClick={downloadReport}
              className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
            >
              <Download className="mr-2 size-4" /> Download report
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            icon={Sparkles}
            label="Carbon Score"
            value={`${fp.score}/100`}
            sub={fp.rating}
            highlight
          />
          <SummaryCard
            icon={Leaf}
            label="Annual footprint"
            value={`${fp.totalTonnes} t`}
            sub="CO₂e / year"
          />
          <SummaryCard
            icon={TrendingDown}
            label="Top focus area"
            value={topCategory[0]}
            sub={`${topCategory[1]} kg CO₂e/yr`}
          />
        </div>

        {/* Report body */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-leaf" />
              <CardTitle>Monthly impact overview</CardTitle>
            </div>
            <CardDescription>Generated from your latest assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-base font-semibold">Executive summary</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your estimated annual carbon footprint is{" "}
                <b className="text-foreground">{fp.totalTonnes} tonnes CO₂e</b> —{" "}
                {fp.totalTonnes < 4.7 ? (
                  <span>below the global average of 4.7 t. Strong baseline.</span>
                ) : (
                  <span>above the global average of 4.7 t. There's meaningful upside.</span>
                )}{" "}
                Your strongest opportunity for reduction sits in{" "}
                <b className="text-foreground">{topCategory[0]}</b>, which represents{" "}
                {Math.round((topCategory[1] / fp.totalKg) * 100)}% of your total impact.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold">Category breakdown</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium text-right">kg CO₂e / yr</th>
                      <th className="px-4 py-2 font-medium text-right">% of total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(fp.breakdown).map(([k, v]) => (
                      <tr key={k} className="border-t border-border">
                        <td className="px-4 py-2">{k}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{v.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {Math.round((v / fp.totalKg) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold">Recommended next actions</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { t: "Swap two car trips per week", s: "≈ 210 kg CO₂e/yr saved" },
                  { t: "Add two plant-based meal days", s: "≈ 300 kg CO₂e/yr saved" },
                  { t: "Switch to a renewable tariff", s: "≈ 900 kg CO₂e/yr saved" },
                  { t: "Compost food scraps", s: "≈ 120 kg CO₂e/yr saved" },
                ].map((r) => (
                  <li
                    key={r.t}
                    className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <Trophy className="size-5 text-leaf mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{r.t}</div>
                      <div className="text-xs text-muted-foreground">{r.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-primary text-primary-foreground shadow-elegant">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        <CardContent className="relative p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
            <Icon className="size-3.5" /> {label}
          </div>
          <div className="mt-2 font-display text-4xl font-bold">{value}</div>
          <div className="mt-1 text-sm opacity-90">{sub}</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Icon className="size-3.5 text-leaf" /> {label}
        </div>
        <div className="mt-2 font-display text-3xl font-bold">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
