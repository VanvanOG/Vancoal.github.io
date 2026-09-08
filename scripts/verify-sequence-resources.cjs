const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ||
    "C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const base = process.env.BASE_URL || "http://localhost:5181";
    await page.route(base + "/", (route) =>
      route.fulfill({ contentType: "text/html", body: "<html></html>" }),
    );
    await page.goto(base);
    const result = await page.evaluate(async () => {
      const module = await import("/src/utils/sequenceResources.ts").catch(
        () => null,
      );
      if (!module) return { available: false };
      const cache = module.introResources;
      await cache.preload();
      await cache.prepare(0, "forward");
      const initial = cache.get(0) != null;
      let max = 0;
      for (const frame of [0, 35, 80, 150, 260, 300, 260, 150, 80, 0]) {
        await cache.prepare(frame, frame === 300 ? "reverse" : "forward");
        cache.pin(frame);
        max = Math.max(max, cache.decodedCount);
        if (!cache.get(frame)) throw Error("missing exact frame");
      }
      const { createPlaybackClock } =
        await import("/src/utils/sequencePlayback.ts");
      const clock = createPlaybackClock("forward", 4000);
      let ready = false;
      const a = clock.tick(0, () => true);
      const b = clock.tick(100, () => ready);
      const c = clock.tick(1000, () => ready);
      ready = true;
      const d = clock.tick(1016, () => ready);
      const reverse = createPlaybackClock("reverse", 4000);
      const r = reverse.tick(0, () => true);
      return {
        available: true,
        initial,
        max,
        a,
        b,
        c,
        d,
        r,
        blobCount: cache.blobCount,
      };
    });
    assert.equal(
      result.available,
      true,
      "shared sequence resources must exist",
    );
    assert.equal(result.blobCount, 301);
    assert.equal(result.initial, true);
    assert.ok(result.max <= 41);
    assert.equal(result.b.frame, result.a.frame);
    assert.equal(result.c.frame, result.a.frame);
    assert.ok(
      result.d.frame < 20,
      "unavailable interval must not advance logical clock",
    );
    assert.equal(result.r.frame, 300);
    console.log(
      "PASS bounded decode, retained301blobs, exact-frame hold/clock pause/reverse",
      result,
    );
    await page.close();
    const corrupt = await browser.newPage();
    await corrupt.route(base + "/", (route) =>
      route.fulfill({ contentType: "text/html", body: "<html></html>" }),
    );
    let bad = true;
    let attempts = 0;
    await corrupt.route("**/project-intro-175.webp", (route) => {
      attempts++;
      return bad
        ? route.fulfill({
            contentType: "image/webp",
            body: "invalid image bytes",
          })
        : route.continue();
    });
    await corrupt.goto(base);
    await corrupt.evaluate(async () => {
      const { introResources: c } =
        await import("/src/utils/sequenceResources.ts");
      await c.preload();
      await c.prepare(175, "forward").catch(() => {});
    });
    bad = false;
    const recovered = await corrupt.evaluate(async () => {
      const { introResources: c } =
        await import("/src/utils/sequenceResources.ts");
      await c.preload();
      return c.prepare(175, "forward").then(
        () => !!c.get(175),
        () => false,
      );
    });
    assert.equal(
      recovered,
      true,
      "corrupt decoded resource must be re-fetched on explicit retry",
    );
    assert.equal(attempts, 2);
    console.log("PASS corrupt frame retry fetches only failed blob");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
