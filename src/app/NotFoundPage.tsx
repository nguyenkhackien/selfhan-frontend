import { useState } from "react";
import { Navigate } from "react-router";
import { toPagePath } from "../config/navigation";

export function NotFoundPage() {
  const [returnHome, setReturnHome] = useState(false);

  if (returnHome) {
    return <Navigate replace to={toPagePath("home")} />;
  }

  return (
    <section className="system-message">
      <p className="eyebrow">LẠC MỘT CHÚT</p>
      <h1>Không tìm thấy trang</h1>
      <p>Trang này không tồn tại, nhưng không gian học của bạn vẫn ở đây.</p>
      <button
        className="button button--primary"
        onClick={() => setReturnHome(true)}
      >
        Về trang chủ
      </button>
    </section>
  );
}
