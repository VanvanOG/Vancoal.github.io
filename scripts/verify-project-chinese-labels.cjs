const { chromium } = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const names = ['火星纪元PVP活动', 'AI 装修对话', 'AI 委托玩法', 'AVA 联赛 · 数据埋点', 'AI 设计实验室'];
(async () => {
  const browser = await chromium.launch();
  try {
    fs.mkdirSync('qa/chinese-labels', { recursive: true });
    for (const width of [1440, 390, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5175/');
      await page.locator('.startup-loading').waitFor({ state: 'detached', timeout: 45000 });
      await page.getByRole('button', { name: '查看项目', exact: true }).click();
      await page.locator('.project-intro-project-layer.is-interactive').waitFor();
      for (const name of names) {
        const label = page.locator('.project-video-meta-window strong:not(.is-incoming) .project-video-name-zh');
        assert.equal(await label.textContent().then(s => s.trim()), name);
        const metrics = await label.evaluate(el => {
          const r = el.getBoundingClientRect(), parent = el.parentElement, box = parent.parentElement.getBoundingClientRect();
          return { small: parseFloat(getComputedStyle(el).fontSize), large: parseFloat(getComputedStyle(parent).fontSize), contained: r.bottom <= box.bottom + 1 && r.left >= 0 && r.right <= innerWidth + 1, below: r.top > parent.getBoundingClientRect().top };
        });
        assert.ok(metrics.small < metrics.large && metrics.contained && metrics.below, JSON.stringify({width,name,metrics}));
        if (name === names[1]) await page.screenshot({ path: `qa/chinese-labels/${width}.png` });
        await page.getByRole('button', { name: 'Next project', exact: true }).click();
        await page.waitForTimeout(750);
      }
      await page.close();
      console.log(`PASS ${width}px: all five Chinese labels, smaller type, below English, no clipping`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
