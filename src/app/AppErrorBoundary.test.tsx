import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "./AppErrorBoundary";

describe("AppErrorBoundary", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows a fallback and retries rendering its child", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let shouldThrow = true;

    function RecoverableChild() {
      if (shouldThrow) {
        throw new Error("temporary render failure");
      }

      return <p>Nội dung đã khôi phục</p>;
    }

    render(
      <AppErrorBoundary>
        <RecoverableChild />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "SelfHan cần thử lại" }),
    ).not.toBeNull();
    shouldThrow = false;

    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(screen.getByText("Nội dung đã khôi phục")).not.toBeNull();
  });
});
