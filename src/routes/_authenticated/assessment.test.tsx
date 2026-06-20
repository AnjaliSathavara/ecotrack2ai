import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

import { Route } from "./assessment";

const AssessmentComponent = Route.component;

describe("Assessment Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the assessment sections and inputs", async () => {
    render(<AssessmentComponent />);

    expect(screen.getByText("Carbon Footprint Assessment")).toBeInTheDocument();
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("Electricity")).toBeInTheDocument();
    expect(screen.getByText("Food Habits")).toBeInTheDocument();
  });

  it("saves assessment data to localStorage and submits it on click", async () => {
    render(<AssessmentComponent />);

    const form = screen.getByRole("button", { name: /Calculate footprint/i });
    fireEvent.click(form);

    await waitFor(() => {
      expect(localStorage.getItem("ecotrack-assessment")).not.toBeNull();
    });
  });
});
