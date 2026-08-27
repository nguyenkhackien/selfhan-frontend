import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function response(payload: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(payload), { status }));
}

function installApiMock() {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: string) => {
      if (input.endsWith("/auth/refresh"))
        return response({ error: { message: "No session" } }, 401);
      if (input.endsWith("/lessons/hello"))
        return response({
          id: "lesson",
          slug: "hello",
          title: "Chào hỏi",
          summary: "Nói lời chào đầu tiên.",
          writingCharacter: "你",
          sortOrder: 1,
          vocabulary: [
            {
              id: "word",
              hanzi: "你好",
              pinyin: "nǐ hǎo",
              meaningVi: "Xin chào",
              audioUrl: null,
              examples: [
                {
                  hanzi: "你好！",
                  pinyin: "nǐ hǎo",
                  meaningVi: "Xin chào!",
                  audioUrl: null,
                  sortOrder: 1,
                },
              ],
            },
          ],
          grammarPoints: [
            {
              id: "grammar",
              title: "你好",
              explanationVi: "Lời chào cơ bản.",
              examples: ["你好！"],
              sortOrder: 1,
            },
          ],
        });
      return response({ items: [] });
    }),
  );
}

describe("SelfHan accessibility", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("renders an accessible lesson and labels the writing canvas", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      setLineDash: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    installApiMock();
    window.history.replaceState({}, "", "/lessons/hello");
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Chào hỏi" }),
    ).not.toBeNull();
    expect(screen.getByLabelText("Khung tập viết chữ 你")).not.toBeNull();
    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it("offers labelled login controls", () => {
    installApiMock();
    window.history.replaceState({}, "", "/login");
    render(<App />);
    expect(screen.getByRole("textbox", { name: "Email" })).not.toBeNull();
    expect(screen.getByLabelText("Mật khẩu")).not.toBeNull();
  });
});
