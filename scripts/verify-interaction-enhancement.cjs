// Catches native cursor leakage over copy/controls, weak stroke, and missing fallback.
const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.DEMO_URL||'http://127.0.0.1:5174/');
 await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});
 await p.mouse.move(100,180);
 assert.equal(await p.locator('.adventure-cursor-ring').count(),1,'global cursor mounted');
 for(const selector of ['#hero-title','.hero-lead','.hero-project-trigger','.keycap-round','header a']){
  const el=p.locator(selector).first();await el.hover({force:true});
  assert.equal(await el.evaluate(e=>getComputedStyle(e).cursor),'none',`native cursor leaked: ${selector}`);
 }
 assert.equal(await p.locator('.adventure-cursor-ring').evaluate(e=>getComputedStyle(e).borderTopWidth),'2px');
 assert.equal(await p.locator('.adventure-cursor-ring').evaluate(e=>getComputedStyle(e).width),'36px');
 assert.equal(await p.locator('.adventure-cursor-dot').evaluate(e=>getComputedStyle(e).width),'6px');
 const heroButton=p.locator('.hero-project-trigger');const rect=await heroButton.boundingBox();
 await p.mouse.move(rect.x+rect.width-8,rect.y+rect.height/2);await p.waitForTimeout(400);
 const moved=await heroButton.boundingBox();assert.ok(moved.x>rect.x+1,'Hero magnet must visibly move, not just set an overridden inline transform');
 await p.goto((process.env.DEMO_URL||'http://127.0.0.1:5174/')+'#/projects/mars-era');
 await p.locator('.mars-case').waitFor();await p.locator('.project-title-block h1').hover({force:true});
 assert.equal(await p.locator('.project-title-block h1').evaluate(e=>getComputedStyle(e).cursor),'none');
 assert.ok((await p.locator('[data-mars-reveal]').first().evaluate(e=>getComputedStyle(e).transitionDuration)).includes('0.66s'));
 await p.emulateMedia({reducedMotion:'reduce'});await p.mouse.move(400,180);
 assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('adventure-cursor-active')),false);
 assert.equal(await p.locator('.adventure-cursor-ring').evaluate(e=>getComputedStyle(e).opacity),'0');
 assert.deepEqual(errors,[]);console.log('PASS global cursor, text/buttons, 2px/6px, saved size, case timing, reduced motion');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
