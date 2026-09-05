import axios from "axios";
import type { AxiosRequestConfig } from "axios";

export interface ApiErrorShape {
  code: string;
  message: string;
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: ApiErrorShape,
  ) {
    super(detail.message);
    this.name = "ApiError";
  }
}

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const apiBaseUrl = (
  configuredBaseUrl || "http://localhost:3000/api/v1"
).replace(/\/$/, "");

export const apiTimeoutMs = 15_000;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeoutMs,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.setAuthorization(`Bearer ${accessToken}`);
  }
  return config;
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getBackendError(payload: unknown): ApiErrorShape | null {
  if (!isRecord(payload) || !isRecord(payload.error)) return null;

  const { code, message, requestId } = payload.error;
  if (code !== undefined && typeof code !== "string") return null;
  if (typeof message !== "string") return null;
  if (requestId !== undefined && typeof requestId !== "string") return null;

  return {
    code: typeof code === "string" ? code : "REQUEST_FAILED",
    message,
    ...(requestId ? { requestId } : {}),
  };
}

function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "Không thể kết nối máy chủ. Hãy kiểm tra mạng rồi thử lại.",
    });
  }

  const backendError = getBackendError(error.response?.data);
  return new ApiError(
    error.response?.status ?? 0,
    backendError ?? {
      code: error.response ? "REQUEST_FAILED" : "NETWORK_ERROR",
      message: error.response
        ? "Yêu cầu chưa thể hoàn tất. Vui lòng thử lại."
        : "Không thể kết nối máy chủ. Hãy kiểm tra mạng rồi thử lại.",
    },
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

export async function request<T>(
  path: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const response = await apiClient.request<T>({ ...config, url: path });
  return response.status === 204 ? (undefined as T) : response.data;
}
