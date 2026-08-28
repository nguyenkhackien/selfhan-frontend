import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { WordWritingPractice } from "./components/WordWritingPractice";
import { HskPage } from "./pages/HskPage";

const writerMocks = vi.hoisted(() => ({
  animateCharacter: vi.fn(),
  create: vi.fn(),
}));

vi.mock("hanzi-writer", () => ({
  default: { create: writerMocks.create },
}));

function json(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body)));
}

describe("HSK learner components", () => {
  beforeEach(() => {
    writerMocks.animateCharacter.mockReset();
    writerMocks.create.mockReset();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
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

    render(<WordWritingPractice word="你好" />);

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
    expect(screen.getByLabelText("Khung tập viết chữ 你")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "White paper" }));
    expect(screen.getByLabelText("Khung tập viết chữ 你")).not.toBeNull();
    expect(
      screen.getByText("Giấy trắng chia bốn ô để bạn tự tập viết chữ 你."),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Chữ tiếp" }));
    expect(
      screen.getByRole("button", { name: "好", pressed: true }),
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

    render(<WordWritingPractice word="你" />);

    expect(
      await screen.findByText("Chưa có dữ liệu nét cục bộ cho chữ này."),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Xem lại thứ tự nét" }),
    ).not.toBeNull();
  });
});
