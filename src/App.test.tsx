import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import { createInitialLearningState } from "./features/learning-hub/learningHubReducer";
import { LEARNING_HUB_STORAGE_KEY } from "./features/learning-hub/learningHubStorage";

describe("ZenLingo app", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("changes sections and keeps a completed goal visibly checked", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: /Viết một đoạn ngắn/i }),
    );
    expect(screen.getByText("Hoàn thành 3 / 3 mục tiêu")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Flashcards" }));
    expect(screen.getByRole("heading", { name: "Flashcards" })).not.toBeNull();
  });

  it("keeps writing completion status after navigating away and back", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Writing" }));
    expect(window.location.pathname).toBe("/writing");

    fireEvent.click(
      screen.getByRole("button", { name: /Đánh dấu hoàn thành/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(window.location.pathname).toBe("/");

    fireEvent.click(screen.getByRole("button", { name: "Writing" }));

    expect(
      screen.getByRole("button", { name: /Đã hoàn thành/i }),
    ).not.toBeNull();
  });

  it("offers keyboard users a skip link to the routed page content", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: "Bỏ qua điều hướng" }),
    ).toHaveProperty("hash", "#main-content");
    expect(document.querySelector("main#main-content")).not.toBeNull();
  });

  it("renders a helpful fallback for an unknown route and returns home", () => {
    window.history.replaceState({}, "", "/khong-ton-tai");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Không tìm thấy trang" }),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Về trang chủ" }));

    expect(window.location.pathname).toBe("/");
    expect(
      screen.getByRole("heading", { name: "Chào buổi sáng, Kien" }),
    ).not.toBeNull();
  });

  it("announces the mobile navigation state", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Mở điều hướng" }));

    const menuControl = screen.getByRole("button", {
      name: "Đóng điều hướng",
    });
    expect(menuControl.getAttribute("aria-expanded")).toBe("true");
    expect(menuControl.getAttribute("aria-controls")).toBe(
      "primary-navigation",
    );
  });

  it("filters notes by title, content, and category, then supports keyboard dialog controls", () => {
    const state = createInitialLearningState();
    window.localStorage.setItem(
      LEARNING_HUB_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          goals: state.goals.map(({ id, done }) => ({ id, done })),
          cardIndex: state.cardIndex,
          knownCardRatings: state.knownCardRatings,
          recallIndex: state.recallIndex,
          notes: [
            {
              id: 99,
              title: "Ôn lại Serenity",
              content: "Dùng từ này trong bài viết tối nay.",
              category: "Vocabulary",
              date: "Vừa xong",
            },
            {
              id: 100,
              title: "Bản nháp buổi sáng",
              content: "Viết về candlelight trong quán cà phê.",
              category: "Writing",
              date: "Hôm qua",
            },
            {
              id: 101,
              title: "Ghi chú cấu trúc",
              content: "Nhìn lại trật tự từ trong câu.",
              category: "Grammar",
              date: "12 thg 8",
            },
          ],
        },
      }),
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Tìm trong ghi chú" }),
      {
        target: { value: "SERENITY" },
      },
    );

    expect(
      screen.getByRole("heading", { name: "Ôn lại Serenity" }),
    ).not.toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Tìm trong ghi chú" }),
      {
        target: { value: "CANDLELIGHT" },
      },
    );
    expect(
      screen.getByRole("heading", { name: "Bản nháp buổi sáng" }),
    ).not.toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Tìm trong ghi chú" }),
      {
        target: { value: "GRAMMAR" },
      },
    );
    expect(
      screen.getByRole("heading", { name: "Ghi chú cấu trúc" }),
    ).not.toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Tìm trong ghi chú" }),
      {
        target: { value: "SERENITY" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    expect(
      screen.queryByRole("heading", { name: "Bản nháp buổi sáng" }),
    ).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);

    const opener = screen.getByRole("button", { name: /Mở ghi chú/i });
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Ôn lại Serenity" });
    const closeButton = screen.getByRole("button", { name: "Đóng ghi chú" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.click(closeButton);

    expect(
      screen.queryByRole("dialog", { name: "Ôn lại Serenity" }),
    ).toBeNull();
    expect(document.activeElement).toBe(opener);

    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);

    fireEvent.change(
      screen.getByRole("textbox", { name: "Tìm trong ghi chú" }),
      {
        target: { value: "không có ghi chú này" },
      },
    );

    expect(screen.getByText("Không tìm thấy ghi chú phù hợp.")).not.toBeNull();
  });
});
