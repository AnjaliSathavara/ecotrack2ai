import { Link } from "@tanstack/react-router";
import { Leaf, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/assessment", label: "Assessment" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/guide", label: "Action Guide" },
  { to: "/report", label: "Report" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant transition-transform group-hover:scale-105">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            EcoTrack <span className="text-gradient">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
              activeOptions={{ exact: false }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
            <Link to="/assessment">Get Started</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 bg-gradient-primary text-primary-foreground">
                  <Link to="/assessment" onClick={() => setOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Leaf className="size-4" />
            </span>
            <span className="font-display font-bold">EcoTrack AI</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-powered sustainability intelligence for individuals and organizations committed to a regenerative future.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2">Platform</div>
            <ul className="space-y-1 text-muted-foreground">
              <li><Link to="/assessment" className="hover:text-foreground">Assessment</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/assistant" className="hover:text-foreground">AI Assistant</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Resources</div>
            <ul className="space-y-1 text-muted-foreground">
              <li><Link to="/guide" className="hover:text-foreground">Action Guide</Link></li>
              <li><Link to="/report" className="hover:text-foreground">Reports</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} EcoTrack AI. Built for a cooler planet.
        </div>
      </div>
    </footer>
  );
}
