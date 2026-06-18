import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { useState } from "react";
import {
  DEFAULT_ASSESSMENT,
  loadAssessment,
  saveAssessment,
  type AssessmentData,
} from "@/lib/assessment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Car,
  Zap,
  UtensilsCrossed,
  ShoppingBag,
  Recycle,
  Plane,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Carbon Footprint Assessment — EcoTrack AI" },
      { name: "description", content: "Answer six quick questions across transport, energy, food, shopping, waste, and travel to get your personalized carbon footprint." },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AssessmentData>(() => loadAssessment() ?? DEFAULT_ASSESSMENT);
  const update = <K extends keyof AssessmentData>(k: K, v: AssessmentData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAssessment(data);
    toast.success("Assessment saved", { description: "Calculating your footprint…" });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-12 lg:py-16 flex-1">
        <div className="mb-10">
          <div className="text-sm font-medium text-leaf">Step 1 of 1</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Carbon Footprint Assessment</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            A quick, honest snapshot of your lifestyle. Slide to roughly match — we'll do the math.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
          <Section icon={Car} title="Transportation" desc="Driving and public transit usage">
            <SliderField
              label="Car distance"
              value={data.transportation}
              onChange={(v) => update("transportation", v)}
              min={0}
              max={1000}
              step={10}
              unit="km / week"
            />
            <SliderField
              label="Public transit"
              value={data.publicTransit}
              onChange={(v) => update("publicTransit", v)}
              min={0}
              max={500}
              step={5}
              unit="km / week"
            />
          </Section>

          <Section icon={Zap} title="Electricity" desc="Household energy consumption">
            <SliderField
              label="Monthly usage"
              value={data.electricity}
              onChange={(v) => update("electricity", v)}
              min={0}
              max={2000}
              step={20}
              unit="kWh / mo"
            />
            <SliderField
              label="Renewable share"
              value={data.renewableShare}
              onChange={(v) => update("renewableShare", v)}
              min={0}
              max={100}
              step={5}
              unit="%"
            />
          </Section>

          <Section icon={UtensilsCrossed} title="Food Habits" desc="Diet & sourcing">
            <div className="space-y-2">
              <Label>Diet</Label>
              <Select value={data.diet} onValueChange={(v) => update("diet", v as AssessmentData["diet"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="omnivore">Omnivore</SelectItem>
                  <SelectItem value="heavy-meat">Heavy meat eater</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SliderField
              label="Local & seasonal food"
              value={data.localFood}
              onChange={(v) => update("localFood", v)}
              min={0}
              max={100}
              step={5}
              unit="%"
            />
          </Section>

          <Section icon={ShoppingBag} title="Shopping" desc="Goods & clothing frequency">
            <div className="space-y-2">
              <Label>Shopping frequency</Label>
              <Select value={data.shoppingFrequency} onValueChange={(v) => update("shoppingFrequency", v as AssessmentData["shoppingFrequency"]) }>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — only essentials</SelectItem>
                  <SelectItem value="medium">Medium — occasional</SelectItem>
                  <SelectItem value="high">High — monthly hauls</SelectItem>
                  <SelectItem value="very-high">Very high — weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <div className="font-medium">Fast fashion</div>
                <div className="text-sm text-muted-foreground">I buy from fast-fashion brands</div>
              </div>
              <Switch checked={data.fastFashion} onCheckedChange={(v) => update("fastFashion", v)} />
            </div>
          </Section>

          <Section icon={Recycle} title="Waste" desc="Recycling & composting">
            <SliderField
              label="Recycling rate"
              value={data.recyclingRate}
              onChange={(v) => update("recyclingRate", v)}
              min={0}
              max={100}
              step={5}
              unit="%"
            />
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <div className="font-medium">Composting</div>
                <div className="text-sm text-muted-foreground">I compost food scraps</div>
              </div>
              <Switch checked={data.compost} onCheckedChange={(v) => update("compost", v)} />
            </div>
          </Section>

          <Section icon={Plane} title="Travel" desc="Flights & vacations">
            <SliderField
              label="Short-haul flights"
              value={data.flights}
              onChange={(v) => update("flights", v)}
              min={0}
              max={30}
              step={1}
              unit="flights / yr"
            />
            <div className="space-y-2">
              <Label>Vacation travel</Label>
              <Select value={data.travelHabits} onValueChange={(v) => update("travelHabits", v as AssessmentData["travelHabits"]) }>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rare">Rarely travel</SelectItem>
                  <SelectItem value="annual">Once a year</SelectItem>
                  <SelectItem value="frequent">A few times a year</SelectItem>
                  <SelectItem value="very-frequent">Monthly trips</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Section>

          <div className="lg:col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div>
              <div className="font-semibold">Ready to see your impact?</div>
              <div className="text-sm text-muted-foreground">We'll compute your footprint and unlock your personalized dashboard.</div>
            </div>
            <Button type="submit" size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              Calculate footprint <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-soft transition-shadow hover:shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <div className="text-sm font-medium tabular-nums">
          {value} <span className="text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        className="mt-3"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
