const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5174/';
const label = process.env.CHECK_LABEL || 'experience';
const out = path.resolve(__dirname, '../qa/preload-release', label);
fs.mkdirSync(out, {recursive:true});
(async () => {
 const browser = await chromium.launch();
 const report = {base, errors:[], framesAtExit:0, requested:[], finished:[], playback:[]};
 try {
  const context = await browser.newContext({viewport:{width:1440,height:960},recordVideo:{dir:out,size:{width:1440,height:960}}});
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.addInitScript(() => {
   window.__experience = {draws:[],longTasks:[],activeItems:[]};
   const original = CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage = function(...args) {
    const start=performance.now();
    const value=Reflect.apply(original,this,args);
    if(this.canvas.classList.contains('project-intro-canvas')) window.__experience.draws.push({at:start,cost:performance.now()-start,visible:this.canvas.classList.contains('is-visible')});
    return value;
   };
   try {new PerformanceObserver(list => window.__experience.longTasks.push(...list.getEntries().map(e=>({at:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});} catch {}
   new MutationObserver(() => {
    const title=document.querySelector('.startup-loading-item.is-active strong')?.textContent;
    if(title&&window.__experience.activeItems.at(-1)!==title)window.__experience.activeItems.push(title);
   }).observe(document,{subtree:true,attributes:true,childList:true});
  });
  const frames=new Set();
  page.on('pageerror',e=>report.errors.push(String(e)));
  page.on('request',r=>report.requested.push({url:r.url(),at:Date.now()}));
  page.on('requestfinished',r=>{report.finished.push({url:r.url(),at:Date.now()});if(/project-intro-\d{3}\.webp/.test(r.url()))frames.add(r.url());});
  const start=Date.now();
  await page.goto(base);
  await page.locator('.startup-loading').waitFor({state:'hidden',timeout:180000});
  report.bootMs=Date.now()-start;
  report.framesAtExit=frames.size;
  report.bootFinishedAt=Date.now();
  await page.screenshot({path:path.join(out,'home.png')});
  for (let repeat=0; repeat<2; repeat++) {
   const t=await page.evaluate(()=>performance.now());
   await page.getByRole('button',{name:'查看项目',exact:true}).click();
   await page.locator('.project-intro-project-layer.is-interactive').waitFor({timeout:60000});
   const end=await page.evaluate(()=>performance.now());
   const draws=await page.evaluate(t=>window.__experience.draws.filter(d=>d.at>=t&&d.visible),t);
   const gaps=draws.slice(1).map((d,i)=>d.at-draws[i].at).sort((a,b)=>a-b);
   report.playback.push({repeat,elapsedMs:end-t,draws:draws.length,maxGapMs:gaps.at(-1),p95GapMs:gaps[Math.floor(gaps.length*.95)],maxDrawCostMs:Math.max(0,...draws.map(d=>d.cost))});
   await page.screenshot({path:path.join(out,`projects-${repeat}.png`)});
   await page.keyboard.press('Home');
   await page.getByRole('button',{name:'查看项目',exact:true}).waitFor();
   await page.waitForTimeout(1300);
  }
  report.browser=await page.evaluate(()=>window.__experience);
  report.metrics=await cdp.send('Performance.getMetrics');
  await context.close();
  if (!process.env.BASELINE) {
   assert.equal(report.framesAtExit,301,'all frames must be downloaded before loader exits');
   assert.deepEqual(report.browser.activeItems,['Homepage Base','Hero Visual','Project Transition','Mars Era','AI Dialogue','AI Commission','AVA League']);
   assert.equal(report.requested.filter(r=>r.at<=report.bootFinishedAt&&/ai-lab\.mp4|ai-design-lab\//.test(r.url)).length,0,'no LAB during startup');
   assert.deepEqual(report.errors,[]);
   for (const run of report.playback) {assert.ok(run.draws>40,'sequence actually draws');assert.ok(run.elapsedMs<6000,'four-second sequence must not stretch into multi-second decode stalls on the verification machine');}
  }
  console.log(JSON.stringify({bootMs:report.bootMs,framesAtExit:report.framesAtExit,playback:report.playback,errors:report.errors}));
 } finally {fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
