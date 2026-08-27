import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SelfHan render failure", error, info);
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="system-message" role="alert">
          <p className="eyebrow">TẠM DỪNG MỘT NHỊP</p>
          <h1>SelfHan cần thử lại</h1>
          <p>
            Có điều gì đó chưa ổn khi hiển thị không gian học. Bạn có thể thử
            tải lại nội dung ngay bây giờ.
          </p>
          <button className="button button--primary" onClick={this.retry}>
            Thử lại
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
