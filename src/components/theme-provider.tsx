import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type Ctx = {
  theme: Theme;
  resolvedTheme: Resolved;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "ecotrack-theme";

function getSystem(): Resolved {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Component that wraps the application and supplies theme state (light/dark/system).
 * Resolves standard system preferences and applies the active choice to the root element.
 *
 * @param {object} props - Component props.
 * @param {ReactNode} props.children - Child elements that will receive the theme context.
 * @returns {JSX.Element} The context provider component.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const stored =
      (typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as Theme | null)
        : null) ?? "system";
    setThemeState(stored);
  }, []);

  useEffect(() => {
    const apply = () => {
      const next: Resolved = theme === "system" ? getSystem() : theme;
      setResolved(next);
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        resolvedTheme: resolved,
        setTheme,
        toggle: () => setTheme(resolved === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

/**
 * Custom hook to access and toggle the current application theme.
 * Must be used inside a `<ThemeProvider>`.
 *
 * @throws {Error} If used outside of a ThemeProvider.
 * @returns {Ctx} The active theme, resolved theme type (light or dark), and update handlers.
 */
export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
