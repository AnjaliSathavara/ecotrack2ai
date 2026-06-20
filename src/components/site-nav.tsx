import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, LogOut, Menu, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const links = [
  { to: "/assessment", label: "Assessment" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/guide", label: "Action Guide" },
  { to: "/report", label: "Report" },
] as const;

/**
 * Main application navigation header.
 * Displays application logo, links to platform assessment/dashboard pages,
 * theme toggle selection, and user profile avatar menu with sign-out trigger.
 *
 * @returns {JSX.Element} The rendered navigation header.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const initials = (profile?.display_name || user?.email || "?").slice(0, 2).toUpperCase();

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account menu"
                >
                  <Avatar className="size-9">
                    <AvatarImage
                      src={profile?.avatar_url ?? undefined}
                      alt={profile?.display_name ?? user.email ?? ""}
                    />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm">{profile?.display_name || "EcoTracker"}</span>
                  <span className="text-xs font-normal text-muted-foreground truncate">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="mr-2 size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
              >
                <Link to="/auth" search={{ tab: "signup", redirect: "/dashboard" }}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
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
                {!user && (
                  <Button asChild className="mt-4 bg-gradient-primary text-primary-foreground">
                    <Link to="/auth" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/**
 * Application footer layout.
 * Shows general branding, platform links, legal copyrights, and sustainability mission summary.
 *
 * @returns {JSX.Element} The rendered site footer.
 */
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
            AI-powered sustainability intelligence for individuals and organizations committed to a
            regenerative future.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2">Platform</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link to="/assessment" className="hover:text-foreground">
                  Assessment
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-foreground">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Resources</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link to="/guide" className="hover:text-foreground">
                  Action Guide
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-foreground">
                  Reports
                </Link>
              </li>
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
