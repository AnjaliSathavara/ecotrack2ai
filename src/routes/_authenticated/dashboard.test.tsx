import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
    profile: { display_name: "John Doe" },
    loading: false,
    refreshProfile: vi.fn(),
  }),
}));

import { Route } from "./dashboard";

const DashboardComponent = Route.component;

describe("Dashboard Page", () => {
  it("renders greetings and calculated metrics cards", async () => {
    render(<DashboardComponent />);

    // Assert greetings
    expect(screen.getByText(/Hi John/i)).toBeInTheDocument();

    // Assert metric cards
    expect(screen.getByText("Annual footprint")).toBeInTheDocument();
    expect(screen.getByText("Vs. global average")).toBeInTheDocument();
    expect(screen.getByText("Path to 1.5°C")).toBeInTheDocument();
  });
});
