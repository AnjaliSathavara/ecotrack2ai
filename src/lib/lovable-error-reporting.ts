type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
  }
}

/**
 * Dispatches an exception report to the Lovable custom error tracking event bus (`window.__lovableEvents`).
 * Includes request route context and React-specific error boundary metadata.
 * Safe to call in any environment (does nothing if running server-side).
 *
 * @param {unknown} error - The caught error object or message to report.
 * @param {Record<string, unknown>} [context={}] - Optional metadata or state properties to attach to the report.
 * @returns {void}
 */
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
