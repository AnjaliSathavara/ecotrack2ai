import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * A theme selection toggle button.
 * Triggers a dropdown menu with Light, Dark, and System options to change the active color scheme.
 *
 * @returns {JSX.Element} The rendered dropdown toggle.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" className="rounded-full">
          {resolvedTheme === "dark" ? (
            <Moon className="size-[18px] transition-transform" />
          ) : (
            <Sun className="size-[18px] transition-transform" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" /> Light {theme === "light" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" /> Dark {theme === "dark" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 size-4" /> System {theme === "system" && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
