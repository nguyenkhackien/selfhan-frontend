import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/features/auth";
import { curriculumApi } from "@/features/curriculum";
import { setAccessToken } from "./httpClient";

describe("SelfHan API client", () => {
  afterEach(() => {
    setAccessToken(null);
    vi.unstubAllGlobals();
  });

  it("sends JSON and credentialed public requests", async () => {
    const fetchMock = vi.fn<
      (input: string, init?: RequestInit) => Promise<Response>
    >(() => Promise.resolve(new Response(JSON.stringify({ items: [] }))));
    vi.stubGlobal("fetch", fetchMock);
    await expect(curriculumApi.listLevels()).resolves.toEqual({ items: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/levels"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("sends an access token and accepts a no-content logout", async () => {
    const fetchMock = vi.fn<
      (input: string, init?: RequestInit) => Promise<Response>
    >(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken("access-token");
    await expect(authApi.logout()).resolves.toBeUndefined();
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get("authorization")).toBe("Bearer access-token");
  });

  it("returns the safe backend envelope as an ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error: {
                code: "INVALID_CREDENTIALS",
                message: "Sai email hoặc mật khẩu.",
              },
            }),
            { status: 401 },
          ),
        ),
      ),
    );
    await expect(
      authApi.login("a@example.com", "long-password"),
    ).rejects.toMatchObject({
      status: 401,
      detail: { code: "INVALID_CREDENTIALS" },
    });
  });

  it("maps network failures to a retryable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    await expect(curriculumApi.getLesson("hello")).rejects.toMatchObject({
      status: 0,
      detail: { code: "NETWORK_ERROR" },
    });
  });
});
