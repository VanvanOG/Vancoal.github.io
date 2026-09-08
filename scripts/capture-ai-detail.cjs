const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4174/#/projects/habitat-ai-dialogue');await page.locator('.startup-loading').waitFor({state:'detached',timeout:45000});
 await page.locator('main img').evaluateAll(async es=>{es.forEach(e=>e.loading='eager');await Promise.all(es.map(e=>e.decode()))});
 const out=path.resolve(__dirname,'../qa/ai-dialogue');
 for(const [name,selector] of [['light-targets','#control .ai-story:nth-of-type(1)'],['tabletop','#control .ai-story:nth-of-type(2)'],['heavy-analysis','#process .ai-evidence.count-3']]){
  await page.locator(selector).screenshot({path:path.join(out,name+'.png'),style:'.site-nav,.site-nav *,.ai-reading-nav,.mars-reading-progress{visibility:hidden!important}'});
 }
 await page.locator('video').evaluate(async v=>{v.muted=true;await v.play()});await page.waitForFunction(()=>document.querySelector('video').currentTime>1);await page.locator('video').evaluate(v=>v.pause());
 await page.locator('video').screenshot({path:path.join(out,'video-playing.png'),style:'.site-nav,.ai-reading-nav,.mars-reading-progress{visibility:hidden!important}'});
 await page.setViewportSize({width:360,height:800});
 await page.locator('#process .ai-evidence.count-3 article').first().screenshot({path:path.join(out,'mobile-evidence.png'),style:'.site-nav,.ai-reading-nav,.mars-reading-progress{visibility:hidden!important}'});
 console.log('Detail screenshots captured; video advanced past 1 second.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
