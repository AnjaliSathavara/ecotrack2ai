import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

const { mockInsert } = vi.hoisted(() => ({
  mockInsert: vi.fn().mockResolvedValue({ error: null }),
}));

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: mockInsert,
    }),
  },
}));

import { Route } from "./report";

const ReportComponent = Route.component;

describe("Report Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders report title, summary cards and table breakdown", async () => {
    render(<ReportComponent />);

    // Assert headers
    expect(screen.getByText("Monthly impact overview")).toBeInTheDocument();

    // Assert summary components
    expect(screen.getByText("Annual footprint")).toBeInTheDocument();
    expect(screen.getByText("Top focus area")).toBeInTheDocument();

    // Assert table categories
    expect(screen.getByText("Transportation")).toBeInTheDocument();
    expect(screen.getByText("Electricity")).toBeInTheDocument();
    expect(screen.getAllByText("Food").length).toBeGreaterThan(0);
  });

  it("downloads report and logs to database on click", async () => {
    render(<ReportComponent />);

    // Spy on link click trigger
    const downloadBtn = screen.getByRole("button", { name: /Download report/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
