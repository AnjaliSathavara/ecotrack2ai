import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { badgeForScore, type BadgeLevel } from "@/lib/badge";
import { Award, CalendarDays, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — EcoTrack AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? "");
  const [busy, setBusy] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [assessmentCount, setAssessmentCount] = useState(0);

  useEffect(() => {
    setName(profile?.display_name ?? "");
    setAvatar(profile?.avatar_url ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("assessments")
      .select("score", { count: "exact" })
      .eq("user_id", user.id)
      .order("score", { ascending: false })
      .limit(1)
      .then(({ data, count }) => {
        setBestScore(data?.[0]?.score ?? null);
        setAssessmentCount(count ?? 0);
      });
  }, [user]);

  const badge: BadgeLevel = badgeForScore(bestScore ?? 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || null, avatar_url: avatar.trim() || null })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error("Could not save", { description: error.message });
    await refreshProfile();
    toast.success("Profile updated");
  };

  const initials = (profile?.display_name || user?.email || "?").slice(0, 2).toUpperCase();
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 flex-1">
        <div className="text-sm font-medium text-leaf">Account</div>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal details and view your sustainability progress.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>Update your display name and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="size-20 ring-2 ring-leaf/30">
                    <AvatarImage src={avatar} alt={name || user?.email || ""} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    <Mail className="size-4" /> {user?.email}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Save changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="shadow-soft border-0 bg-gradient-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
                  <Award className="size-4" /> Sustainability Badge
                </div>
                <CardTitle className="font-display text-2xl mt-2">{badge.name}</CardTitle>
                <CardDescription className="text-primary-foreground/90">
                  Tier {badge.tier} / 5
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-primary-foreground/90">{badge.description}</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" /> Joined
                  </span>
                  <span className="font-medium">{joined}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-4" /> Assessments
                  </span>
                  <span className="font-medium">{assessmentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Award className="size-4" /> Best score
                  </span>
                  <span className="font-medium">{bestScore ?? "—"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
