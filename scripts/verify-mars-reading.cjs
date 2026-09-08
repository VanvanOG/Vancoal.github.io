const { chromium } = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.DEMO_URL || 'http://127.0.0.1:5174/';
const out = path.resolve(__dirname, '../qa/mars-reading');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const report = [];
  try {
    for (const width of [1440, 1920, 768, 390, 360]) {
      const page = await browser.newPage({ viewport: { width, height: width < 500 ? 844 : 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(base + '#/projects/mars-era');
      await page.locator('.startup-loading').waitFor({ state: 'hidden', timeout: 45000 });
      await page.evaluate(async () => {
        document.querySelectorAll('.mars-case img').forEach(i => i.loading = 'eager');
        await Promise.all([...document.querySelectorAll('.mars-case img')].map(i => i.decode()));
        await document.fonts.ready;
      });
      assert.equal(await page.locator('.mars-case button[data-zoom], .mars-case .image-tool, .mars-lightbox').count(), 0, 'No image enlargement UI remains');
      const measurements = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        background: getComputedStyle(document.querySelector('.mars-case')).backgroundImage,
        gutter: document.querySelector('#access').getBoundingClientRect().left,
        images: [...document.querySelectorAll('.mars-case img')].map(i => ({
          name: decodeURIComponent(i.src.split('/').pop()), w: i.getBoundingClientRect().width, h: i.getBoundingClientRect().height,
          nw: i.naturalWidth, nh: i.naturalHeight, width: i.getAttribute('width'), height: i.getAttribute('height'),
        })),
      }));
      assert.equal(measurements.overflow, false, `No page overflow at ${width}`);
      assert.equal(measurements.background, 'none');
      assert.ok(width > 760 || Math.abs(measurements.gutter - 20) < 1, 'Mobile reading gutter is 20px');
      if (width <= 760) {
        assert.ok(await page.locator('[data-target-step="02"] .paired-proof').evaluate(e => {
          const [first, second] = [...e.children].map(item => item.getBoundingClientRect());
          return second.top >= first.bottom + 15;
        }), 'Mobile proof pair follows a single vertical reading order');
      }
      for (const i of measurements.images) {
        assert.ok(i.width && i.height, `Reserved image space: ${i.name}`);
        assert.ok(i.w <= i.nw + 1 && i.h <= i.nh + 1, `No upscaling: ${i.name}`);
        assert.ok(Math.abs(i.w / i.h - i.nw / i.nh) < 0.015, `Original ratio: ${i.name}`);
        if (i.name.startsWith('基地状态-')) assert.ok(i.w <= 220.5 && i.h <= 240.5, `Model size: ${i.name}`);
        if (i.name.startsWith('奖励栏')) assert.ok(i.w <= 480.5, `Reward size: ${i.name}`);
        if (i.name.startsWith('基地浮层-') && i.nw < 1000) assert.ok(i.w <= 360.5 && i.h <= 400.5, `Popup size: ${i.name}`);
      }
      const progress = page.getByRole('progressbar', { name: '案例阅读进度' });
      for (const fraction of [0, 0.5, 1]) {
        await page.evaluate(f => window.scrollTo({ top: f * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }), fraction);
        await page.waitForFunction(f => Math.abs(Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')) - f * 100) < 1.5, fraction);
        assert.equal(await progress.evaluate(e => getComputedStyle(e).height), '3px');
      }
      // A late image/content expansion must change progress without a scroll event.
      await page.evaluate(() => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) / 2, behavior: 'instant' }));
      await page.waitForFunction(() => Math.abs(Number(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')) - 50) < 1);
      const expandedExpected = await page.evaluate(() => {
        const spacer = document.createElement('div');
        spacer.id = 'test-late-content';
        spacer.style.height = '2000px';
        document.querySelector('.mars-case').append(spacer);
        return scrollY / (document.documentElement.scrollHeight - innerHeight) * 100;
      });
      await page.waitForFunction(expected => Math.abs(Number(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')) - expected) < 1, expandedExpected);
      await page.evaluate(() => document.querySelector('#test-late-content').remove());
      for (const [id, label] of [['access', '链路简化'], ['focus', '目标明确'], ['feedback', '阶梯式反馈'], ['results', '数据结果']]) {
        await page.locator('.mars-reading-nav').getByRole('button', { name: label, exact: true }).click();
        await page.waitForFunction(label => document.querySelector('.mars-reading-nav [aria-current]')?.textContent === label, label);
        const clear = await page.locator('#' + id + ' .section-heading').evaluate(e => e.getBoundingClientRect().top >= document.querySelector('.mars-reading-nav').getBoundingClientRect().bottom + 15);
        assert.ok(clear, `Chapter ${id} clears sticky navigation`);
        await page.screenshot({ path: path.join(out, `${id}-${width}.png`) });
      }
      for (const selector of ['.journey-grid', '.path-comparison', '#battle-results', '.rewards', '#growth']) {
        await page.locator(selector).screenshot({ path: path.join(out, `${selector.replace(/[^a-z-]/g, '')}-${width}.png`), style: '.site-nav, .mars-reading-nav, .mars-reading-progress { opacity: 0 !important; visibility: hidden !important; } .site-nav * { visibility: hidden !important; }' });
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: path.join(out, `hero-${width}.png`) });
      await page.locator('[data-zone="goal"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-zone="goal"]').getAttribute('aria-pressed'), 'true');
      await page.locator('.annotated-screen img').click();
      assert.equal(await page.getByRole('dialog').count(), 0, 'Image click does not open dialog');
      await page.locator('.mars-reading-nav').getByRole('button', { name: '链路简化', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.mars-reading-nav [aria-current]')?.textContent === '链路简化');
      await page.setViewportSize({ width: width + 20, height: 800 });
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await page.waitForFunction(() => Number(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')) === 100);
      assert.deepEqual(errors, []);
      report.push({ width, images: measurements.images.length, progress: 'top / middle / bottom / resize', errors });
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    await page.goto(base + '#/projects/mars-era');
    await page.locator('.startup-loading').waitFor({ state: 'hidden', timeout: 45000 });
    await page.locator('.mars-reading-nav').getByRole('button', { name: '链路简化', exact: true }).click();
    await page.waitForFunction(() => Math.abs(document.querySelector('#access .section-heading').getBoundingClientRect().top - document.querySelector('.mars-reading-nav').getBoundingClientRect().bottom - 24) < 2);
    await page.locator('.back-link').click();
    await page.waitForURL(url => !url.hash.includes('/projects/'));
    await page.locator('.project-intro-project-layer.is-interactive').waitFor();
    await page.getByRole('progressbar', { name: '案例阅读进度' }).waitFor({ state: 'detached' });
    assert.equal(await page.getByRole('progressbar', { name: '案例阅读进度' }).count(), 0, 'Progress removed outside Mars route');
    await page.close();
  } finally {
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
