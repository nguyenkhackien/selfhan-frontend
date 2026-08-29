import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/shared/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );
}
