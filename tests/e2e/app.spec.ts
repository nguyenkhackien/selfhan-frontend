import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();
const routes = [
  {
    path: "/",
    heading: "Chào buổi sáng, Kien",
    title: "Chào buổi sáng, Kien | ZenLingo",
  },
  { path: "/writing", heading: "Luyện viết", title: "Luyện viết | ZenLingo" },
  {
    path: "/flashcards",
    heading: "Flashcards",
    title: "Flashcards | ZenLingo",
  },
  { path: "/recall", heading: "Luyện nhớ", title: "Luyện nhớ | ZenLingo" },
  { path: "/notes", heading: "Ghi chú", title: "Ghi chú | ZenLingo" },
  { path: "/stats", heading: "Thống kê", title: "Thống kê | ZenLingo" },
] as const;

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
});

test.afterEach(async ({ page }) => {
  expect(
    browserErrors.get(page),
    "browser emitted console/page errors",
  ).toEqual([]);
});

function expectNoAxeViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  expect(
    violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

for (const route of routes) {
  test(`executes and audits the production app at direct route ${route.path}`, async ({
    page,
  }) => {
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: route.heading }),
    ).toBeVisible();
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator("#root")).not.toBeEmpty();

    const results = await new AxeBuilder({ page }).analyze();
    expectNoAxeViolations(results.violations);
  });
}

test("persists Writing completion through a production reload", async ({
  page,
}) => {
  await page.goto("/writing");

  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(
    page.getByRole("button", { name: /Đã hoàn thành/ }),
  ).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Luyện viết" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Đã hoàn thành/ }),
  ).toBeVisible();
});

test("audits the open Notes modal", async ({ page }) => {
  await page.goto("/notes");
  await page
    .getByRole("button", { name: /Mở ghi chú/ })
    .first()
    .click();

  await expect(page.getByRole("dialog")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expectNoAxeViolations(results.violations);
});

test("traps keyboard focus and audits the open mobile drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Mở điều hướng" });
  await toggle.click();

  const home = page.getByRole("button", { name: "Home" });
  const profile = page.getByRole("button", { name: "Hồ sơ của Kien" });
  const main = page.locator("main#main-content");
  await expect(home).toBeFocused();
  await expect(main).toHaveAttribute("aria-hidden", "true");
  await expect(main).toHaveAttribute("inert", "");

  await page.keyboard.press("Shift+Tab");
  await expect(profile).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(home).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  expectNoAxeViolations(results.violations);

  await page.setViewportSize({ width: 1024, height: 844 });
  await expect(main).not.toHaveAttribute("aria-hidden", "true");
  await expect(main).not.toHaveAttribute("inert", "");
  await expect(page.locator(".mobile-menu")).toHaveAttribute(
    "aria-expanded",
    "false",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await toggle.click();
  await expect(home).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(main).not.toHaveAttribute("aria-hidden", "true");
  await expect(main).not.toHaveAttribute("inert", "");
});
