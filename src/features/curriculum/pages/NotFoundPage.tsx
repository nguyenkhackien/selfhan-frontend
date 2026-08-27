import { Link } from "react-router";
import { PageFrame } from "@/shared/components";

export function NotFoundPage() {
  return (
    <PageFrame title="Không tìm thấy trang">
      <p className="lead">Đường dẫn này không thuộc SelfHan.</p>
      <Link className="button button--primary" to="/">
        Về trang chủ
      </Link>
    </PageFrame>
  );
}
