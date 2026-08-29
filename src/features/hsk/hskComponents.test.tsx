import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "@/shared/theme";
import { hskApi } from "./api/hskApi";
import { WordWritingPractice } from "./components/WordWritingPractice";
import { HskPage } from "./pages/HskPage";
import { HskVocabularyPage } from "./pages/HskVocabularyPage";

const writerMocks = vi.hoisted(() => ({
  animateCharacter: vi.fn(),
  create: vi.fn(),
}));

vi.mock("hanzi-writer", () => ({
  default: { create: writerMocks.create },
}));

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

describe("HSK learner components", () => {
  beforeEach(() => {
    writerMocks.animateCharacter.mockReset();
    writerMocks.create.mockReset();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      stroke: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    });
    writerMocks.create.mockImplementation(
      (
        _target: unknown,
        _character: string,
        options: { onLoadCharDataSuccess?: () => void },
      ) => {
        options.onLoadCharDataSuccess?.();
        return { animateCharacter: writerMocks.animateCharacter };
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows cursor pages and resets pagination when a band changes", async () => {
    const fetchMock = vi.fn((input: string) => {
      if (input.endsWith("/hsk/bands")) {
        return json({
          items: [
            { band: 1, displayBand: "HSK 1", count: 2 },
            { band: 2, displayBand: "HSK 2", count: 1 },
          ],
        });
      }
      if (input.includes("cursor=next-page")) {
        return json({
          items: [
            {
              id: "word-2",
              hskBand: 1,
              sourceOrder: 2,
              simplified: "八",
              pinyin: "bā",
              sinoViet: "Bát",
              primaryMeaning: "tám",
              importStatus: "ready",
            },
          ],
          nextCursor: null,
        });
      }
      if (input.includes("band=2")) {
        return json({
          items: [
            {
              id: "word-3",
              hskBand: 2,
              sourceOrder: 1,
              simplified: "吧",
              pinyin: "ba",
              sinoViet: "Ba",
              primaryMeaning: "nhé",
              importStatus: "ready",
            },
          ],
          nextCursor: null,
        });
      }
      return json({
        items: [
          {
            id: "word-1",
            hskBand: 1,
            sourceOrder: 1,
            simplified: "爱",
            pinyin: "ài",
            sinoViet: "Ái",
            primaryMeaning: "yêu",
            importStatus: "ready",
          },
        ],
        nextCursor: "next-page",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HskPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("yêu")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Trang tiếp" }));
    expect(await screen.findByText("tám")).not.toBeNull();
    expect(screen.getByText("Trang 2")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Trang trước" }));
    expect(await screen.findByText("yêu")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /HSK 2/i }));
    expect(await screen.findByText("nhé")).not.toBeNull();
    expect(screen.getByText("Trang 1")).not.toBeNull();
  });

  it("keeps stroke data local and exposes the three writing modes in word order", async () => {
    const fetchMock = vi.fn(() => json({ strokes: [] }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ThemeProvider>
        <WordWritingPractice word="你好" />
      </ThemeProvider>,
    );

    expect(await screen.findByText("Dữ liệu nét đã sẵn sàng.")).not.toBeNull();
    const firstWriterOptions = writerMocks.create.mock.calls[0]?.[2] as {
      charDataLoader: (character: string) => Promise<unknown>;
    };
    await firstWriterOptions.charDataLoader("你");
    expect(fetchMock).toHaveBeenCalledWith("/hsk-strokes/%E4%BD%A0.json");

    fireEvent.click(screen.getByRole("button", { name: "Hướng dẫn" }));
    fireEvent.click(screen.getByRole("button", { name: "Xem lại thứ tự nét" }));
    expect(writerMocks.animateCharacter).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Chữ nền" }));
    const canvas = screen.getByLabelText("Khung tập viết chữ 你");
    expect(canvas).not.toBeNull();
    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    fireEvent.pointerCancel(canvas, { pointerId: 1 });

    const input = screen.getByRole("textbox", {
      name: "Nhập chữ 你 bằng bàn phím",
    });
    fireEvent.change(input, { target: { value: "好" } });
    expect(screen.getByText("Hãy thử nhập chữ 你.")).not.toBeNull();
    fireEvent.change(input, { target: { value: "你" } });
    expect(screen.getByText("Chữ nhập trùng với mục tiêu.")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Giấy trắng" }));
    expect(screen.getByLabelText("Khung tập viết chữ 你")).not.toBeNull();
    expect(
      screen.getByText("Giấy trắng chia bốn ô để bạn tự tập viết chữ 你."),
    ).not.toBeNull();
    expect(
      screen.getByRole("textbox", { name: "Nhập chữ 你 bằng bàn phím" }),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Chữ tiếp" }));
    expect(
      screen.getByRole("button", { name: "好", pressed: true }),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Chữ trước" }));
    expect(
      screen.getByRole("button", { name: "你", pressed: true }),
    ).not.toBeNull();
  });

  it("keeps unavailable local stroke data non-blocking", async () => {
    writerMocks.create.mockImplementation(
      (
        _target: unknown,
        _character: string,
        options: { onLoadCharDataError?: () => void },
      ) => {
        options.onLoadCharDataError?.();
        return { animateCharacter: writerMocks.animateCharacter };
      },
    );

    render(
      <ThemeProvider>
        <WordWritingPractice word="你" />
      </ThemeProvider>,
    );

    expect(
      await screen.findByText("Chưa có dữ liệu nét cục bộ cho chữ này."),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Xem lại thứ tự nét" }),
    ).not.toBeNull();
  });

  it("submits a trimmed vocabulary search", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string) => {
        if (input.endsWith("/hsk/bands")) {
          return json({ items: [{ band: 1, displayBand: "HSK 1", count: 1 }] });
        }
        return json({
          items: [
            {
              id: "word-1",
              hskBand: 1,
              sourceOrder: 1,
              simplified: "爱",
              pinyin: "ài",
              sinoViet: null,
              primaryMeaning: "yêu",
              importStatus: "ready",
            },
          ],
          nextCursor: null,
        });
      }),
    );
    render(
      <MemoryRouter>
        <HskPage />
      </MemoryRouter>,
    );
    const search = await screen.findByRole("textbox", {
      name: "Tìm chữ Hán, Pinyin, Hán Việt hoặc nghĩa",
    });
    fireEvent.change(search, { target: { value: "  你好  " } });
    fireEvent.click(screen.getByRole("button", { name: "Tìm" }));
    expect(await screen.findByText("yêu")).not.toBeNull();
  });

  it("builds optional HSK query parameters", async () => {
    const fetchMock = vi.fn(() => json({ items: [], nextCursor: null }));
    vi.stubGlobal("fetch", fetchMock);
    await hskApi.listVocabulary({ query: "你好" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/hsk/vocabulary?limit=24&query=%E4%BD%A0%E5%A5%BD",
      ),
      expect.anything(),
    );
  });

  it("renders a detailed HSK word and retries a failed detail request", async () => {
    const detail = {
      id: "word-1",
      hskBand: 7,
      sourceOrder: 1,
      simplified: "你好",
      traditional: "你好",
      pinyin: "nǐ hǎo",
      sinoViet: null,
      primaryMeaning: "xin chào",
      importStatus: "ready" as const,
      frequency: null,
      senses: ["xin chào"],
    };
    let attempts = 0;
    const fetchMock = vi.fn(() => {
      attempts += 1;
      return attempts === 1
        ? json({ error: { message: "Không thể tải từ." } }, 500)
        : json(detail);
    });
    vi.stubGlobal("fetch", fetchMock);
    const view = render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/hsk/vocabulary/word-1"]}>
          <Routes>
            <Route path="/hsk/vocabulary/:id" element={<HskVocabularyPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );
    expect(await screen.findByText("Không thể tải từ.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByRole("heading", { name: "你好" })).not.toBeNull();
    expect(screen.queryByText("Hán Việt: ")).toBeNull();
    expect(screen.getByText("xin chào")).not.toBeNull();
    view.unmount();

    const reviewedWord = {
      ...detail,
      traditional: "妳好",
      sinoViet: "Nhĩ hảo",
      importStatus: "needs_review" as const,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json(reviewedWord)),
    );
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={["/hsk/vocabulary/word-1"]}>
          <Routes>
            <Route path="/hsk/vocabulary/:id" element={<HskVocabularyPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );
    expect(await screen.findByText("Phồn thể: 妳好")).not.toBeNull();
    expect(screen.getByText("Hán Việt: Nhĩ hảo")).not.toBeNull();
    expect(
      screen.getByText(
        "Một phần dữ liệu nguồn của từ này đang cần được rà soát.",
      ),
    ).not.toBeNull();
  });
});
