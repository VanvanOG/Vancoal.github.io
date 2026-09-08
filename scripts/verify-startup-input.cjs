const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route("**/project-intro-150.webp", (route) => route.abort());
    await page.goto(process.env.BASE_URL || "http://localhost:5181");
    await page.locator(".startup-loading").waitFor();
    await page.keyboard.press("p");
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
    assert.equal(
      await page.locator(".project-intro-canvas.is-visible").count(),
      0,
      "startup input must not enter the unprepared sequence",
    );
    console.log("PASS keyboard/wheel cannot enter transition during startup");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
