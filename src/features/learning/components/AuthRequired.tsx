import type { ReactNode } from "react";
import { Link } from "react-router";

export function AuthRequired({
  children,
  signedIn,
}: {
  children: ReactNode;
  signedIn: boolean;
}) {
  if (signedIn) return <>{children}</>;
  return (
    <section className="learner-empty-state">
      <h2>Đăng nhập để lưu tiến độ</h2>
      <p>
        Quiz, ôn tập cách quãng và chuỗi ngày học được đồng bộ theo tài khoản
        của bạn.
      </p>
      <Link className="button button--primary" to="/login">
        Đăng nhập
      </Link>
    </section>
  );
}
