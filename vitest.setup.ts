import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock ResizeObserver for Recharts / Radix components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock Element.prototype.scrollTo for JSDOM
if (typeof window !== "undefined") {
  Element.prototype.scrollTo = vi.fn();
  window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  window.URL.revokeObjectURL = vi.fn();
}

// Global mock for TanStack Router
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement("a", { href: to }, children),
  useNavigate: () => vi.fn(),
  useSearch: () => ({ redirect: "/dashboard", tab: "signin" }),
}));

// Global mock for TanStack Query
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    cancelQueries: vi.fn(),
    clear: vi.fn(),
  }),
}));

// Global mock for Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [] }),
          }),
        }),
      }),
    }),
  },
}));

// Global mock for Lovable SDK
vi.mock("@/integrations/lovable/index", () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null, redirected: false }),
    },
  },
}));

// Global mock for Sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Global mock for ReactMarkdown
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

// Global mock for Recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "responsive-container" }, children),
  BarChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "bar-chart" }, children),
  Bar: () => React.createElement("div"),
  XAxis: () => React.createElement("div"),
  YAxis: () => React.createElement("div"),
  CartesianGrid: () => React.createElement("div"),
  Tooltip: () => React.createElement("div"),
  Cell: () => React.createElement("div"),
  PieChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pie-chart" }, children),
  Pie: () => React.createElement("div"),
  RadarChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "radar-chart" }, children),
  Radar: () => React.createElement("div"),
  PolarGrid: () => React.createElement("div"),
  PolarAngleAxis: () => React.createElement("div"),
  LineChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "line-chart" }, children),
  Line: () => React.createElement("div"),
}));

// Global mock for theme provider and theme toggle
vi.mock("./src/components/theme-provider", () => ({
  useTheme: () => ({
    theme: "light",
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
  ThemeCtx: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./src/components/theme-toggle", () => ({
  ThemeToggle: () => React.createElement("div", { "data-testid": "theme-toggle" }),
}));
