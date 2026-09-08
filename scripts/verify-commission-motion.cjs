const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.DEMO_URL||'http://127.0.0.1:5174/';
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.addInitScript(()=>{window.samples=[];const tick=()=>{const el=document.querySelector('.commission-case .title-row');if(el)window.samples.push({blocked:!!document.querySelector('.startup-loading,.project-open-overlay'),opacity:+getComputedStyle(el).opacity});requestAnimationFrame(tick)};requestAnimationFrame(tick)});
 await p.goto(base+'#/projects/ai-commission');await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});await p.waitForTimeout(900);
 const samples=await p.evaluate(()=>window.samples);assert.ok(samples.some(x=>x.blocked&&x.opacity===0));assert.ok(samples.some(x=>!x.blocked&&x.opacity>0&&x.opacity<1));
 for(const id of ['discovery-motion','placement-motion']){
  const demo=p.locator('#'+id);await demo.scrollIntoViewIfNeeded();await p.waitForTimeout(1200);const start=await demo.getAttribute('data-elapsed');await p.waitForTimeout(500);assert.notEqual(await demo.getAttribute('data-elapsed'),start);
  await demo.getByRole('button',{name:'暂停自动播放'}).click();const paused=await demo.getAttribute('data-elapsed');await p.waitForTimeout(300);assert.equal(await demo.getAttribute('data-elapsed'),paused);
  await demo.getByRole('button',{name:'重新播放'}).click();await p.waitForTimeout(300);assert.ok(+await demo.getAttribute('data-elapsed')<600);
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(150);const off=await demo.getAttribute('data-elapsed');await p.waitForTimeout(350);assert.equal(await demo.getAttribute('data-elapsed'),off);
 }
 await p.locator('.commission-reading-nav button').last().click();await p.waitForTimeout(1200);assert.equal(await p.locator('#results .section-heading').getAttribute('data-revealed'),'true');
 for(let y=0;y<await p.evaluate(()=>document.documentElement.scrollHeight);y+=650){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(30)}await p.waitForTimeout(700);
 assert.ok(await p.locator('[data-ai-module]').evaluateAll(es=>es.every(e=>e.dataset.revealed==='true')));
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelectorAll('.live-demo[data-paused=true]').length===2);
 await p.locator('.commission-footer a').click();await p.locator('.project-intro-project-layer.is-interactive').waitFor();
 for(let i=0;i<2;i++)await p.getByRole('button',{name:'Next project',exact:true}).click();
 await p.getByRole('button',{name:'Open AI 委托玩法',exact:true}).waitFor({state:'visible'});
 await p.screenshot({path:'qa/commission/carousel.png'});
 await p.getByRole('button',{name:'Open AI 委托玩法',exact:true}).click();await p.waitForURL('**/#/projects/ai-commission');await p.locator('.project-open-overlay').waitFor({state:'detached'});assert.equal(await p.locator('h1').innerText(),'AI 委托玩法');
 assert.deepEqual(errors,[]);console.log('PASS entrance, module reveal, demo play/pause/replay/offscreen, reduced motion and commission carousel route');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
