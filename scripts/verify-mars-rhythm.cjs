const { chromium } = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.DEMO_URL || 'http://127.0.0.1:5174/';
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 1920, 768, 390, 360]) {
      const page = await browser.newPage({viewport:{width,height:960}, reducedMotion:'no-preference'});
      await page.goto(base + '#/projects/mars-era');
      await page.locator('.startup-loading').waitFor({state:'hidden',timeout:45000});
      for (const [id,title] of [['access','链路简化'],['focus','目标明确'],['feedback','阶梯式反馈']]) {
        assert.equal(await page.locator(`#${id} h2`).first().innerText(),title,'Strategy name remains the chapter heading');
      }
      assert.ok(await page.locator('[data-mars-reveal][data-revealed="false"]').count()>5,'Below-fold modules wait for scroll, instead of being permanently static');
      const style = await page.locator('#access').evaluate(e => {
        const chapter=getComputedStyle(e), claim=getComputedStyle(e.querySelector('.strategy-thesis'));
        const hidden=getComputedStyle([...document.querySelectorAll('[data-revealed="false"]')].find(n=>n.getBoundingClientRect().height>0));
        return {line:chapter.borderTopColor,padding:chapter.paddingTop,margin:chapter.marginTop,claim:claim.color,size:claim.fontSize,duration:hidden.transitionDuration,transform:hidden.transform};
      });
      assert.equal(style.line,'rgba(255, 255, 255, 0.18)');
      assert.equal(style.padding,width>760?'80px':'48px');
      assert.equal(style.margin,style.padding,'Whitespace on both sides of chapter boundary');
      assert.equal(style.claim,'rgb(243, 241, 237)','Core argument stays brighter than its explanation');
      assert.equal(style.size,width>760?'24px':'20px');
      assert.ok(style.duration.includes('0.66s'),'User-selected 660ms reveal timing');
      assert.equal(style.transform,'matrix(1, 0, 0, 1, 0, 24)','Only a 24px vertical reveal, no blur');
      if(width===1920){
        await page.locator('.strategy-map').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.80,behavior:'instant'}));
        await page.waitForFunction(()=>document.querySelector('.strategy-map').dataset.revealed==='true');
        await page.waitForTimeout(160);
        const nodeOpacity=await page.locator('.strategy-map [data-diagram-node]').evaluateAll(nodes=>nodes.map(n=>Number(getComputedStyle(n).opacity)));
        assert.ok(nodeOpacity[0]>nodeOpacity[1] && nodeOpacity[1]>=nodeOpacity[2],'Graphic nodes use a real short stagger, not identical simultaneous fades');
        await page.waitForTimeout(850);
        assert.ok((await page.locator('.strategy-map [data-diagram-node]').evaluateAll(nodes=>nodes.map(n=>Number(getComputedStyle(n).opacity)))).every(n=>n===1),'All diagram nodes finish visible');
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      }
      await page.locator('.mars-reading-nav').getByRole('button',{name:'链路简化',exact:true}).click();
      await page.waitForTimeout(1000);
      assert.equal(await page.locator('#access .section-heading').getAttribute('data-revealed'),'true','Directory heading is immediately readable');
      assert.equal(await page.locator('#access .entry-note').getAttribute('data-revealed'),'false','Directory jump does not bypass later module reveals');
      assert.equal(await page.locator('#access .flow .diagram-arrow > path').count(),7,'Five original links and two shortcut links are drawn');
      const curves=await page.locator('#access .flow .diagram-arrow > path').evaluateAll(paths=>paths.map(p=>p.getAttribute('d')));
      assert.ok(curves.every(d=>d.includes('C')),'Both main paths use Bezier connections');
      if(width>=1100){
        const positions=await page.locator('#access .path-row').evaluateAll(rows=>rows.map(row=>[...row.querySelectorAll('.path-symbol')].map(n=>n.getBoundingClientRect().left)));
        assert.deepEqual(positions[1],[positions[0][0],positions[0][1],positions[0][5]],'Shared entry, activity and destination stay aligned');
        const levels=await page.locator('.feedback-ladder > article').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
        assert.ok(levels[0]>levels[1] && levels[1]>levels[2],'Feedback levels rise progressively');
      }
      assert.equal(await page.locator('#access .removed').count(),3,'Three omitted steps stay visible');
      const pos = await page.locator('#access .section-heading').evaluate(e=>({top:e.getBoundingClientRect().top,nav:document.querySelector('.mars-reading-nav').getBoundingClientRect().bottom}));
      assert.ok(pos.top>=pos.nav+15,'Revealed heading clears sticky navigation');
      const group = page.locator('[data-target-step="01"]');
      await group.evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.90,behavior:'instant'}));
      await page.waitForTimeout(100);
      assert.equal(await group.getAttribute('data-revealed'),'false','Module below the 85% trigger stays pending');
      await group.evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight*.84,behavior:'instant'}));
      await page.waitForTimeout(160);
      const fading=await group.evaluate(e=>Number(getComputedStyle(e).opacity));
      assert.ok(fading>0 && fading<1,'A real opacity transition is in progress, not just a visible-state attribute');
      await page.waitForTimeout(740);
      assert.equal(await group.getAttribute('data-revealed'),'true','Scrolling reveals a proof group');
      if(width>760) assert.equal(await page.locator('[data-target-step="02"]').getAttribute('data-revealed'),'true','A desktop row appears together');
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.waitForTimeout(500);
      assert.equal(await group.getAttribute('data-revealed'),'true','Read modules do not disappear on return');
      await page.locator('.strategy-map a').first().focus();
      assert.equal(await page.locator('.strategy-map').getAttribute('data-revealed'),'true','Keyboard focus reveals its entire module');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForTimeout(150);
      assert.equal(await page.locator('[data-revealed="false"]').count(),0,'Reduced motion exposes all content');
      assert.equal(await page.locator('details.source-note').count(),0,'Version qualifications are not hidden in a disclosure');
      assert.ok(await page.locator('.source-note p').isVisible(),'Version qualification stays readable');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
      await page.close();
      console.log(`${width}: hierarchy, curves, scroll reveal, row grouping, focus and reduced motion PASS`);
    }
    const fallback=await browser.newPage();
    await fallback.addInitScript(()=>{delete window.IntersectionObserver;});
    await fallback.goto(base+'#/projects/mars-era');
    await fallback.locator('.mars-case').waitFor();
    assert.equal(await fallback.locator('.mars-case [data-revealed="false"]').count(),0,'Observer unavailable: content stays visible');
    await fallback.close();
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
