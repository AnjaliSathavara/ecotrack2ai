import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";

const passwordSchema = z.string().min(8, "Min 8 characters").max(72);

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Set new password — EcoTrack AI" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase places recovery token in URL hash and fires PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = passwordSchema.safeParse(password);
    if (!r.success) return toast.error(r.error.issues[0].message);
    if (password !== confirm) return toast.error("Passwords don't match");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: r.data });
    setBusy(false);
    if (error) return toast.error("Could not update password", { description: error.message });
    toast.success("Password updated!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">
            EcoTrack <span className="text-gradient">AI</span>
          </span>
        </div>
        <Card className="p-6 sm:p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a strong password you don't use elsewhere.
          </p>

          {!ready ? (
            <div className="mt-6 text-sm text-muted-foreground">Verifying reset link…</div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground"
                disabled={busy}
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Update password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
