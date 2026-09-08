const { chromium } = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await p.goto('http://127.0.0.1:5175/');
    await p.locator('.startup-loading').waitFor({ state: 'detached', timeout: 45000 });
    const active = () => p.locator('.home-page-panel.is-active').getAttribute('class');
    const press = async key => { await p.keyboard.press(key); await p.waitForTimeout(1100); };
    for (const [id, copy] of [['top', 'C CONTACT P PROJECTS'], ['contact', 'H HOME P PROJECTS']]) {
      const hints = p.locator(`#${id} .hint-group`).last();
      assert.equal((await hints.innerText()).replace(/\s+/g, ' ').trim(), copy);
      assert.equal(await hints.locator('button,a').count(), 0);
    }
    await p.locator('#top .keycap-round').first().click();
    assert.match(await active(), /hero-fullpage-panel/);
    await p.keyboard.press('c');
    await p.keyboard.press('h'); // ignored while locked
    await p.waitForTimeout(1100);
    assert.match(await active(), /contact-fullpage-panel/);
    await press('h');
    assert.match(await active(), /hero-fullpage-panel/);
    await p.evaluate(() => { const input = document.createElement('input'); input.id = 'shortcut-test'; document.querySelector('#top').append(input); input.focus(); });
    await press('p');
    assert.match(await active(), /hero-fullpage-panel/);
    await p.evaluate(() => document.querySelector('#shortcut-test').remove());
    await p.keyboard.press('Control+p');
    assert.match(await active(), /hero-fullpage-panel/);
    await press('p');
    await p.locator('.project-intro-project-layer.is-interactive').waitFor();
    await p.mouse.wheel(0, 900);
    await p.waitForTimeout(1100);
    assert.match(await active(), /contact-fullpage-panel/);
    await press('p');
    await p.locator('.project-intro-project-layer.is-interactive').waitFor();
    console.log('PASS C/H/P, transition lock, editable/modifier guards, non-clickable hints');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
