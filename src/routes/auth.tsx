import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

const REMEMBER_KEY = "ecotrack-remember-email";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "Min 8 characters").max(72);

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
    tab: s.tab === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign In — EcoTrack AI" },
      { name: "description", content: "Sign in or create your EcoTrack AI account to track your sustainability journey." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<string>(search.tab);

  useEffect(() => {
    // If already logged in, bounce
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: search.redirect || "/dashboard" });
    });
  }, [navigate, search.redirect]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand side */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Leaf className="size-6" />
            </span>
            <span className="font-display text-xl font-bold">EcoTrack AI</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Your lower-carbon life,<br />intelligently guided.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/90">
            Join thousands tracking their footprint, learning from an AI coach, and acting on what matters most.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-primary-foreground/90">
            <li>✓ Personalized carbon assessment & dashboard</li>
            <li>✓ AI sustainability coach trained on climate science</li>
            <li>✓ Monthly impact reports & weekly action plans</li>
          </ul>
        </div>
        <div className="relative text-xs text-primary-foreground/70">© {new Date().getFullYear()} EcoTrack AI</div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">EcoTrack <span className="text-gradient">AI</span></span>
          </div>

          <Card className="p-6 sm:p-8 shadow-elegant">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <SignInForm onSuccess={() => navigate({ to: search.redirect || "/dashboard" })} />
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                <SignUpForm onSuccess={() => navigate({ to: search.redirect || "/dashboard" })} />
              </TabsContent>
            </Tabs>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleButton({ onStart }: { onStart?: () => void }) {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    onStart?.();
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed", { description: result.error.message });
      return;
    }
    // if redirected, browser will navigate. Otherwise tokens already set.
    if (!result.redirected) {
      window.location.href = "/dashboard";
    }
  };
  return (
    <Button type="button" variant="outline" className="w-full" onClick={handle} disabled={busy}>
      {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <GoogleIcon />}
      Continue with Google
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.97 6.97 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(REMEMBER_KEY) || "" : "",
  );
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emRes = emailSchema.safeParse(email);
    if (!emRes.success) return toast.error(emRes.error.issues[0].message);
    if (password.length < 1) return toast.error("Enter your password");

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emRes.data, password });
    setBusy(false);
    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    if (remember) localStorage.setItem(REMEMBER_KEY, emRes.data);
    else localStorage.removeItem(REMEMBER_KEY);
    toast.success("Welcome back!");
    onSuccess();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <Divider />
      <Field label="Email" icon={Mail}>
        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </Field>
      <Field label="Password" icon={Lock}>
        <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      </Field>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
          Remember me
        </label>
        <Link to="/forgot-password" className="text-sm text-leaf hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-elegant" disabled={busy}>
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Sign in
      </Button>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return toast.error("Enter your name");
    const emRes = emailSchema.safeParse(email);
    if (!emRes.success) return toast.error(emRes.error.issues[0].message);
    const pwRes = passwordSchema.safeParse(password);
    if (!pwRes.success) return toast.error(pwRes.error.issues[0].message);

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: emRes.data,
      password: pwRes.data,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { display_name: trimmedName, full_name: trimmedName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }
    toast.success("Account created!", { description: "Welcome to EcoTrack AI." });
    onSuccess();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <Divider />
      <Field label="Name" icon={UserIcon}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Green" autoComplete="name" required />
      </Field>
      <Field label="Email" icon={Mail}>
        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </Field>
      <Field label="Password" icon={Lock}>
        <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />
      </Field>
      <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-elegant" disabled={busy}>
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Create account
      </Button>
    </form>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <div className="[&_input]:pl-9">{children}</div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}
