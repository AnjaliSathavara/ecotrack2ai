import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally combine CSS class names.
 * Uses `clsx` for conditional resolution and `twMerge` to safely resolve Tailwind CSS class conflicts.
 *
 * @param {...ClassValue[]} inputs - Conditional list of class values (strings, objects, arrays, etc.).
 * @returns {string} The final merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
