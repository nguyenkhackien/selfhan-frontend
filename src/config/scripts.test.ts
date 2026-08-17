import packageManifest from "../../package.json";
import { ESLint } from "eslint";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("production verification script", () => {
  it("runs formatting, linting, type checking, tests, and build in order", () => {
    const verify = packageManifest.scripts.verify;

    expect(verify).toMatch(
      /format:check[\s\S]*lint[\s\S]*typecheck[\s\S]*test:coverage[\s\S]*build/,
    );
    expect(packageManifest.scripts["test:preview"]).toBe(
      "node scripts/smoke-preview.mjs",
    );
  });

  it("pins the React lint plugins and Node 24 types exactly", () => {
    expect(packageManifest.devDependencies).toMatchObject({
      "@axe-core/playwright": "4.13.0",
      "@playwright/test": "1.62.1",
      "@types/node": "24.13.3",
      "eslint-plugin-react-hooks": "7.1.1",
      "eslint-plugin-react-refresh": "0.5.4",
    });
  });

  it("runs a real production-browser suite locally and in verify", () => {
    expect(packageManifest.scripts["test:e2e"]).toBe(
      "npm run build && npm run test:e2e:run",
    );
    expect(packageManifest.scripts["test:e2e:run"]).toBe("playwright test");
    expect(packageManifest.scripts.verify).toMatch(/build[\s\S]*test:e2e:run/);
  });

  it("keeps Playwright specifications out of the Vitest unit runner", async () => {
    const viteConfig = await readFile("vite.config.ts", "utf8");

    expect(viteConfig).toMatch(/exclude:\s*\[[\s\S]*tests\/e2e\/\*\*/);
  });

  it("treats every lint warning as a failed quality gate", () => {
    expect(packageManifest.scripts.lint).toBe("eslint . --max-warnings=0");
  });

  it("checks all supported source and project text formats with Prettier", () => {
    expect(packageManifest.scripts.format).toBe(
      "prettier --write . --ignore-unknown",
    );
    expect(packageManifest.scripts["format:check"]).toBe(
      "prettier --check . --ignore-unknown",
    );
  });

  it("enables the resolved React Hooks and React Refresh rules for TSX", async () => {
    const eslint = new ESLint();
    const config = await eslint.calculateConfigForFile("src/App.tsx");

    expect(Object.keys(config?.plugins ?? {})).toEqual(
      expect.arrayContaining(["react-hooks", "react-refresh"]),
    );
    expect(config?.rules["react-hooks/rules-of-hooks"]?.[0]).toBe(2);
    expect(config?.rules["react-hooks/exhaustive-deps"]?.[0]).toBe(2);
    expect(config?.rules["react-refresh/only-export-components"]?.[0]).toBe(2);
  });
});
