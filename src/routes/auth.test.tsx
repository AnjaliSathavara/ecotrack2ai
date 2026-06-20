import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

const { mockSignInWithPassword } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
}));

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: mockSignInWithPassword,
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Import Route component container
import { Route } from "./auth";

const AuthComponent = Route.component;

describe("Auth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Sign In form by default", async () => {
    render(<AuthComponent />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getAllByText("Sign in").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("should call supabase sign-in on form submission with valid email", async () => {
    render(<AuthComponent />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getAllByRole("button", { name: "Sign in" })[0];

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
