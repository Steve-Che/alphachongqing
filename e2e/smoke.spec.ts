import { test, expect } from "@playwright/test";

test("首页未登录可访问并显示地图", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "阿尔法重庆" })).toBeVisible();
  await expect(page.getByText("三维城市地图")).toBeVisible();
});

test("登录页可访问", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /登录/ })).toBeVisible();
});

test("未登录访问写作页会跳转登录", async ({ page }) => {
  await page.goto("/write/article");
  await expect(page).toHaveURL(/\/login/);
});

test("健康检查接口返回 ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
});
