import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { authApi } from "@/features/auth";

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

  it("opens and closes the mobile dialog", () => {
    installApi();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Mở điều hướng" }));
    expect(screen.getByRole("dialog", { name: "Điều hướng" })).not.toBeNull();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Đóng điều hướng" })[0]!,
    );
    expect(screen.queryByRole("dialog", { name: "Điều hướng" })).toBeNull();
  });
});
