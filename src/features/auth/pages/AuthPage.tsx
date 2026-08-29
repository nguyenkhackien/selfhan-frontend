import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { BackLink } from "@/shared/components";
import type { AuthState } from "../hooks/useAuth";

interface FieldErrors {
  email?: string;
  password?: string;
}

function validateAuth(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const normalizedEmail = email.trim();
  if (!normalizedEmail) errors.email = "Vui lòng nhập email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Vui lòng nhập email hợp lệ.";
  }
  if (!password) errors.password = "Vui lòng nhập mật khẩu.";
  else if (password.length < 12) {
    errors.password = "Mật khẩu cần ít nhất 12 ký tự.";
  }
  return errors;
}

function localizeAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("request validation failed") ||
    normalized.includes("validation failed")
  ) {
    return "Thông tin đăng nhập chưa hợp lệ. Vui lòng kiểm tra lại.";
  }
  if (
    normalized.includes("invalid credentials") ||
    normalized.includes("incorrect password")
  ) {
    return "Email hoặc mật khẩu không đúng.";
  }
  if (
    normalized.includes("already exists") ||
    normalized.includes("duplicate")
  ) {
    return "Email này đã được đăng ký. Hãy thử đăng nhập.";
  }
  return message;
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);
  const isRegister = mode === "register";
  useEffect(() => {
    if (auth.error) formErrorRef.current?.focus();
  }, [auth.error]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateAuth(email, password);
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      if (errors.email) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }
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
          <div className="form-field">
            <label htmlFor="auth-email">Email</label>
            <input
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              id="auth-email"
              name="email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              required
            />
            {fieldErrors.email && (
              <p id="email-error" className="form-field-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="auth-password">Mật khẩu</label>
            <div className="password-field">
              <input
                aria-describedby={
                  [
                    isRegister ? "password-help" : null,
                    fieldErrors.password ? "password-error" : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={Boolean(fieldErrors.password)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                id="auth-password"
                minLength={12}
                name="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    password: undefined,
                  }));
                }}
                required
              />
              <button
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPassword}
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={19} />
                ) : (
                  <Eye aria-hidden="true" size={19} />
                )}
              </button>
            </div>
            {isRegister && (
              <p id="password-help" className="form-help">
                Ít nhất 12 ký tự.
              </p>
            )}
            {fieldErrors.password && (
              <p id="password-error" className="form-field-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {auth.error && (
            <div
              ref={formErrorRef}
              className="form-error"
              id="auth-form-error"
              role="alert"
              tabIndex={-1}
            >
              {localizeAuthError(auth.error)}
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
