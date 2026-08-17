/*
 * Manual end-to-end test for the photo gallery (see README for setup).
 * Requires the app on :3000 with the demo data and the gallery enabled on the
 * demo invitation (Sections tab → Photo gallery + Guest photo uploads).
 */
/* eslint-disable */
const { chromium } = require("/home/admin-ubuntu/grand/yudea-app/node_modules/playwright");
const fs = require("fs");
const BASE = "http://localhost:3000";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
fs.writeFileSync("/tmp/gallery-a.png", PNG);
fs.writeFileSync("/tmp/gallery-b.png", PNG);

let failures = 0;
const check = (name, cond) => { console.log(`${cond ? "PASS" : "FAIL"}: ${name}`); if (!cond) failures++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  // ── 1. Guest uploads a photo (no login) ─────────────────
  await page.goto(`${BASE}/i/raka-and-aisyah-wedding`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Gallery");
  check("gallery section visible on invite page", true);

  const galleryForm = page.locator("form", { has: page.locator('input[type="file"]') });
  await galleryForm.locator('input[placeholder*="Your name"]').fill("Photo Guest");
  await galleryForm.locator('input[type="file"]').setInputFiles("/tmp/gallery-a.png");
  await galleryForm.locator('button:has-text("Upload")').click();
  await page.waitForSelector("text=Photo uploaded! 🎉", { timeout: 20000 });
  check("guest photo upload succeeds", true);

  await page.waitForSelector('img[alt="gallery photo"]', { timeout: 10000 });
  const imgSrc = await page.locator('img[alt="gallery photo"]').first().getAttribute("src");
  console.log("photo src:", imgSrc);
  check("photo visible in gallery grid", !!imgSrc);
  check("photo served (200)", (await page.request.get(BASE + imgSrc)).status() === 200);
  check("guest name shown", (await page.locator("text=by Photo Guest").count()) > 0);

  // ── 2. Host: editor Gallery tab ──────────────────────────
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "demo@invitio.app");
  await page.fill('input[name="password"]', "demo1234");
  await page.click('button[type="submit"]:has-text("Log in")');
  await page.waitForSelector("text=Your invitations", { timeout: 15000 });
  await page.waitForTimeout(500);

  await page.goto(`${BASE}/invitations/ba231a10-80e6-4a9b-9cbc-cbb7932e8f42/edit`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Live preview");
  await page.click("text=Gallery");
  await page.waitForSelector("text=Gallery photos");
  await page.waitForSelector("text=Photo Guest (guest)", { timeout: 10000 });
  check("guest photo visible in editor gallery tab", true);

  // host upload
  await page.locator('form input[type="file"]').setInputFiles("/tmp/gallery-b.png");
  await page.click('button:has-text("Upload")');
  await page.waitForSelector("text=Uploaded ✓", { timeout: 20000 });
  const photoCount = await page.locator('img[src*="/api/files/"]').count();
  check(`host upload adds photo (count=${photoCount})`, photoCount >= 2);

  // delete the guest photo
  await page.locator('button[title="Delete photo"]').first().click();
  await page.waitForFunction(() => document.querySelectorAll('button[title="Delete photo"]').length === 1);
  check("photo deleted", true);

  await browser.close();
  if (failures > 0) { console.log(`\n${failures} check(s) FAILED`); process.exit(1); }
  console.log("\nAll gallery checks passed ✓");
})().catch((e) => { console.error("GALLERY TEST ERROR:", e.message); process.exit(1); });
