const { chromium } = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

const base = process.env.DEMO_URL || 'http://127.0.0.1:5174/';
const entranceSelectors = {
  title: '.project-title-block',
  summary: '.project-status-panel',
  menu: '.project-menu',
  storyline: '.project-storyline',
};

const moduleCoverage = [
  ['.project-title-block', 1], ['.project-status-panel', 1], ['.project-menu', 1],
  ['.project-storyline', 1], ['.section-heading', 7], ['.audiences', 1],
  ['.premise', 1], ['.strategy-map', 1], ['.layout-module', 1],
  ['.path-comparison', 1], ['.entry-note', 1], ['.journey-overview', 1],
  ['.journey-step', 6], ['.feedback-ladder', 1], ['.story-heading', 4],
  ['.result-pair > article', 2], ['.reward-grid > article', 5],
  ['.evidence-grid > article', 6], ['.revenge-record', 1],
  ['.reward-coexistence', 1], ['.data-block', 3], ['.transition-line', 1],
  ['.concurrent-note', 1],
];

async function installSampler(page, key) {
  await page.evaluate(({ key, selectors }) => {
    const state = { samples: [], mutations: [], startedAt: performance.now() };
    window[key] = state;
    const read = () => {
      const values = {};
      for (const [name, selector] of Object.entries(selectors)) {
        const element = document.querySelector(selector);
        if (!element) continue;
        const style = getComputedStyle(element);
        values[name] = {
          opacity: Number(style.opacity),
          transform: style.transform,
          delay: style.transitionDelay,
          duration: style.transitionDuration,
          revealed: element.getAttribute('data-revealed'),
          instant: element.getAttribute('data-reveal-instant'),
        };
      }
      state.samples.push({
        time: performance.now(),
        overlay: Boolean(document.querySelector('.startup-loading, .project-open-overlay')),
        values,
      });
      if (performance.now() - state.startedAt < 12000) requestAnimationFrame(read);
    };
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'attributes') {
          const element = record.target;
          const name = Object.entries(selectors).find(([, selector]) => element.matches?.(selector))?.[0];
          if (name) state.mutations.push({ time: performance.now(), name, revealed: element.getAttribute('data-revealed') });
        }
      }
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-revealed'] });
    requestAnimationFrame(read);
  }, { key, selectors: entranceSelectors });
}

function firstSample(samples, name, predicate) {
  return samples.find(sample => sample.values[name] && predicate(sample.values[name], sample));
}

async function verifyInitialVisit(browser, report) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(base + '#/projects/mars-era');
  await page.locator('.mars-case').waitFor({ state: 'attached' });
  await installSampler(page, '__marsEntranceLifecycle');

  assert.equal(await page.locator('.startup-loading').count(), 1, 'Fresh visit keeps the startup overlay in the DOM');
  for (const [name, selector] of Object.entries(entranceSelectors)) {
    const initial = await page.locator(selector).evaluate(element => {
      const style = getComputedStyle(element);
      return {
        opacity: Number(style.opacity), transform: style.transform,
        revealed: element.getAttribute('data-revealed'),
        instant: element.getAttribute('data-reveal-instant'),
      };
    });
    assert.equal(initial.revealed, 'false', `${name} is initialized hidden while startup is present`);
    assert.equal(initial.opacity, 0, `${name} has real zero opacity before entrance`);
    assert.equal(initial.transform, 'matrix(1, 0, 0, 1, 0, 24)', `${name} starts 24px below its resting position`);
    assert.equal(initial.instant, null, `${name} is not converted into an instant reveal`);
  }

  await page.setViewportSize({ width: 700, height: 1000 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.locator('.mars-case [data-revealed="true"]').count(), 0, 'Breakpoint changes cannot arm reveals behind startup UI');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.locator('.project-title-block').getAttribute('data-revealed'), 'false', 'Returning across the breakpoint still waits for startup removal');

  await page.locator('.startup-loading').waitFor({ state: 'detached', timeout: 45000 });
  await page.waitForFunction(selectors => ['title', 'summary'].every(name => {
    const selector = selectors[name];
    const element = document.querySelector(selector);
    return element?.getAttribute('data-revealed') === 'true' && Number(getComputedStyle(element).opacity) === 1;
  }), entranceSelectors, { timeout: 5000 });
  assert.equal(await page.locator('.project-menu').getAttribute('data-revealed'), 'false', 'Offscreen project menu waits for the 85% scroll trigger');
  assert.equal(await page.locator('.project-storyline').getAttribute('data-revealed'), 'false', 'Offscreen storyline waits for the 85% scroll trigger');

  const lifecycle = await page.evaluate(() => window.__marsEntranceLifecycle);
  const lastOverlaySample = [...lifecycle.samples].reverse().find(sample => sample.overlay);
  const firstDetachedSample = lifecycle.samples.find(sample => !sample.overlay);
  assert.ok(lastOverlaySample && firstDetachedSample, 'Sampler observes startup DOM removal');
  for (const name of ['title', 'summary']) {
    assert.equal(lastOverlaySample.values[name].opacity, 0, `${name} stays hidden through the last sampled overlay frame`);
    const transition = firstSample(lifecycle.samples, name, value => value.opacity > 0.02 && value.opacity < 0.98);
    assert.ok(transition, `${name} records an in-progress opacity transition`);
    assert.ok(transition.time >= firstDetachedSample.time, `${name} does not begin before startup DOM removal`);
    assert.ok(transition.values[name].duration.split(',').every(value => value.trim() === '0.66s'), `${name} uses the user-selected 660ms transition`);
  }
  const titleStart = firstSample(lifecycle.samples, 'title', value => value.opacity > 0.02).time;
  const summaryStart = firstSample(lifecycle.samples, 'summary', value => value.opacity > 0.02).time;
  assert.ok(summaryStart - titleStart >= 55 && summaryStart - titleStart <= 155, `summary follows title by the 100ms stagger (observed ${(summaryStart - titleStart).toFixed(1)}ms)`);

  await page.locator('.project-menu').evaluate(element => window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * 0.4, behavior: 'instant' }));
  await page.waitForFunction(() => ['.project-menu', '.project-storyline'].every(selector => {
    const element = document.querySelector(selector);
    return element?.getAttribute('data-revealed') === 'true' && Number(getComputedStyle(element).opacity) === 1;
  }));
  const scrolledLifecycle = await page.evaluate(() => window.__marsEntranceLifecycle);
  const menuStart = firstSample(scrolledLifecycle.samples, 'menu', value => value.opacity > 0.02).time;
  const storylineStart = firstSample(scrolledLifecycle.samples, 'storyline', value => value.opacity > 0.02).time;
  assert.ok(storylineStart - menuStart >= 55 && storylineStart - menuStart <= 155, `storyline follows menu by the 100ms stagger after scroll (observed ${(storylineStart - menuStart).toFixed(1)}ms)`);

  let coveredModuleCount = 0;
  for (const [selector, minimum] of moduleCoverage) {
    const modules = page.locator(`.mars-case ${selector}`);
    const count = await modules.count();
    coveredModuleCount += count;
    assert.ok(count >= minimum, `${selector} remains represented in the page`);
    assert.equal(await modules.evaluateAll(elements => elements.filter(element => !element.hasAttribute('data-mars-reveal')).length), 0, `${selector} is covered by the reveal lifecycle`);
  }

  const pending = page.locator('[data-target-step="01"]');
  await pending.evaluate(element => window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * 0.90, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('[data-target-step="01"]')?.getAttribute('data-revealed') === 'false');
  assert.equal(await pending.evaluate(element => Number(getComputedStyle(element).opacity)), 0, 'A module below the 85% line remains truly transparent');
  await pending.evaluate(element => window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * 0.84, behavior: 'instant' }));
  await page.waitForFunction(() => {
    const opacity = Number(getComputedStyle(document.querySelector('[data-target-step="01"]')).opacity);
    return opacity > 0.02 && opacity < 0.98;
  });
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[data-target-step="01"]')).opacity) === 1);
  assert.equal(await pending.getAttribute('data-reveal-instant'), null, 'Normal scroll entrance keeps its transition');
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.waitForFunction(() => document.querySelector('[data-target-step="01"]')?.getAttribute('data-revealed') === 'true');
  assert.equal(await pending.getAttribute('data-reveal-instant'), null, 'Resize does not replay or convert a completed reveal');

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const strategyMap = page.locator('.strategy-map');
  await strategyMap.locator('a').first().focus();
  assert.equal(await strategyMap.getAttribute('data-reveal-instant'), 'true', 'Keyboard focus exposes its module instantly');
  assert.equal(await strategyMap.evaluate(element => Number(getComputedStyle(element).opacity)), 1, 'Focused module is actually visible');

  await page.locator('.mars-reading-nav').getByRole('button', { name: '链路简化', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#access .section-heading')?.getAttribute('data-revealed') === 'true');
  assert.equal(await page.locator('#access .section-heading').getAttribute('data-reveal-instant'), 'true', 'Directory jump exposes the relevant heading instantly');
  assert.equal(await page.locator('#access .entry-note').getAttribute('data-revealed'), 'false', 'Directory jump does not bypass the rest of a chapter');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('.mars-case [data-revealed="false"]'));
  assert.equal(await page.locator('.mars-case [data-mars-reveal]').evaluateAll(elements => elements.filter(element => Number(getComputedStyle(element).opacity) !== 1).length), 0, 'Reduced motion leaves every reveal module visible');
  assert.deepEqual(errors, [], 'Initial visit has no page errors');
  report.initialVisit = { entranceModules: Object.keys(entranceSelectors).length, coveredModuleKinds: moduleCoverage.length, coveredModules: coveredModuleCount, pageErrors: errors };
  return page;
}

async function verifyRouteEntrance(page, report) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => { location.hash = '#/'; });
  await page.locator('.home-fullpage').waitFor({ state: 'attached', timeout: 10000 });
  assert.equal(await page.locator('.startup-loading').count(), 0, 'Startup overlay remains removed on in-app navigation');
  await installSampler(page, '__marsRouteLifecycle');
  await page.evaluate(() => { location.hash = '#/projects/mars-era'; });
  await page.locator('.mars-case').waitFor({ state: 'attached' });
  await page.waitForFunction(() => {
    const element = document.querySelector('.project-status-panel');
    const opacity = Number(getComputedStyle(element).opacity);
    return element?.getAttribute('data-revealed') === 'true' && opacity > 0.02 && opacity < 0.98;
  });
  await page.locator('.project-status-panel a').focus();
  assert.equal(await page.locator('.project-status-panel').getAttribute('data-reveal-instant'), 'true', 'Focus upgrades an active entrance to instant');
  assert.equal(await page.locator('.project-status-panel').evaluate(element => Number(getComputedStyle(element).opacity)), 1, 'Focused active entrance becomes fully visible immediately');
  await page.waitForFunction(() => {
    const element = document.querySelector('.project-title-block');
    return element?.getAttribute('data-revealed') === 'true' && Number(getComputedStyle(element).opacity) === 1;
  }, null, { timeout: 3000 });
  const lifecycle = await page.evaluate(() => window.__marsRouteLifecycle);
  const appeared = lifecycle.samples.find(sample => sample.values.title);
  const transition = firstSample(lifecycle.samples, 'title', value => value.opacity > 0.02 && value.opacity < 0.98);
  assert.ok(appeared, 'Route sampler observes the new Mars page');
  assert.equal(appeared.overlay, false, 'Route entrance does not wait for a nonexistent startup overlay');
  assert.equal(appeared.values.title.opacity, 0, 'Route entrance begins from a painted hidden state');
  assert.equal(appeared.values.title.revealed, 'false', 'Route entrance initializes before revealing');
  assert.ok(transition, 'Route entrance records an in-progress opacity transition');
  assert.ok(transition.time - appeared.time < 250, 'Route entrance starts immediately after its hidden initialization');
  assert.equal(await page.locator('.startup-loading').count(), 0, 'Route entrance never recreates startup UI');
  report.routeNavigation = { hiddenAtFirstFrame: true, transitionStartedWithinMs: Math.round(transition.time - appeared.time) };
}

async function verifyCarouselEntrance(page, report) {
  await page.locator('.back-link').click();
  await page.locator('.project-intro-project-layer.is-interactive').waitFor({ timeout: 20000 });
  await installSampler(page, '__marsCarouselLifecycle');
  await page.getByRole('button', { name: 'Open 火星纪元', exact: true }).click();
  await page.locator('.project-open-overlay').waitFor({ state: 'attached' });
  await page.locator('.mars-case').waitFor({ state: 'attached', timeout: 5000 });
  assert.equal(await page.locator('.project-title-block').getAttribute('data-revealed'), 'false', 'Carousel route initializes the title behind the route overlay');
  assert.equal(await page.locator('.project-title-block').evaluate(element => Number(getComputedStyle(element).opacity)), 0, 'Carousel route title remains truly transparent behind the route overlay');
  await page.locator('.project-open-overlay').waitFor({ state: 'detached', timeout: 5000 });
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.project-title-block')).opacity) === 1);
  const lifecycle = await page.evaluate(() => window.__marsCarouselLifecycle);
  const lastOverlaySample = [...lifecycle.samples].reverse().find(sample => sample.overlay && sample.values.title);
  const transition = firstSample(lifecycle.samples, 'title', (value, sample) => !sample.overlay && value.opacity > 0.02 && value.opacity < 0.98);
  assert.ok(lastOverlaySample, 'Carousel sampler records the Mars title while the route overlay exists');
  assert.equal(lastOverlaySample.values.title.opacity, 0, 'The title stays hidden through the final route-overlay frame');
  assert.ok(transition, 'The title transition begins after the route overlay is removed');
  report.carouselNavigation = { hiddenThroughRouteOverlay: true, transitionAfterOverlayRemoval: true };
}

async function verifyObserverFallback(browser, report) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  await page.addInitScript(() => { delete window.IntersectionObserver; });
  await page.goto(base + '#/projects/mars-era');
  await page.locator('.mars-case').waitFor({ state: 'attached' });
  assert.equal(await page.locator('.mars-case [data-revealed="false"]').count(), 0, 'Missing IntersectionObserver never strands hidden content');
  assert.equal(await page.locator('.mars-case').evaluate(root => [...root.querySelectorAll('.project-title-block,.section-heading,.journey-step,.data-block')].filter(element => Number(getComputedStyle(element).opacity) !== 1).length), 0, 'Observer fallback is visibly complete');
  report.observerFallback = 'all representative modules visible';
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = {};
  try {
    const page = await verifyInitialVisit(browser, report);
    await verifyRouteEntrance(page, report);
    await verifyCarouselEntrance(page, report);
    await page.close();
    await verifyObserverFallback(browser, report);
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
