import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Sidebar } from "../components/layout/Sidebar";
import {
  pageIdForPath,
  pageTitleForPath,
  toPagePath,
} from "../config/navigation";
import { useLearningHub } from "../features/learning-hub/useLearningHub";
import type { LearningHubPageProps } from "../types/learning";
import { AppRoutes } from "./appRoutes";

export function LearningHubShell() {
  const hub = useLearningHub();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const activePage = pageIdForPath(location.pathname);
  const onNavigate: LearningHubPageProps["onNavigate"] = (page) => {
    navigate(toPagePath(page));
  };

  useEffect(() => {
    document.title = pageTitleForPath(location.pathname);
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <Sidebar
        activePage={activePage}
        mobileOpen={mobileNavigationOpen}
        onMobileOpenChange={setMobileNavigationOpen}
        onNavigate={onNavigate}
      />
      <main
        aria-hidden={mobileNavigationOpen || undefined}
        id="main-content"
        className="main-content"
        inert={mobileNavigationOpen || undefined}
        ref={mainRef}
        tabIndex={-1}
      >
        <AppRoutes hub={hub} onNavigate={onNavigate} />
      </main>
    </div>
  );
}
