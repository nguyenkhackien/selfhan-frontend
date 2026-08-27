import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api/httpClient";

export interface RemoteResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload(): void;
}

function messageFrom(error: unknown) {
  return error instanceof ApiError
    ? error.detail.message
    : "Nội dung chưa thể tải. Hãy thử lại sau ít phút.";
}

export function useRemoteResource<T>(
  load: () => Promise<T>,
  key: string,
): RemoteResource<T> {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<Omit<RemoteResource<T>, "reload">>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let current = true;
    void Promise.resolve()
      .then(load)
      .then(
        (data) => current && setState({ data, loading: false, error: null }),
      )
      .catch(
        (error: unknown) =>
          current &&
          setState({ data: null, loading: false, error: messageFrom(error) }),
      );
    return () => {
      current = false;
    };
  }, [key, load, revision]);

  return {
    ...state,
    reload: () => {
      setState((current) => ({ ...current, loading: true, error: null }));
      setRevision((value) => value + 1);
    },
  };
}
