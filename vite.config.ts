import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/main.tsx",
        "src/types/**",
        "src/vite-env.d.ts",
      ],
      thresholds: {
        perFile: true,
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
