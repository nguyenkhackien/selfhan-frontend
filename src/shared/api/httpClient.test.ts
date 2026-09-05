import { AxiosError } from "axios";
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it } from "vitest";
import { authApi } from "@/features/auth";
import { curriculumApi } from "@/features/curriculum";
import { apiClient, apiTimeoutMs, setAccessToken } from "./httpClient";

const defaultAdapter = apiClient.defaults.adapter;

function response<T>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T,
): AxiosResponse<T> {
  return { config, data, status, statusText: "OK", headers: {} };
}

describe("SelfHan API client", () => {
  afterEach(() => {
    setAccessToken(null);
    apiClient.defaults.adapter = defaultAdapter;
  });

  it("sends credentialed JSON requests through the configured Axios instance", async () => {
    let receivedConfig: InternalAxiosRequestConfig | undefined;
    const adapter: AxiosAdapter = async (config) => {
      receivedConfig = config;
      return response(config, 200, {
        accessToken: "access-token",
        user: { id: "user-1", email: "a@example.com", role: "learner" },
      });
    };
    apiClient.defaults.adapter = adapter;

    await expect(
      authApi.login("a@example.com", "long-password"),
    ).resolves.toMatchObject({
      accessToken: "access-token",
    });

    expect(receivedConfig).toMatchObject({
      baseURL: apiClient.defaults.baseURL,
      method: "post",
      url: "/auth/login",
      timeout: apiTimeoutMs,
      withCredentials: true,
    });
    expect(receivedConfig?.headers.getAccept()).toBe("application/json");
    expect(receivedConfig?.headers.getContentType()).toBe("application/json");
    expect(JSON.parse(String(receivedConfig?.data))).toEqual({
      email: "a@example.com",
      password: "long-password",
    });
  });

  it("sends an access token and accepts a no-content logout", async () => {
    let receivedConfig: InternalAxiosRequestConfig | undefined;
    apiClient.defaults.adapter = async (config) => {
      receivedConfig = config;
      return response(config, 204, undefined);
    };
    setAccessToken("access-token");
    await expect(authApi.logout()).resolves.toBeUndefined();
    expect(receivedConfig?.headers.getAuthorization()).toBe(
      "Bearer access-token",
    );
  });

  it("returns the safe backend envelope as an ApiError", async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Unauthorized",
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response(config, 401, {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Sai email hoặc mật khẩu.",
            requestId: "req-123",
          },
        }),
      );
    };
    await expect(
      authApi.login("a@example.com", "long-password"),
    ).rejects.toMatchObject({
      status: 401,
      detail: { code: "INVALID_CREDENTIALS", requestId: "req-123" },
    });
  });

  it("maps network failures to a retryable error", async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError("offline", AxiosError.ERR_NETWORK, config);
    };
    await expect(curriculumApi.getLesson("hello")).rejects.toMatchObject({
      status: 0,
      detail: { code: "NETWORK_ERROR" },
    });
  });
});
