import { request } from "@/shared/api/httpClient";
import type { AuthResponse, User } from "../types/auth";

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      data: { email, password },
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      data: { email, password },
    }),
  refresh: () => request<AuthResponse>("/auth/refresh", { method: "POST" }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
};
