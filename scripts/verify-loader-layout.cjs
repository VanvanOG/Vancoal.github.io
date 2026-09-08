const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.BASE_URL || 'http://127.0.0.1:5174/';
const out=path.resolve(__dirname,'../qa/preload-release/loader-layout');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('**/project-intro-150.webp',route=>route.abort());
 await page.goto(base);
 const retry=page.getByRole('button',{name:/重试/});
 await retry.waitFor({timeout:120000});
 assert.equal(await page.locator('.startup-loading').isVisible(),true);
 for(const width of [1920,1440,768,390,360]){
  await page.setViewportSize({width,height:width<760?800:900});await page.waitForTimeout(250);
  const boxes=await page.evaluate(()=>{
   const nodes=[document.querySelector('.startup-loading-item.is-active strong'),...document.querySelectorAll('.startup-loading button')];
   return nodes.filter(Boolean).map(node=>{const r=node.getBoundingClientRect();return {text:node.textContent,x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:innerWidth,height:innerHeight};});
  });
  assert.ok(boxes.length>=2,'active label and retry are present');
  for(const box of boxes){assert.ok(box.x>=0&&box.right<=box.width+1,`horizontal ${width} ${box.text}`);assert.ok(box.y>=0&&box.bottom<=box.height,`vertical ${width} ${box.text}`);}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:path.join(out,`retry-${width}.png`)});
 }
 await page.unroute('**/project-intro-150.webp');
 await retry.focus();await page.keyboard.press('Enter');
 await page.locator('.startup-loading').waitFor({state:'hidden',timeout:120000});
 console.log('PASS loader label/retry layout at1920/1440/768/390/360 and keyboard retry');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
