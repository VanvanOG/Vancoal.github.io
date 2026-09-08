const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    let blocked = true;
    let attempts = 0;
    const frames = new Set();
    await page.route("**/media/loading/complete-icon.svg", (route) => {
      attempts++;
      return blocked ? route.abort() : route.continue();
    });
    page.on("requestfinished", (r) => {
      if (/project-intro-\d{3}\.webp/.test(r.url())) frames.add(r.url());
    });
    await page.goto(process.env.BASE_URL || "http://localhost:5181");
    await page.getByRole("button", { name: "重试加载", exact: true }).waitFor();
    const failed = await page.evaluate(async () =>
      (await import("/src/utils/preloadManager.ts")).getBootPreloadState(),
    );
    assert.equal(
      failed.isDone,
      false,
      "failed resource must not complete boot",
    );
    assert.ok(failed.error, "failure must expose retry state");
    blocked = false;
    await page.getByRole("button", { name: "重试加载", exact: true }).click();
    await page.locator(".startup-loading").waitFor({ state: "detached" });
    const state = await page.evaluate(async () =>
      (await import("/src/utils/preloadManager.ts")).getBootPreloadState(),
    );
    assert.equal(state.isDone, true);
    assert.equal(
      frames.size,
      301,
      "all sequence responses finish before boot completes",
    );
    assert.deepEqual(
      state.items.map((i) => i.title),
      [
        "Homepage Base",
        "Hero Visual",
        "Project Transition",
        "Mars Era",
        "AI Dialogue",
        "AI Commission",
        "AVA League",
      ],
    );
    const posters = await page.evaluate(async () => {
      const m = await import("/src/utils/preloadManager.ts");
      return [
        "mars-era",
        "ai-dialogue-2",
        "ai-commission-v1",
        "ava-league-v1",
      ].every((name) =>
        m
          .getPreloadedVideoPoster("/media/project-videos/" + name + ".mp4")
          ?.startsWith("data:image/jpeg"),
      );
    });
    assert.equal(posters, true, "four real video first-frame posters retained");
    console.log(
      "PASS failed-resource guard, retry, 301 completed sequence requests, seven groups; icon attempts=" +
        attempts,
    );
    await page.close();
    const slow = await browser.newPage();
    let release;
    const held = new Promise((resolve) => (release = resolve));
    await slow.route("**/project-intro-150.webp", async (route) => {
      await held;
      await route.continue();
    });
    await slow.goto(process.env.BASE_URL || "http://localhost:5181");
    await slow.waitForTimeout(32000);
    assert.equal(
      await slow.locator(".startup-loading").count(),
      1,
      "slow startup must remain visible beyond old30s forced completion",
    );
    assert.equal(
      await slow.evaluate(
        async () =>
          (await import("/src/utils/preloadManager.ts")).getBootPreloadState()
            .isDone,
      ),
      false,
    );
    release();
    await slow.locator(".startup-loading").waitFor({ state: "detached" });
    console.log(
      "PASS slow frame held32s: boot remained pending until actual response/decode readiness",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
