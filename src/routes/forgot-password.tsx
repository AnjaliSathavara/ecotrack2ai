import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — EcoTrack AI" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailSchema.safeParse(email);
    if (!r.success) return toast.error(r.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) return toast.error("Could not send reset email", { description: error.message });
    setSent(true);
    toast.success("Reset link sent", { description: "Check your inbox." });
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
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll email you a secure link to set a new password.
          </p>
          {sent ? (
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm">
              If an account exists for <b>{email}</b>, a reset link is on its way. The link expires
              soon for security.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary text-primary-foreground"
                disabled={busy}
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Send reset link
              </Button>
            </form>
          )}
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to sign in
          </Link>
        </Card>
      </div>
    </div>
  );
}
