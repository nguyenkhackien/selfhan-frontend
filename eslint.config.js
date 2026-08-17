import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "coverage/",
      "dist/",
      "node_modules/",
      "playwright-report/",
      "test-results/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      "eslint.config.js",
      "playwright.config.ts",
      "vite.config.ts",
      "scripts/**/*.mjs",
      "tests/e2e/**/*.ts",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
);
