import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Flame, Menu, MoreHorizontal, Sparkles, X } from "lucide-react";
import { navigationItems } from "../../config/navigation";
import type { PageId } from "../../types/learning";

interface SidebarProps {
  activePage?: PageId;
  mobileOpen: boolean;
  onMobileOpenChange(open: boolean): void;
  onNavigate(page: PageId): void;
}

export function Sidebar({
  activePage,
  mobileOpen,
  onMobileOpenChange,
  onNavigate,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" || !window.matchMedia
      ? false
      : window.matchMedia("(max-width: 760px)").matches,
  );
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const firstNavRef = useRef<HTMLButtonElement | null>(null);
  const hasOpenedRef = useRef(false);
  const mobileClosed = isMobile && !mobileOpen;

  useEffect(() => {
    if (!window.matchMedia) return;

    const query = window.matchMedia("(max-width: 760px)");
    const updateViewport = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        onMobileOpenChange(false);
      }
    };
    query.addEventListener("change", updateViewport);
    return () => query.removeEventListener("change", updateViewport);
  }, [onMobileOpenChange]);

  useEffect(() => {
    if (mobileOpen) {
      hasOpenedRef.current = true;
      firstNavRef.current?.focus();
    } else if (hasOpenedRef.current) {
      hasOpenedRef.current = false;
      toggleRef.current?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onMobileOpenChange(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen, onMobileOpenChange]);

  const navigate = (page: PageId) => {
    onNavigate(page);
    onMobileOpenChange(false);
  };

  const trapMobileFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!isMobile || !mobileOpen || event.key !== "Tab") return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        'button:not([disabled]):not([tabindex="-1"])',
      ),
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  return (
    <>
      <aside
        id="primary-navigation"
        className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}
        aria-label="Điều hướng chính"
        aria-hidden={mobileClosed || undefined}
        inert={mobileClosed || undefined}
        onKeyDown={trapMobileFocus}
      >
        <div className="brand">
          <span className="brand__mark">
            <Sparkles size={18} />
          </span>
          <span>ZenLingo</span>
        </div>
        <p className="brand__line">Personal learning hub</p>
        <nav className="nav-list">
          {navigationItems.map(({ id, label, icon: Icon }, index) => (
            <button
              className={`nav-item ${activePage === id ? "nav-item--active" : ""}`}
              key={id}
              onClick={() => navigate(id)}
              aria-current={activePage === id ? "page" : undefined}
              ref={index === 0 ? firstNavRef : undefined}
              tabIndex={mobileClosed ? -1 : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="streak-card">
            <span className="streak-card__icon">
              <Flame size={18} />
            </span>
            <div>
              <strong>7 ngày liên tiếp</strong>
              <small>Giữ nhịp thật dịu dàng</small>
            </div>
          </div>
          <button
            className="profile"
            aria-label="Hồ sơ của Kien"
            tabIndex={mobileClosed ? -1 : undefined}
          >
            <span className="avatar">KN</span>
            <span>
              <strong>Kien Nguyen</strong>
              <small>English · B1</small>
            </span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <button
        type="button"
        aria-label="Đóng menu điều hướng"
        aria-hidden={!mobileOpen}
        className={`sidebar-scrim ${mobileOpen ? "sidebar-scrim--visible" : ""}`}
        onClick={() => onMobileOpenChange(false)}
        tabIndex={mobileOpen ? 0 : -1}
      />
      <button
        ref={toggleRef}
        type="button"
        className="mobile-menu"
        onClick={() => onMobileOpenChange(!mobileOpen)}
        aria-label={mobileOpen ? "Đóng điều hướng" : "Mở điều hướng"}
        aria-controls="primary-navigation"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </>
  );
}
