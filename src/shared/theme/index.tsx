import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

/* eslint-disable react-refresh/only-export-components -- The provider's public
 * context hook and theme catalogue must be imported together by UI features. */

const themeStorageKey = "selfhan-theme";

export const themes = {
  sage: {
    description: "Xanh lá dịu, gần gũi và tập trung.",
    name: "Sage",
  },
  indigo: {
    description: "Chàm hiện đại, rõ nét và tĩnh tại.",
    name: "Indigo",
  },
  terracotta: {
    description: "Đất nung ấm, giàu năng lượng và dễ chịu.",
    name: "Terracotta",
  },
} as const;

export type Theme = keyof typeof themes;

const defaultTheme: Theme = "sage";

type ThemeContextValue = {
  setTheme(theme: Theme): void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value !== null && value in themes;
}

function getSavedTheme(): Theme {
  if (typeof window === "undefined") return defaultTheme;
  const savedTheme = window.localStorage.getItem(themeStorageKey);
  return isTheme(savedTheme) ? savedTheme : defaultTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider.");
  return context;
}

export function getThemeColor(token: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
}
