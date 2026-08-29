import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import App from "../App";
import { authApi } from "@/features/auth";
import { AppLayout } from "@/layouts/AppLayout";

const level = {
  id: "level",
  slug: "starter",
  title: "Nhập môn",
  description: "Bắt đầu.",
  sortOrder: 1,
};
const unit = {
  id: "unit",
  slug: "greetings",
  title: "Chào hỏi",
  description: "Lời chào.",
  sortOrder: 1,
};
const lesson = {
  id: "lesson",
  slug: "hello",
  title: "Nói xin chào",
  summary: "Bài đầu tiên.",
  writingCharacter: null,
  sortOrder: 1,
};
const user = {
  id: "user",
  email: "hoc@example.com",
  role: "learner",
  createdAt: "2026-01-01",
};

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}
function installApi({
  empty = false,
  loginError = false,
}: { empty?: boolean; loginError?: boolean } = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: string) => {
      if (input.endsWith("/auth/refresh"))
        return json({ error: { message: "No session" } }, 401);
      if (input.endsWith("/auth/login"))
        return loginError
          ? json({ error: { message: "Sai thông tin đăng nhập." } }, 401)
          : json({ accessToken: "token", user });
      if (input.endsWith("/auth/register"))
        return json({ accessToken: "token", user });
      if (input.endsWith("/auth/logout"))
        return Promise.resolve(new Response(null, { status: 204 }));
      if (input.endsWith("/levels/starter"))
        return json({ ...level, units: empty ? [] : [unit] });
      if (input.endsWith("/units/greetings"))
        return json({ ...unit, lessons: empty ? [] : [lesson] });
      if (input.endsWith("/lessons/hello"))
        return json({ ...lesson, vocabulary: [], grammarPoints: [] });
      if (input.endsWith("/levels"))
        return json({ items: empty ? [] : [level] });
      return json({ error: { message: "Không tìm thấy." } }, 404);
    }),
  );
}

describe("SelfHan learner flows", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    window.history.replaceState({}, "", "/");
  });

  it("renders empty catalogue and hierarchy empty states", async () => {
    installApi({ empty: true });
    window.history.replaceState({}, "", "/levels");
    render(<App />);
    expect(
      await screen.findByText("Chưa có Level nào được xuất bản."),
    ).not.toBeNull();
    cleanup();
    window.history.replaceState({}, "", "/levels/starter");
    render(<App />);
    expect(
      await screen.findByText("Level này chưa có Unit được xuất bản."),
    ).not.toBeNull();
  });

  it("renders a unit, lesson empty study content, and no canvas when character is missing", async () => {
    installApi();
    window.history.replaceState({}, "", "/units/greetings");
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Chào hỏi" }),
    ).not.toBeNull();
    expect(screen.getByRole("link", { name: /Nói xin chào/i })).not.toBeNull();
    cleanup();
    window.history.replaceState({}, "", "/lessons/hello");
    render(<App />);
    expect(
      await screen.findByText("Bài học này chưa có từ vựng."),
    ).not.toBeNull();
    expect(screen.queryByLabelText(/Khung tập viết/)).toBeNull();
  });

  it("logs in and redirects to the catalogue", async () => {
    installApi();
    window.history.replaceState({}, "", "/login");
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "long-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(
      await screen.findByRole("heading", { name: "Các Level đang mở" }),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: /Đăng xuất/ })).not.toBeNull();
  });

  it("keeps an inline backend error on unsuccessful login", async () => {
    installApi({ loginError: true });
    window.history.replaceState({}, "", "/login");
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "long-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Sai thông tin đăng nhập.",
    );
  });

  it("validates auth fields before sending credentials", () => {
    installApi();
    window.history.replaceState({}, "", "/login");
    render(<App />);
    const email = screen.getByRole("textbox", { name: "Email" });

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(screen.getByText("Vui lòng nhập email.")).not.toBeNull();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).not.toBeNull();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(email);
  });

  it("supports showing and hiding the password field", () => {
    installApi();
    window.history.replaceState({}, "", "/login");
    render(<App />);
    const password = screen.getByLabelText("Mật khẩu");

    expect(password.getAttribute("type")).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    expect(password.getAttribute("type")).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: "Ẩn mật khẩu" }));
    expect(password.getAttribute("type")).toBe("password");
  });

  it("uses a safe fallback message for an unexpected auth failure", async () => {
    installApi();
    vi.spyOn(authApi, "login").mockRejectedValue(new Error("offline"));
    window.history.replaceState({}, "", "/login");
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "long-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Không thể hoàn tất thao tác.",
    );
  });

  it("registers a learner and supports logout", async () => {
    installApi();
    window.history.replaceState({}, "", "/register");
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "long-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(
      await screen.findByRole("button", { name: /Đăng xuất/ }),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Đăng xuất/ }));
    expect(
      await screen.findByRole("link", { name: "Đăng nhập" }),
    ).not.toBeNull();
  });

  it("shows a not-found route", () => {
    installApi();
    window.history.replaceState({}, "", "/khong-co-trang");
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Không tìm thấy trang" }),
    ).not.toBeNull();
  });

  it("selects and retains an accessible color theme", () => {
    installApi();
    window.localStorage.setItem("selfhan-theme", "not-a-theme");
    window.history.replaceState({}, "", "/settings");
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Cài đặt giao diện" }),
    ).not.toBeNull();
    expect(screen.getByRole("radio", { name: /Sage/ })).toHaveProperty(
      "checked",
      true,
    );
    fireEvent.click(screen.getByRole("radio", { name: /Terracotta/ }));
    expect(screen.getByRole("radio", { name: /Terracotta/ })).toHaveProperty(
      "checked",
      true,
    );
    expect(document.documentElement.dataset.theme).toBe("terracotta");
    expect(window.localStorage.getItem("selfhan-theme")).toBe("terracotta");
  });

  it("opens and closes the mobile dialog", () => {
    installApi();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Mở điều hướng" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog", { name: "Điều hướng" })).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Điều hướng" })).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(trigger);
  });

  it("sends the how-it-works link to the home section", () => {
    installApi();
    window.history.replaceState({}, "", "/levels");
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: "Cách học" }));

    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe("#how-it-works");
  });

  it("moves keyboard focus to the main content from the skip link", () => {
    installApi();
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: "Bỏ qua điều hướng" }));

    expect(document.activeElement).toBe(
      document.getElementById("main-content"),
    );
  });

  it("keeps an authenticated admin drawer keyboard-operable", () => {
    const logout = vi.fn();
    const adminAuth = {
      user: {
        id: "admin",
        email: "admin@example.com",
        role: "admin" as const,
        createdAt: "2026-01-01",
      },
      restoring: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout,
    };
    render(
      <MemoryRouter>
        <AppLayout auth={adminAuth} />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole("button", { name: "Mở điều hướng" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Điều hướng" });
    const closeButtons = screen.getAllByRole("button", {
      name: "Đóng điều hướng",
    });
    const closeButton = closeButtons[closeButtons.length - 1]!;
    expect(document.activeElement).toBe(closeButton);
    expect(screen.getAllByRole("link", { name: "Quản trị" })).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "Không gian học" }),
    ).toHaveLength(2);

    fireEvent.keyDown(document, { key: "ArrowDown" });
    const menuContent = dialog.querySelector(".mobile-menu-content")!;
    const focusable = Array.from(
      menuContent.querySelectorAll<HTMLElement>("a[href], button"),
    );
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog", { name: "Điều hướng" })).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Đóng điều hướng" })[0]!,
    );
    expect(screen.queryByRole("dialog", { name: "Điều hướng" })).toBeNull();

    fireEvent.click(trigger);
    fireEvent.click(screen.getAllByRole("button", { name: "Đăng xuất" })[1]!);
    expect(logout).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Điều hướng" })).toBeNull();
  });
});
