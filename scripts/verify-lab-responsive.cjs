const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:5174/';
(async()=>{const browser=await chromium.launch();const out=path.resolve(__dirname,'../qa/lab-responsive');fs.mkdirSync(out,{recursive:true});try{
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const width of [768,360,390,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'#/projects/ai-design-lab');await page.locator('h1').waitFor();
  await page.locator('.startup-loading').waitFor({state:'hidden',timeout:45000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}: page must not overflow`);
  for(const flow of await page.locator('.ai-lab-flow-nodes').all()){
   await flow.scrollIntoViewIfNeeded();await flow.evaluate(e=>e.scrollLeft=e.scrollWidth);
   assert.equal(await flow.evaluate(e=>{const last=e.lastElementChild.getBoundingClientRect(),r=e.getBoundingClientRect();return last.right<=r.right+1&&last.left>=r.left-1;}),true,'Last flow node remains reachable');
   await flow.evaluate(e=>e.scrollLeft=0);
  }
  await page.locator('.ai-lab-section-grid').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${width}.png`)});
  console.log('PASS',width,'no page overflow, all flow nodes reachable');
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
