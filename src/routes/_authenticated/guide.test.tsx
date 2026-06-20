import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

import { Route } from "./guide";

const GuideComponent = Route.component;

describe("Guide Page", () => {
  it("renders headers, weekly plan, and action categories", () => {
    render(<GuideComponent />);

    // Assert headers
    expect(screen.getByText("Pollution Reduction Guide")).toBeInTheDocument();
    expect(screen.getByText("Small actions. Real impact.")).toBeInTheDocument();

    // Assert weekly sprint section
    expect(screen.getByText("7-day sustainability sprint")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();

    // Assert Action library content
    expect(screen.getByText("Action library")).toBeInTheDocument();
    expect(screen.getByText("Swap two car trips per week")).toBeInTheDocument();
    expect(screen.getByText("Switch to LED + smart thermostat")).toBeInTheDocument();

    // Assert assistant call-to-action
    expect(screen.getByText("Want a plan tuned to you?")).toBeInTheDocument();
  });
});
