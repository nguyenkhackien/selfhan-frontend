import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const fetchMock = vi.fn();

function mockApi() {
  fetchMock.mockImplementation((input: string) => {
    if (input.endsWith("/auth/refresh"))
      return Promise.resolve(
        new Response(JSON.stringify({ error: { message: "No session" } }), {
          status: 401,
        }),
      );
    if (input.endsWith("/levels"))
      return Promise.resolve(
        new Response(
          JSON.stringify({
            items: [
              {
                id: "level-1",
                slug: "starter-chinese",
                title: "Tiếng Trung nhập môn",
                description: "Bắt đầu với lời chào.",
                sortOrder: 1,
              },
            ],
          }),
        ),
      );
    return Promise.resolve(
      new Response(JSON.stringify({ error: { message: "Not found" } }), {
        status: 404,
      }),
    );
  });
}

describe("SelfHan app", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("renders published levels from the API and has a skip link", async () => {
    vi.stubGlobal("fetch", fetchMock);
    mockApi();
    render(<App />);
    expect(
      screen.getByRole("link", { name: "Bỏ qua điều hướng" }),
    ).toHaveProperty("hash", "#main-content");
    await expect(
      screen.findByRole("heading", { name: "Bắt đầu từ đây" }),
    ).resolves.not.toBeNull();
    expect(
      screen.getByRole("link", { name: /Tiếng Trung nhập môn/i }),
    ).not.toBeNull();
    expect(screen.getByRole("link", { name: "CVDICT" })).toHaveProperty(
      "href",
      "https://github.com/ph0ngp/CVDICT",
    );
    expect(screen.getByRole("link", { name: "CC BY-SA 4.0" })).toHaveProperty(
      "href",
      "https://creativecommons.org/licenses/by-sa/4.0/",
    );
  });

  it("shows a retryable API error", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<App />);
    await waitFor(() => expect(screen.getByRole("alert")).not.toBeNull());
    expect(screen.getByRole("button", { name: "Thử lại" })).not.toBeNull();
  });
});
