import { CircleUserRound, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import type { AuthState } from "@/features/auth";

function AppHeader({ auth, onMenu }: { auth: AuthState; onMenu(): void }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="SelfHan — trang chủ">
        <span className="brand-mark" aria-hidden="true">
          汉
        </span>
        <span>SelfHan</span>
      </Link>
      <nav className="desktop-nav" aria-label="Điều hướng chính">
        <NavLink to="/levels">Lộ trình học</NavLink>
        <a href="#how-it-works">Cách học</a>
      </nav>
      <div className="header-actions">
        {auth.user ? (
          <button
            className="account-button"
            onClick={() => void auth.logout()}
            type="button"
          >
            <CircleUserRound aria-hidden="true" size={19} />
            <span>Đăng xuất</span>
          </button>
        ) : (
          <>
            <Link className="text-link" to="/login">
              Đăng nhập
            </Link>
            <Link className="button button--primary" to="/register">
              Bắt đầu học
            </Link>
          </>
        )}
        <button
          className="menu-button"
          aria-label="Mở điều hướng"
          type="button"
          onClick={onMenu}
        >
          <Menu aria-hidden="true" size={23} />
        </button>
      </div>
    </header>
  );
}

function MobileMenu({
  open,
  close,
  auth,
}: {
  open: boolean;
  close(): void;
  auth: AuthState;
}) {
  if (!open) return null;
  return (
    <div
      className="mobile-menu-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Điều hướng"
    >
      <button
        className="menu-scrim"
        aria-label="Đóng điều hướng"
        onClick={close}
        type="button"
      />
      <div className="mobile-menu-content">
        <button
          className="icon-button"
          aria-label="Đóng điều hướng"
          onClick={close}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
        <NavLink to="/levels" onClick={close}>
          Lộ trình học
        </NavLink>
        <a href="#how-it-works" onClick={close}>
          Cách học
        </a>
        {auth.user ? (
          <button
            className="button button--secondary"
            onClick={() => {
              void auth.logout();
              close();
            }}
            type="button"
          >
            Đăng xuất
          </button>
        ) : (
          <Link
            className="button button--primary"
            to="/register"
            onClick={close}
          >
            Bắt đầu học
          </Link>
        )}
      </div>
    </div>
  );
}

export function AppLayout({ auth }: { auth: AuthState }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <AppHeader auth={auth} onMenu={() => setMenuOpen(true)} />
      <MobileMenu
        open={menuOpen}
        close={() => setMenuOpen(false)}
        auth={auth}
      />
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        SelfHan · Học tiếng Trung theo từng bước nhỏ
      </footer>
    </div>
  );
}
