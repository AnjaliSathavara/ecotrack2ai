import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

// Mock ai SDK
vi.mock("ai", () => ({
  DefaultChatTransport: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [
      { id: "msg1", role: "user", parts: [{ type: "text", text: "Hello AI Coach" }] },
      {
        id: "msg2",
        role: "assistant",
        parts: [{ type: "text", text: "Hello! How can I help you reduce your carbon footprint?" }],
      },
    ],
    sendMessage: vi.fn(),
    status: "ready",
    error: null,
  }),
}));

import { Route } from "./assistant";

const AssistantComponent = Route.component;

describe("AI Assistant Page", () => {
  it("renders assistant details and chat history messages", async () => {
    render(<AssistantComponent />);

    // Assert title
    expect(screen.getByText("AI Sustainability Assistant")).toBeInTheDocument();

    // Assert messages
    expect(screen.getByText("Hello AI Coach")).toBeInTheDocument();
    expect(
      screen.getByText("Hello! How can I help you reduce your carbon footprint?"),
    ).toBeInTheDocument();
  });
});
