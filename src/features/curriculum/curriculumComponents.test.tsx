import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/shared/theme";
import { AudioControl } from "./components/AudioControl";
import { Hero } from "./components/Hero";
import { WritingCanvas } from "./components/WritingCanvas";
import { LevelPage } from "./pages/LevelPage";
import { LevelsPage } from "./pages/LevelsPage";
import { UnitPage } from "./pages/UnitPage";

function apiError(message: string) {
  return Promise.resolve(
    new Response(JSON.stringify({ error: { message } }), { status: 500 }),
  );
}

describe("curriculum components and error states", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the no-curriculum hero destination and audio label accessible", () => {
    render(
      <MemoryRouter>
        <Hero levels={[]} />
        <AudioControl src="https://audio.example/hello.mp3" label="Nghe thử" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Xem lộ trình/i })).toHaveProperty(
      "pathname",
      "/levels",
    );
    expect(screen.getByLabelText("Nghe thử")).not.toBeNull();
  });

  it("supports drawing and clearing a writing canvas", () => {
    const context = {
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      setLineDash: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context,
    );
    Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    });
    render(
      <ThemeProvider>
        <WritingCanvas character="你" />
      </ThemeProvider>,
    );

    const canvas = screen.getByLabelText("Khung tập viết chữ 你");
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    expect(screen.getByText("Bạn đang luyện viết")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Xoá nét viết" }));
    expect(screen.getByText("Sẵn sàng để bắt đầu")).not.toBeNull();
    expect(context.lineTo).toHaveBeenCalled();
  });

  it("offers a keyboard writing alternative", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      setLineDash: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    render(
      <ThemeProvider>
        <WritingCanvas character="你" />
      </ThemeProvider>,
    );

    const input = screen.getByRole("textbox", {
      name: "Nhập chữ 你 bằng bàn phím",
    });
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { value: "好" } });
    expect(screen.getByText("Hãy thử nhập chữ 你.")).not.toBeNull();
    fireEvent.change(input, { target: { value: "你" } });
    expect(screen.getByText("Chữ nhập trùng với mục tiêu.")).not.toBeNull();
    fireEvent.change(input, { target: { value: "" } });
    expect(
      screen.getByText("Có thể dùng bàn phím thay cho thao tác vẽ."),
    ).not.toBeNull();
  });

  it.each([
    ["/levels/missing", LevelPage, "Không mở được Level"],
    ["/units/missing", UnitPage, "Không mở được Unit"],
  ])("shows a retryable API error for %s", async (path, Page, title) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => apiError("Không thể tải.")),
    );
    render(
      <MemoryRouter initialEntries={[path]}>
        <Page />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: title })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  });

  it("shows a retryable catalogue error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => apiError("Không thể tải.")),
    );
    render(
      <MemoryRouter>
        <LevelsPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: "Lộ trình học" }),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  });

  it("renders populated Level and Unit sequences", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string) => {
        if (input.endsWith("/levels/starter")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                id: "level",
                slug: "starter",
                title: "Nhập môn",
                description: "Bắt đầu.",
                sortOrder: 1,
                units: [
                  {
                    id: "unit",
                    slug: "greetings",
                    title: "Chào hỏi",
                    description: null,
                    sortOrder: 1,
                  },
                ],
              }),
            ),
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: "unit",
              slug: "greetings",
              title: "Chào hỏi",
              description: "Lời chào.",
              sortOrder: 1,
              lessons: [
                {
                  id: "lesson",
                  slug: "hello",
                  title: "Nói xin chào",
                  summary: null,
                  writingCharacter: "你",
                  sortOrder: 1,
                },
              ],
            }),
          ),
        );
      }),
    );
    const levelView = render(
      <MemoryRouter initialEntries={["/levels/starter"]}>
        <Routes>
          <Route path="/levels/:slug" element={<LevelPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("link", { name: /Chào hỏi/i }),
    ).not.toBeNull();
    levelView.unmount();
    render(
      <MemoryRouter initialEntries={["/units/greetings"]}>
        <Routes>
          <Route path="/units/:slug" element={<UnitPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("link", { name: /Nói xin chào/i }),
    ).not.toBeNull();
  });
});
