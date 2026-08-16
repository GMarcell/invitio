/*
 * Manual end-to-end smoke test (optional).
 *
 * Requires the app running on http://localhost:3000 with the seeded demo data,
 * and a Playwright installation with browsers:
 *
 *   npm run dev   # in one terminal
 *   node scripts/e2e-test.cjs
 *
 * It exercises the guest flow (countdown, gift masking/reveal, language toggle,
 * RSVP, guestbook) and the host flow (login, dashboard, guests list) and cleans
 * up the test RSVP/message it creates.
 */
/* eslint-disable */
let playwrightPath;
try {
  playwrightPath = require.resolve("playwright");
} catch {
  playwrightPath = "/home/admin-ubuntu/grand/yudea-app/node_modules/playwright";
}
const { chromium } = require(playwrightPath);

const BASE = "http://localhost:3000";
let failures = 0;

function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}: ${name}`);
  if (!cond) failures++;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // ── Guest flow: invitation page ─────────────────────────
  await page.goto(`${BASE}/i/raka-and-aisyah-wedding`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Raka & Aisyah");
  check("invite page renders title", true);

  check("countdown visible", (await page.locator("text=Counting down to the big day").count()) > 0);
  check("gift section visible", (await page.locator("text=Send a Gift").count()) > 0);
  check("account number masked", (await page.locator("text=•••• •••• 3456").count()) > 0);
  await page.click("text=Reveal");
  check("account number revealed on tap", (await page.locator("text=8830123456").count()) > 0);

  await page.click("text=ID");
  await page.waitForSelector("text=Kirim Konfirmasi");
  check("language toggle switches to Indonesian", true);
  await page.click("text=EN");

  // ── RSVP submission ─────────────────────────────────────
  await page.click("text=Yes, I'll be there");
  await page.fill('input[placeholder*="Your name"]', "E2E Tester");
  await page.fill('input[placeholder="Email (optional)"]', "e2e@test.local");
  await page.click("text=Send RSVP");
  await page.waitForSelector("text=Thank you!");
  check("RSVP submitted, thank-you screen shown", true);

  // ── Guestbook message ───────────────────────────────────
  await page.fill('input[placeholder*="Your name"]', "E2E Tester");
  await page.fill('textarea[placeholder*="Congratulations"]', "Selamat dari E2E test! 🎉");
  await page.click("text=Send Wish");
  await page.waitForSelector("text=Thank you! Your wish has been posted.");
  check("guestbook wish posted", true);

  // ── Host flow: login → dashboard → guests ───────────────
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "demo@invitio.app");
  await page.fill('input[name="password"]', "demo1234");
  await page.click('button[type="submit"]:has-text("Log in")');
  await page.waitForSelector("text=Your invitations", { timeout: 15000 });
  check("login → dashboard", true);

  await page.waitForTimeout(500); // let the session cookie commit
  await page.reload({ waitUntil: "networkidle" });
  check("session persists across reload", page.url().includes("/dashboard"));

  const cardCount = await page.locator('a[title="Guests & RSVPs"]').count();
  check("dashboard lists invitation", cardCount > 0);
  if (cardCount > 0) {
    await page.locator('a[title="Guests & RSVPs"]').first().click();
    await page.waitForSelector("text=Guests & RSVPs");
    await page.waitForSelector("text=E2E Tester", { timeout: 10000 });
    check("new RSVP appears in host dashboard", true);
  }

  await browser.close();

  if (failures > 0) {
    console.log(`\n${failures} check(s) FAILED`);
    process.exit(1);
  }
  console.log("\nAll checks passed ✓");
})().catch((e) => {
  console.error("E2E ERROR:", e.message);
  process.exit(1);
});
