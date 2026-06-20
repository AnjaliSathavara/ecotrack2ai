import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

const { mockUpdate, mockEq } = vi.hoisted(() => {
  const eqMock = vi.fn().mockResolvedValue({ error: null });
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
  return {
    mockUpdate: updateMock,
    mockEq: eqMock,
  };
});

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ score: 85 }], count: 5 }),
          }),
        }),
      }),
      update: mockUpdate,
    }),
  },
}));

// Mock useAuth
const mockProfile = {
  display_name: "John Doe",
  avatar_url: "http://example.com/avatar.png",
  created_at: "2026-01-01T00:00:00Z",
};
const mockUser = { id: "user-123", email: "john@example.com" };
const mockRefreshProfile = vi.fn();

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: mockUser,
    profile: mockProfile,
    refreshProfile: mockRefreshProfile,
  }),
}));

import { Route } from "./profile";

const ProfileComponent = Route.component;

describe("Profile Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders personal info, joined date, and badge card", async () => {
    render(<ProfileComponent />);

    // Assert headers
    expect(screen.getByText("Your profile")).toBeInTheDocument();
    expect(screen.getByText("Manage your personal details and view your sustainability progress.")).toBeInTheDocument();

    // Assert input fields loaded with profile values
    const nameInput = screen.getByLabelText("Display name") as HTMLInputElement;
    expect(nameInput.value).toBe("John Doe");

    const avatarInput = screen.getByLabelText("Avatar URL") as HTMLInputElement;
    expect(avatarInput.value).toBe("http://example.com/avatar.png");

    // Assert joined date
    expect(screen.getByText(/Joined/i)).toBeInTheDocument();

    // Assert badges
    await waitFor(() => {
      expect(screen.getByText("Eco Champion")).toBeInTheDocument();
      expect(screen.getByText("Assessments")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("85")).toBeInTheDocument();
    });
  });

  it("calls supabase update when saving profile changes", async () => {
    render(<ProfileComponent />);

    const nameInput = screen.getByLabelText("Display name");
    fireEvent.change(nameInput, { target: { value: "Johnny Green" } });

    const saveBtn = screen.getByRole("button", { name: "Save changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        display_name: "Johnny Green",
        avatar_url: "http://example.com/avatar.png",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "user-123");
      expect(mockRefreshProfile).toHaveBeenCalled();
    });
  });
});
