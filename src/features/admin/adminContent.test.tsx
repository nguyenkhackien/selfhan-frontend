import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { AdminContentPage } from "./pages/AdminContentPage";

const auth = {
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "admin" as const,
    createdAt: "2026-08-29",
  },
  restoring: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const learnerAuth = {
  ...auth,
  user: { ...auth.user, role: "learner" as const },
};

function response(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

describe("admin content navigation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("announces the active resource selection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify([]), { status: 200 })),
      ),
    );
    render(
      <MemoryRouter>
        <AdminContentPage auth={auth} />
      </MemoryRouter>,
    );

    const group = await screen.findByRole("group", { name: "Loại nội dung" });
    const levels = screen.getByRole("button", { name: "Cấp độ" });
    const units = screen.getByRole("button", { name: "Chủ đề" });
    expect(group).not.toBeNull();
    expect(levels.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(units);
    expect(units.getAttribute("aria-pressed")).toBe("true");
    expect(levels.getAttribute("aria-pressed")).toBe("false");
  });

  it("protects the workspace from non-admin users", () => {
    render(
      <MemoryRouter>
        <AdminContentPage auth={learnerAuth} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("link", { name: "Về không gian học" }),
    ).not.toBeNull();
  });

  it("covers create, edit, archive, and resource switching states", async () => {
    const records = [
      { id: "title", title: "Level", slug: "level", status: "published" },
      { id: "hanzi", hanzi: "你好", status: "archived" },
      { id: "prompt", prompt: "Prompt", status: "published" },
      { id: "label", label: "Label", status: "published" },
      { id: "slug", slug: "slug", status: "published" },
      { id: "fallback", status: "published" },
    ];
    let archiveFails = false;
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      if (input.endsWith("/admin/units")) return response([]);
      if (input.endsWith("/admin/levels") && init?.method === "POST") {
        return response({ id: "created", title: "Created" });
      }
      if (input.endsWith("/admin/levels/title") && init?.method === "PATCH") {
        return response({ id: "title", title: "Updated" });
      }
      if (
        input.endsWith("/admin/levels/title/archive") &&
        init?.method === "POST"
      ) {
        return archiveFails
          ? response({ error: { message: "Không thể lưu trữ." } }, 500)
          : response({ id: "title", status: "archived" });
      }
      if (input.endsWith("/admin/levels")) return response(records);
      return response({ error: { message: "Không tìm thấy." } }, 404);
    });
    vi.stubGlobal("fetch", fetchMock);
    const confirmMock = vi.spyOn(window, "confirm");

    render(
      <MemoryRouter>
        <AdminContentPage auth={auth} />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Level")).not.toBeNull();
    const listRequestsBeforeCreate = fetchMock.mock.calls.filter(
      ([input, init]) => input.endsWith("/admin/levels") && !init?.method,
    ).length;

    fireEvent.click(screen.getByRole("button", { name: "Tạo mới" }));
    const editor = screen.getByLabelText("Dữ liệu JSON");
    fireEvent.change(editor, { target: { value: "[]" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu nội dung" }));
    expect(
      await screen.findByText("Dữ liệu phải là một JSON object hợp lệ."),
    ).not.toBeNull();

    fireEvent.change(editor, { target: { value: '{"title":"Created"}' } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu nội dung" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Tạo bản ghi mới" }),
      ).toBeNull();
    });
    const listRequestsAfterCreate = fetchMock.mock.calls.filter(
      ([input, init]) => input.endsWith("/admin/levels") && !init?.method,
    ).length;
    expect(listRequestsAfterCreate).toBe(listRequestsBeforeCreate + 1);

    fireEvent.click(screen.getAllByRole("button", { name: "Sửa" })[0]!);
    expect(
      screen.getByRole("heading", { name: "Chỉnh sửa bản ghi" }),
    ).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Dữ liệu JSON"), {
      target: { value: '{"title":"Updated"}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu nội dung" }));
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Chỉnh sửa bản ghi" }),
      ).toBeNull();
    });

    confirmMock.mockReturnValueOnce(false);
    fireEvent.click(screen.getAllByRole("button", { name: "Lưu trữ" })[0]!);
    expect(confirmMock).toHaveBeenCalled();

    confirmMock.mockReturnValueOnce(true);
    fireEvent.click(screen.getAllByRole("button", { name: "Lưu trữ" })[0]!);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/admin/levels/title/archive"),
        expect.objectContaining({ method: "POST" }),
      ),
    );

    archiveFails = true;
    confirmMock.mockReturnValueOnce(true);
    fireEvent.click(screen.getAllByRole("button", { name: "Lưu trữ" })[0]!);
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Không thể lưu trữ.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Chủ đề" }));
    expect(await screen.findByText("Chưa có bản ghi")).not.toBeNull();
  });

  it("shows retryable list and form save errors", async () => {
    let listAttempts = 0;
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      if (input.endsWith("/admin/levels") && !init?.method) {
        listAttempts += 1;
        return listAttempts === 1
          ? response({ error: { message: "Không thể tải danh sách." } }, 500)
          : response([]);
      }
      if (input.endsWith("/admin/levels") && init?.method === "POST") {
        return response({ error: { message: "Không thể lưu nội dung." } }, 500);
      }
      return response([]);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <AdminContentPage auth={auth} />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Không thể tải danh sách.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Chưa có bản ghi")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Tạo mới" }));
    fireEvent.change(screen.getByLabelText("Dữ liệu JSON"), {
      target: { value: '{"title":"Will fail"}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu nội dung" }));
    expect(await screen.findByText("Không thể lưu nội dung.")).not.toBeNull();
  });
});
