const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
const{chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.DEMO_URL||'http://127.0.0.1:5174/';
(async()=>{const b=await chromium.launch();try{
 const s=await b.newPage();await s.goto(narrativeUrl('AI委托玩法-叙事演示-20260907','index.html'));
 const expected=await s.locator('main').evaluate(e=>({copy:[...e.querySelectorAll('h2,h3,h4,p,figcaption')].filter(x=>!x.closest('.live-demo')).map(x=>x.textContent.replace(/\s/g,'')),images:[...e.querySelectorAll('figure[data-image]')].map(x=>x.dataset.image)}));await s.close();
 for(const width of [1440,1920,768,390,360]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(base+'#/projects/ai-commission');await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});
 assert.equal(await p.locator('h1').innerText(),'AI 委托玩法');
 const text=(await p.locator('main').innerText()).replace(/\s/g,'');for(const copy of expected.copy)assert.ok(text.includes(copy),'Missing source content: '+copy);
 assert.deepEqual(await p.locator('figure[data-image]').evaluateAll(es=>es.map(e=>e.dataset.image).sort()),expected.images.sort());
 const before=await p.locator('.commission-image').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));await p.locator('main img').evaluateAll(async es=>{es.forEach(e=>e.loading='eager');await Promise.all(es.map(e=>e.decode()))});
 const after=await p.locator('.commission-image').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert.ok(before.every((v,i)=>Math.abs(v-after[i])<1));
 assert.equal(await p.locator('[data-inspect]').count(),7);for(const panel of await p.locator('[data-inspect]').all()){for(const btn of await panel.locator('.region-choice').all()){await btn.click();assert.equal(await btn.getAttribute('aria-pressed'),'true')}}
 assert.equal(await p.locator('dialog,.image-tool,.image-button').count(),0);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await p.locator('.live-demo').count(),2);assert.equal(await p.locator('.live-demo[data-paused=true]').count(),2);
 await p.locator('.commission-reading-nav button').last().click();assert.ok(await p.locator('#results').evaluate(e=>e.getBoundingClientRect().top>=60));
 await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(100);assert.equal(await p.locator('[role=progressbar]').getAttribute('aria-valuenow'),'100');
 fs.mkdirSync(path.resolve('qa/commission'),{recursive:true});for(const id of ['top','overview','dialogue','feedback','results'])await p.locator('#'+id).screenshot({path:path.resolve(`qa/commission/${id}-${width}.png`),style:'.site-nav,.site-nav *,.commission-reading-nav,.mars-reading-progress{visibility:hidden!important}'});
 assert.deepEqual(errors,[]);console.log(width+' source/layout/regions/reduced PASS');await p.close();}
 const p=await b.newPage({reducedMotion:'reduce'});await p.goto(base);await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});await p.getByRole('button',{name:'查看项目'}).click();await p.locator('.project-intro-project-layer.is-interactive').waitFor();
 for(const slug of ['mars-era','habitat-ai-dialogue','ai-commission','ava-league','ai-design-lab']){await p.waitForFunction(slug=>document.querySelector('.project-video-showcase')?.dataset.activeProject===slug,slug);if(slug==='ai-commission'){assert.equal(await p.locator('.is-active-slot video').count(),1);}await p.getByRole('button',{name:'Next project',exact:true}).click();}
 console.log('Five-project order and commission video PASS');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
