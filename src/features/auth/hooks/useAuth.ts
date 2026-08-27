import { useEffect, useState } from "react";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";
import { authApi } from "../api/authApi";
import type { User } from "../types/auth";

export interface AuthState {
  user: User | null;
  restoring: boolean;
  error: string | null;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

function toMessage(error: unknown) {
  return error instanceof ApiError
    ? error.detail.message
    : "Không thể hoàn tất thao tác. Vui lòng thử lại.";
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void authApi
      .refresh()
      .then((result) => {
        if (!active) return;
        setAccessToken(result.accessToken);
        setUser(result.user);
      })
      .catch(() => setAccessToken(null))
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const authenticate = async (
    action: () => ReturnType<typeof authApi.login>,
  ) => {
    setError(null);
    try {
      const result = await action();
      setAccessToken(result.accessToken);
      setUser(result.user);
    } catch (caught) {
      setError(toMessage(caught));
      throw caught;
    }
  };
  const login = (email: string, password: string) =>
    authenticate(() => authApi.login(email, password));
  const register = (email: string, password: string) =>
    authenticate(() => authApi.register(email, password));
  const logout = async () => {
    setError(null);
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return { user, restoring, error, login, register, logout };
}
