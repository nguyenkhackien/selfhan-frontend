import { CircleUserRound, Menu, Palette, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { Link, NavLink, Outlet } from "react-router";
import type { AuthState } from "@/features/auth";

function AppHeader({
  auth,
  menuOpen,
  onMenu,
}: {
  auth: AuthState;
  menuOpen: boolean;
  onMenu(): void;
}) {
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
        {auth.user && <NavLink to="/dashboard">Không gian học</NavLink>}
        {auth.user?.role === "admin" && (
          <NavLink to="/admin/content">Quản trị</NavLink>
        )}
        <NavLink to="/hsk">Từ vựng HSK</NavLink>
        <NavLink to="/settings">Cài đặt giao diện</NavLink>
        <Link to="/#how-it-works">Cách học</Link>
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
          aria-label={menuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          '.mobile-menu-content a[href], .mobile-menu-content button:not(:disabled), .mobile-menu-content [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [close, open]);

  if (!open) return null;
  return (
    <div
      id="mobile-navigation"
      ref={dialogRef}
      className="mobile-menu-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Điều hướng"
    >
      <button
        className="menu-scrim"
        aria-label="Đóng điều hướng"
        onClick={close}
        tabIndex={-1}
        type="button"
      />
      <div className="mobile-menu-content">
        <button
          className="icon-button"
          aria-label="Đóng điều hướng"
          ref={closeButtonRef}
          onClick={close}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
        <NavLink to="/levels" onClick={close}>
          Lộ trình học
        </NavLink>
        {auth.user && (
          <NavLink to="/dashboard" onClick={close}>
            Không gian học
          </NavLink>
        )}
        {auth.user?.role === "admin" && (
          <NavLink to="/admin/content" onClick={close}>
            Quản trị
          </NavLink>
        )}
        <NavLink to="/hsk" onClick={close}>
          Từ vựng HSK
        </NavLink>
        <NavLink to="/settings" onClick={close}>
          <Palette aria-hidden="true" size={18} />
          Cài đặt giao diện
        </NavLink>
        <Link to="/#how-it-works" onClick={close}>
          Cách học
        </Link>
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
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const handleSkip = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main-content");
    if (!main) return;
    event.preventDefault();
    main.focus();
    main.scrollIntoView?.({ block: "start" });
  };
  return (
    <div className="app">
      <a className="skip-link" href="#main-content" onClick={handleSkip}>
        Bỏ qua điều hướng
      </a>
      <AppHeader
        auth={auth}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((value) => !value)}
      />
      <MobileMenu open={menuOpen} close={closeMenu} auth={auth} />
      <div className="app-content">
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="site-footer">
          <p>SelfHan · Học tiếng Trung theo từng bước nhỏ</p>
          <p className="data-attribution">
            Data từ vựng được kế thừa từ{" "}
            <a href="https://github.com/ph0ngp/CVDICT">CVDICT</a> &amp;{" "}
            <a href="https://cc-cedict.org/wiki/">CC-CEDICT</a> (
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </a>
            ).
          </p>
        </footer>
      </div>
    </div>
  );
}
