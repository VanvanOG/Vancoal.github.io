const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
const {chromium} = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'qa', 'mars-migration');
fs.mkdirSync(out, {recursive:true});
const base = process.env.DEMO_URL || 'http://127.0.0.1:5174/';
const report = {viewports:[], interactions:[], errors:[]};
const normalize = s => s.replace(/\s+/g, '');
async function images(page) {
  await page.evaluate(async()=>{
    document.querySelectorAll('img').forEach(i=>i.loading='eager');
    await Promise.all([...document.images].filter(i=>i.src).map(i=>i.decode().catch(()=>{})));
    await document.fonts.ready;
  });
}
(async()=>{
  const browser = await chromium.launch({headless:true});
  try {
    const source = await browser.newPage();
    await source.goto(pathToFileURL(narrativePath('火星纪元-叙事演示-20260905','index.html')).href);
    const expected = await source.evaluate(()=>({
      text:[...document.querySelectorAll('#context p, #context h3, #strategies p, #strategies h3, #layout p, #access p, #focus p, #focus h3, #feedback p, #feedback h3, #feedback h4, #results p, #results h3')].map(e=>e.textContent),
      assets:[...new Set([...document.querySelectorAll('img[src]')].map(i=>decodeURIComponent(i.getAttribute('src').split('/').pop())))],
      rows:[...document.querySelectorAll('.bar-row')].map(e=>e.textContent.replace(/\s+/g,''))
    }));
    await source.close();
    for(const width of [1440,1920,768,390,360]) {
      const context = await browser.newContext({viewport:{width,height:width<500?844:1000},reducedMotion:'reduce'});
      const page = await context.newPage();
      page.on('pageerror',err=>report.errors.push(String(err)));
      await page.goto(base+'#/projects/mars-era');
      await page.getByRole('heading',{name:'火星纪元',exact:true}).waitFor();
      await images(page);
      await page.waitForFunction(()=>!document.documentElement.classList.contains('is-startup-loading'));
      await page.locator('.startup-loading').waitFor({state:'hidden'});
      await page.screenshot({path:path.join(out,`hero-${width}.png`)});
      const review = await page.evaluate(()=>({
        width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        broken:[...document.querySelectorAll('.mars-case img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
        text:document.querySelector('.mars-case').textContent,
        assets:[...new Set([...document.querySelectorAll('.mars-case img')].map(i=>decodeURIComponent(i.src.split('/').pop())))],
        battle:document.querySelectorAll('[data-target-step]').length,rewards:document.querySelectorAll('[data-reward-state]').length,
        rows:[...document.querySelectorAll('.bar-row')].map(r=>({count:+r.dataset.count,denominator:+r.dataset.denominator})),
        overflow:[...document.querySelectorAll('.mars-case h1,.mars-case h2,.mars-case h3,.mars-case h4,.mars-case p,.mars-case button')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.slice(0,60))
      }));
      assert.equal(review.width,review.scrollWidth,`page overflow ${width}`);
      assert.deepEqual(review.broken,[]); assert.deepEqual(review.overflow,[],`text overflow ${width}`);
      assert.equal(review.battle,6); assert.equal(review.rewards,5); assert.equal(review.rows.length,12);
      assert.deepEqual(review.assets.sort(),expected.assets.sort(),'all source images migrated');
      for(const paragraph of expected.text) assert.ok(normalize(review.text).includes(normalize(paragraph)),`missing source copy: ${paragraph}`);
      assert.ok(!/5\.5|70%|进攻转化/.test(review.text),'no stale conclusions');
      const ratios=[[2736,14822],[502,14822],[1028,14822],[387,14822],[6426,6426],[6353,6426],[6040,6426],[5781,6426],[188,3222],[294,1188],[602,9800],[4697,9659]];
      assert.deepEqual(review.rows.map(r=>[r.count,r.denominator]),ratios);
      report.viewports.push({width,assets:review.assets.length,rows:review.rows.length,battle:review.battle,rewards:review.rewards,overflow:review.overflow});
      for(const key of ['goal','cost','actions','queue','secondary','time','battle']) {
        await page.locator(`[data-zone="${key}"]`).click();
        assert.equal(await page.locator(`[data-zone="${key}"]`).getAttribute('aria-pressed'),'true');
        assert.ok(await page.locator('#zone-copy').textContent());
      }
      for(const id of ['layout','focus','feedback','results']) {
        await page.locator('.mars-reading-nav').getByRole('button',{name:{layout:'完整界面',focus:'目标明确',feedback:'阶梯式反馈',results:'数据结果'}[id],exact:true}).click();
        await page.waitForFunction(id=>document.querySelector(`[id="${id}"]`).getBoundingClientRect().top<180,id);
        await page.waitForFunction(id=>document.querySelector('.mars-reading-nav [aria-current]')?.textContent==={layout:'完整界面',focus:'目标明确',feedback:'阶梯式反馈',results:'数据结果'}[id],id);
        await page.screenshot({path:path.join(out,`${id}-${width}.png`)});
      }
      if(width===1440||width===390) for(const id of ['battle-results','growth']) await page.locator('#'+id).screenshot({path:path.join(out,`${id}-${width}.png`)});
      await page.locator('#results').evaluate(e=>e.scrollIntoView());
      await page.waitForFunction(()=>document.querySelector('.mars-reading-nav [aria-current]')?.textContent==='数据结果');
      assert.ok(await page.locator('.mars-reading-nav [aria-current]').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),'current chapter visible on narrow screens');
      assert.equal(await page.locator('[data-zoom], .image-tool, .mars-lightbox').count(),0,'no image enlargement controls');
      await page.locator('.annotated-screen img').click();
      assert.equal(await page.getByRole('dialog').count(),0,'image remains inline');
      await page.locator('.back-link').click();
      await page.waitForURL(url=>!url.hash.includes('/projects/'));
      report.interactions.push(`${width}: 7 zones, chapter navigation, inline images without zoom controls, back link`);
      await context.close();
    }
    assert.deepEqual(report.errors,[]);
  } finally {fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)); await browser.close();}
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
