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

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: "Không thể kết nối máy chủ. Hãy kiểm tra mạng rồi thử lại.",
    });
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload as { error?: ApiErrorShape } | null;
    throw new ApiError(
      response.status,
      error?.error ?? {
        code: "REQUEST_FAILED",
        message: "Yêu cầu chưa thể hoàn tất. Vui lòng thử lại.",
      },
    );
  }
  return payload as T;
}
