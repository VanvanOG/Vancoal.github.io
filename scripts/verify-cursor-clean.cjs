const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5174/';
const out = path.resolve(__dirname, '../qa/preload-release/cursor');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await page.goto(base);
    await page.locator('.adventure-cursor-ring').waitFor({state:'attached'});
    await page.waitForTimeout(200);
    await page.mouse.move(300, 150);
    await page.waitForFunction(() => document.documentElement.classList.contains('adventure-cursor-active'));
    const read = () => page.evaluate(() => ['ring', 'dot'].map(part => {
      const node = document.querySelector('.adventure-cursor-' + part), style = getComputedStyle(node);
      return { shadow: style.boxShadow, width: style.width, border: style.borderTopWidth, color: style.borderTopColor, background: style.backgroundColor, pointerEvents: style.pointerEvents };
    }));
    await page.screenshot({path: path.join(out, (process.env.CHECK_LABEL || 'cursor').replace(/\.png$/i, '') + '.png')});
    const styles = await read();
    assert.equal(styles[0].shadow, 'none', 'ring must not add dirty dark/inset outlines');
    assert.equal(styles[1].shadow, 'none', 'dot must not add a dark outline');
    assert.equal(styles[0].border, '2px');
    assert.equal(styles[0].color, 'rgb(232, 137, 58)');
    assert.equal(styles[1].width, '6px');
    assert.equal(styles[0].pointerEvents, 'none');
    await page.locator('.startup-loading').waitFor({state:'hidden',timeout:120000});
    await page.getByRole('button',{name:'查看项目',exact:true}).hover();
    await page.waitForFunction(() => document.querySelector('.adventure-cursor-ring').dataset.kind === 'action');
    await page.getByRole('button',{name:'查看项目',exact:true}).click();
    await page.locator('.project-intro-project-layer.is-interactive').waitFor({timeout:60000});
    await page.mouse.move(350, 500);
    await page.screenshot({path: path.join(out, 'dark.png')});
    assert.equal((await read())[0].shadow,'none');
    await page.getByRole('button',{name:/^Open /}).hover();
    await page.waitForFunction(() => document.querySelector('.adventure-cursor-ring').dataset.kind === 'play');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.adventure-cursor-ring').isVisible(),false);
    console.log('PASS cursor: no shadows, readable stroke/dot, action/play targeting and reduced motion');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1});
