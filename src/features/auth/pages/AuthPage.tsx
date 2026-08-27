import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { BackLink } from "@/shared/components";
import type { AuthState } from "../hooks/useAuth";

export function AuthPage({
  auth,
  mode,
}: {
  auth: AuthState;
  mode: "login" | "register";
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) await auth.register(email, password);
      else await auth.login(email, password);
      navigate("/levels");
    } catch {
      /* Inline error is stored by useAuth. */
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="auth-page">
      <section className="auth-card">
        <BackLink to="/">Trang chủ</BackLink>
        <p className="eyebrow">
          {isRegister ? "BẮT ĐẦU HÀNH TRÌNH" : "CHÀO MỪNG TRỞ LẠI"}
        </p>
        <h1>{isRegister ? "Tạo tài khoản học" : "Đăng nhập SelfHan"}</h1>
        <p>
          {isRegister
            ? "Dùng email để lưu hành trình học của bạn giữa các thiết bị."
            : "Tiếp tục lộ trình tiếng Trung của bạn."}
        </p>
        <form onSubmit={(event) => void submit(event)} noValidate>
          <label>
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={12}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              aria-describedby={isRegister ? "password-help" : undefined}
            />
          </label>
          {isRegister && (
            <p id="password-help" className="form-help">
              Ít nhất 12 ký tự.
            </p>
          )}
          {auth.error && (
            <div className="form-error" role="alert">
              {auth.error}
            </div>
          )}
          <button
            className="button button--primary button--wide"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? "Đang xử lý…"
              : isRegister
                ? "Tạo tài khoản"
                : "Đăng nhập"}
            <ArrowRight aria-hidden="true" size={17} />
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Đăng nhập" : "Tạo tài khoản"}
          </Link>
        </p>
      </section>
    </div>
  );
}
