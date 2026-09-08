const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.DEMO_URL||'http://127.0.0.1:5174/';
(async()=>{
 const browser=await chromium.launch();
 try {
  const source=await browser.newPage();
  await source.goto(narrativeUrl('生境-AI对话-叙事演示-20260907','index.html'));
  const expected=await source.locator('main').evaluate(el=>({copy:[...el.querySelectorAll('h2,h3,h4,p,figcaption')].map(e=>e.textContent.replace(/\s+/g,'').trim()).filter(Boolean),images:[...el.querySelectorAll('img')].map(e=>decodeURIComponent(e.getAttribute('src').split('/').pop()))}));
  await source.close();
  for(const width of [1440,1920,768,390,360]){
   const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(base+'#/projects/habitat-ai-dialogue');
   await page.locator('.startup-loading').waitFor({state:'detached',timeout:45000});
   assert.equal(await page.locator('h1').innerText(),'AI 装修对话','Route must display the updated case, not the old five-layer case');
   if(width>=1100){const title=await page.locator('#top .project-title-block').boundingBox(),status=await page.locator('#top .project-status-panel').boundingBox(),menu=await page.locator('#top .project-menu').boundingBox();assert.ok(title.x<status.x);assert.ok(Math.abs(title.y-status.y)<2,'Title and summary align');assert.ok(menu.y>=title.y+title.height,'Directory follows title and preview');assert.ok(Math.abs(menu.x-title.x)<2,'Directory aligns with title column');}
   assert.ok(await page.locator('.section-heading h2').evaluateAll(es=>es.every(e=>parseFloat(getComputedStyle(e).fontSize)<=32)),'Chapter headings retain the approved scale');
   const actual=(await page.locator('main').innerText()).replace(/\s+/g,'');
   for(const copy of expected.copy)assert.ok(actual.includes(copy),'Missing source passage: '+copy);
   assert.ok(!actual.includes('商业感知'),'Old commercial thesis is not retained');
   assert.equal(await page.locator('[data-bubble-category]').count(),5);
   assert.equal(await page.locator('.ai-crop').count(),4);
   assert.equal(await page.locator('dialog,[data-zoom],.image-tool').count(),0);
   const beforeLoad=await page.locator('.ai-image-frame').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));
   await page.locator('main img').evaluateAll(async imgs=>{imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()));});
   const afterLoad=await page.locator('.ai-image-frame').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));
   assert.ok(beforeLoad.every((h,i)=>Math.abs(h-afterLoad[i])<1),'Image height is reserved before lazy loading');
   const pics=await page.locator('main img').evaluateAll(imgs=>imgs.map(i=>({name:decodeURIComponent(i.src.split('/').pop()),w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,nw:i.naturalWidth,nh:i.naturalHeight,crop:!!i.closest('.ai-crop')})));
   assert.equal(pics.length,33);assert.equal(new Set(pics.map(i=>i.name)).size,28);
   assert.deepEqual(pics.map(i=>i.name).sort(),expected.images.sort());
   for(const i of pics){assert.ok(i.w<=i.nw+1);assert.ok(Math.abs(i.w/i.h-i.nw/i.nh)<.02);}
   assert.ok(await page.locator('.ai-crop').evaluateAll(es=>es.every(e=>getComputedStyle(e).overflow==='hidden'&&parseFloat(getComputedStyle(e).borderRadius)>=8)));
   for(const key of ['tools','progress','room','chat','suggestions','actions','input']){await page.locator(`[data-zone="${key}"]`).click();assert.equal(await page.locator(`[data-zone="${key}"]`).getAttribute('aria-pressed'),'true');assert.ok((await page.locator('.zone-explanation').innerText()).length>25);}
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
   await page.locator('.ai-reading-nav button').filter({hasText:'重型任务'}).click();
   assert.ok(await page.locator('#process').evaluate(e=>e.getBoundingClientRect().top>=60));
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
   await page.waitForTimeout(80);
   assert.equal(Number(await page.locator('[role="progressbar"]').getAttribute('aria-valuenow')),100);
   assert.equal(await page.locator('video').count(),1);
   await page.locator('video').evaluate(v=>v.load());await page.waitForFunction(()=>document.querySelector('video').readyState>=1);
   assert.ok(await page.locator('video').evaluate(v=>v.videoWidth>0&&v.controls));
   const out=path.resolve(__dirname,'../qa/ai-dialogue');fs.mkdirSync(out,{recursive:true});
   for(const id of ['top','layout','task-map','states','control','process','outcomes']){await page.locator(`#${id}`).screenshot({path:path.join(out,`${id}-${width}.png`),style:'.site-nav,.site-nav *,.ai-reading-nav,.mars-reading-progress{visibility:hidden!important}'});}
   assert.deepEqual(errors,[]);console.log(`${width}: source copy, 28 assets/33 placements, 4 rounded crops, 7 zones, layout/progress/video PASS`);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
