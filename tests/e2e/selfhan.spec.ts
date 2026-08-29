import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function mockFoundationApi(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const json = (body: unknown, status = 200) =>
      route.fulfill({
        contentType: "application/json",
        status,
        body: JSON.stringify(body),
      });
    if (url.pathname.endsWith("/auth/refresh"))
      return json(
        { error: { code: "INVALID_REFRESH_TOKEN", message: "No session" } },
        401,
      );
    if (url.pathname.endsWith("/levels"))
      return json({
        items: [
          {
            id: "level-1",
            slug: "starter-chinese",
            title: "Tiếng Trung nhập môn",
            description: "Những lời chào đầu tiên.",
            sortOrder: 1,
          },
        ],
      });
    if (url.pathname.endsWith("/levels/starter-chinese"))
      return json({
        id: "level-1",
        slug: "starter-chinese",
        title: "Tiếng Trung nhập môn",
        description: "Những lời chào đầu tiên.",
        sortOrder: 1,
        units: [
          {
            id: "unit-1",
            slug: "greetings",
            title: "Chào hỏi",
            description: "Nói lời chào đầu tiên.",
            sortOrder: 1,
          },
        ],
      });
    if (url.pathname.endsWith("/units/greetings"))
      return json({
        id: "unit-1",
        slug: "greetings",
        title: "Chào hỏi",
        description: "Nói lời chào đầu tiên.",
        sortOrder: 1,
        lessons: [
          {
            id: "lesson-1",
            slug: "say-hello",
            title: "Nói xin chào",
            summary: "Làm quen với 你好.",
            writingCharacter: "你",
            sortOrder: 1,
          },
        ],
      });
    if (url.pathname.endsWith("/lessons/say-hello"))
      return json({
        id: "lesson-1",
        slug: "say-hello",
        title: "Nói xin chào",
        summary: "Làm quen với 你好.",
        writingCharacter: "你",
        sortOrder: 1,
        vocabulary: [
          {
            id: "word-1",
            hanzi: "你好",
            pinyin: "nǐ hǎo",
            meaningVi: "Xin chào",
            audioUrl: null,
            examples: [
              {
                hanzi: "你好！",
                pinyin: "nǐ hǎo",
                meaningVi: "Xin chào!",
                audioUrl: null,
                sortOrder: 1,
              },
            ],
          },
        ],
        grammarPoints: [
          {
            id: "grammar-1",
            title: "你好",
            explanationVi: "Lời chào cơ bản.",
            examples: ["你好！"],
            sortOrder: 1,
          },
        ],
      });
    return json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy." } },
      404,
    );
  });
}

test.beforeEach(async ({ page }) => {
  await mockFoundationApi(page);
});

test("learners can follow Level → Unit → Lesson on desktop", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bắt đầu từ đây" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Xem lộ trình/i })).toHaveCSS(
    "background-color",
    "rgb(84, 120, 95)",
  );
  await expect(page.locator(".level-card").first()).toHaveCSS(
    "background-color",
    "rgb(255, 253, 250)",
  );
  await page.getByRole("link", { name: /Tiếng Trung nhập môn/i }).click();
  await page.getByRole("link", { name: "Chào hỏi" }).click();
  await page.getByRole("link", { name: "Nói xin chào" }).click();
  await expect(
    page.getByRole("heading", { name: "Nói xin chào" }),
  ).toBeVisible();
  await expect(page.getByLabel("Khung tập viết chữ 你")).toBeVisible();
  await expect(page.getByLabel("Khung tập viết chữ 你")).toHaveCSS(
    "border-color",
    "rgb(213, 198, 165)",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("navigation remains usable at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở điều hướng" }).click();
  await expect(page.getByRole("dialog", { name: "Điều hướng" })).toBeVisible();
  await page.getByRole("link", { name: "Lộ trình học" }).last().click();
  await expect(
    page.getByRole("heading", { name: "Các Level đang mở" }),
  ).toBeVisible();
});

test("learners can select and retain a color theme", async ({ page }) => {
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/settings");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  await expect(page.getByRole("radio", { name: /Sage/ })).toBeChecked();
  await page.getByRole("radio", { name: /Terracotta/ }).check();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "terracotta",
  );
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(255, 248, 244)",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.reload();
  await expect(page.getByRole("radio", { name: /Terracotta/ })).toBeChecked();
});
