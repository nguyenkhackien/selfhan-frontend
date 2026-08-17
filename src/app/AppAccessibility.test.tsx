import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function useMobileViewport() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 760px)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function useResizableMobileViewport() {
  let matches = true;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(max-width: 760px)",
    onchange: null,
    addEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      listeners.add(listener);
    },
    removeEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      listeners.delete(listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  } as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return (nextMatches: boolean) => {
    matches = nextMatches;
    listeners.forEach((listener) =>
      listener({ matches: nextMatches } as MediaQueryListEvent),
    );
  };
}

describe("routed learning experience", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    document.title = "";
    vi.unstubAllGlobals();
  });

  it.each([
    ["/", "Chào buổi sáng, Kien"],
    ["/writing", "Luyện viết"],
    ["/flashcards", "Flashcards"],
    ["/recall", "Luyện nhớ"],
    ["/notes", "Ghi chú"],
    ["/stats", "Thống kê"],
  ])("renders the real page at direct route %s", (path, heading) => {
    window.history.replaceState({}, "", path);

    render(<App />);

    expect(screen.getByRole("heading", { name: heading })).not.toBeNull();
  });

  it("opens learning features from Home cards and shortcuts", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục học/i }));
    expect(screen.getByRole("heading", { name: "Flashcards" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: "Mở bài học du lịch" }));
    expect(screen.getByRole("heading", { name: "Flashcards" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: /Luyện viết/ }));
    expect(screen.getByRole("heading", { name: "Luyện viết" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: /Luyện nhớ/ }));
    expect(screen.getByRole("heading", { name: "Luyện nhớ" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: /Ghi chú/ }));
    expect(screen.getByRole("heading", { name: "Ghi chú" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    const flashcardButtons = screen.getAllByRole("button", {
      name: /^Flashcards/,
    });
    fireEvent.click(flashcardButtons[flashcardButtons.length - 1]!);
    expect(screen.getByRole("heading", { name: "Flashcards" })).not.toBeNull();
  });

  it("sets the routed title and focuses main content after navigation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Writing" }));

    expect(document.title).toBe("Luyện viết | ZenLingo");
    expect(document.activeElement).toBe(
      document.querySelector("main#main-content"),
    );
    expect(
      screen.getByRole("link", { name: "Bỏ qua điều hướng" }),
    ).not.toBeNull();
  });

  it("has no deterministic automated accessibility violations", async () => {
    render(<App />);

    const results = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  });

  it("keeps the closed mobile navigation hidden and restores toggle focus after every dismissal", () => {
    useMobileViewport();
    render(<App />);

    const sidebar = document.getElementById("primary-navigation")!;
    const main = document.querySelector("main#main-content")!;
    const toggle = screen.getByRole("button", { name: "Mở điều hướng" });
    const homeButton = screen.getByRole("button", {
      name: "Home",
      hidden: true,
    });

    expect(sidebar.getAttribute("aria-hidden")).toBe("true");
    expect(homeButton.tabIndex).toBe(-1);

    fireEvent.click(toggle);
    expect(sidebar.getAttribute("aria-hidden")).toBeNull();
    expect(main.getAttribute("aria-hidden")).toBe("true");
    expect(main.hasAttribute("inert")).toBe(true);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Home" }),
    );

    fireEvent.keyDown(document.activeElement!, {
      key: "Tab",
      shiftKey: true,
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Hồ sơ của Kien" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Home" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Đóng điều hướng" }));
    expect(document.activeElement).toBe(toggle);
    expect(main.getAttribute("aria-hidden")).toBeNull();
    expect(main.hasAttribute("inert")).toBe(false);

    fireEvent.click(toggle);
    fireEvent.click(
      screen.getByRole("button", { name: "Đóng menu điều hướng" }),
    );
    expect(document.activeElement).toBe(toggle);
    expect(main.hasAttribute("inert")).toBe(false);

    fireEvent.click(toggle);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(toggle);
    expect(main.getAttribute("aria-hidden")).toBeNull();
  });

  it("leaves desktop navigation and main content exposed and interactive", () => {
    render(<App />);

    const sidebar = document.getElementById("primary-navigation")!;
    const main = document.querySelector("main#main-content")!;

    expect(sidebar.getAttribute("aria-hidden")).toBeNull();
    expect(sidebar.hasAttribute("inert")).toBe(false);
    expect(main.getAttribute("aria-hidden")).toBeNull();
    expect(main.hasAttribute("inert")).toBe(false);
  });

  it("releases the main content when an open mobile drawer resizes to desktop", () => {
    const resize = useResizableMobileViewport();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Mở điều hướng" }));
    const main = document.querySelector("main#main-content")!;
    expect(main.hasAttribute("inert")).toBe(true);

    act(() => resize(false));

    expect(main.hasAttribute("inert")).toBe(false);
    expect(main.getAttribute("aria-hidden")).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Mở điều hướng" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("offers a compact mobile Writing prompt selector with selected state", () => {
    useMobileViewport();
    window.history.replaceState({}, "", "/writing");
    render(<App />);

    const selector = screen.getByRole("combobox", {
      name: "Chọn prompt viết",
    });
    fireEvent.change(selector, { target: { value: "2" } });

    expect(
      screen.getByRole("heading", { name: "Một nơi muốn ghé thăm" }),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: /Một nơi muốn ghé thăm/i })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("exposes only the visible flashcard face and announces selected ratings", () => {
    window.history.replaceState({}, "", "/flashcards");
    render(<App />);

    const front = screen.getByText("serenity").closest(".flashcard__face")!;
    const back = screen.getByText("Sự thanh bình").closest(".flashcard__face")!;
    const flashcard = screen.getByRole("button", {
      name: /Mặt từ serenity.*lật xem nghĩa/i,
    });

    expect(front.getAttribute("aria-hidden")).toBeNull();
    expect(back.getAttribute("aria-hidden")).toBe("true");

    fireEvent.click(flashcard);
    expect(
      screen.getByRole("button", {
        name: /Mặt nghĩa Sự thanh bình.*lật về từ/i,
      }),
    ).not.toBeNull();
    expect(front.getAttribute("aria-hidden")).toBe("true");
    expect(back.getAttribute("aria-hidden")).toBeNull();

    const known = screen.getByRole("button", { name: "Đã biết" });
    fireEvent.click(known);
    expect(known.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain(
      "Đã đánh dấu: biết từ này rồi.",
    );
  });

  it("navigates, rates for review, and resets a Flashcards session", () => {
    window.history.replaceState({}, "", "/flashcards");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Tiếp/ }));
    expect(screen.getByText("meander")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cần ôn lại" }));
    expect(screen.getByRole("status").textContent).toContain(
      "Đã thêm vào danh sách ôn lại.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu lại" }));
    expect(screen.getByText("serenity")).not.toBeNull();
  });

  it("exposes Notes filters as stateful controls", () => {
    window.history.replaceState({}, "", "/notes");
    render(<App />);

    const all = screen.getByRole("button", { name: "Tất cả" });
    const vocabulary = screen.getByRole("button", { name: "Vocabulary" });
    expect(all.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(vocabulary);

    expect(vocabulary.getAttribute("aria-pressed")).toBe("true");
    expect(all.getAttribute("aria-pressed")).toBe("false");
  });

  it("announces a Recall result", () => {
    window.history.replaceState({}, "", "/recall");
    render(<App />);

    fireEvent.change(screen.getByRole("textbox", { name: "Từ tiếng Anh" }), {
      target: { value: "serenity" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra/i }));

    expect(screen.getByRole("status").textContent).toContain("Chính xác!");
  });

  it("supports a Recall retry, hint, keyboard answer, and next word", () => {
    window.history.replaceState({}, "", "/recall");
    render(<App />);

    const answer = screen.getByRole("textbox", { name: "Từ tiếng Anh" });
    fireEvent.change(answer, { target: { value: "peace" } });
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra/i }));
    expect(screen.getByRole("status").textContent).toContain("Chưa đúng");

    fireEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
    expect(screen.getByText(/bắt đầu bằng chữ/).textContent).toContain("S");

    fireEvent.change(answer, { target: { value: " Serenity " } });
    fireEvent.keyDown(answer, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /Từ tiếp theo/i }));

    expect(
      screen.getByRole("heading", { name: "Uốn lượn, đi thong thả" }),
    ).not.toBeNull();
    expect(answer.getAttribute("value")).toBe("");
  });

  it("reflects learned flashcards in Stats", () => {
    window.history.replaceState({}, "", "/flashcards");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Đã biết" }));
    fireEvent.click(screen.getByRole("button", { name: "Stats" }));

    expect(screen.getByRole("heading", { name: "49" })).not.toBeNull();
    expect(
      screen.getByLabelText("Biểu đồ thời gian học trong tuần"),
    ).not.toBeNull();
  });

  it("hydrates mutated progress after unmounting and remounting at a deep URL", () => {
    window.history.replaceState({}, "", "/writing");
    const firstMount = render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Đánh dấu hoàn thành" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Flashcards" }));
    fireEvent.click(screen.getByRole("button", { name: "Đã biết" }));
    firstMount.unmount();

    window.history.replaceState({}, "", "/flashcards");
    render(<App />);

    expect(
      screen
        .getByRole("button", { name: "Đã biết" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Writing" }));
    expect(
      screen.getByRole("button", { name: /Đã hoàn thành/i }),
    ).not.toBeNull();
  });
});
