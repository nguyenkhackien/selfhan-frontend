import type { ReactNode } from "react";

export function LoadingState({
  label = "Đang tải nội dung",
}: {
  label?: string;
}) {
  return (
    <div className="status-card" role="status" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      <p>{label}…</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry(): void;
}) {
  return (
    <div className="status-card status-card--error" role="alert">
      <p>{message}</p>
      <button
        className="button button--secondary"
        type="button"
        onClick={onRetry}
      >
        Thử lại
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="status-card">
      <p>{children}</p>
    </div>
  );
}
