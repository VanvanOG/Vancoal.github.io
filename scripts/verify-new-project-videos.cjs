const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:5175/';
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(String(e)));await p.goto(base);await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});await p.getByRole('button',{name:'查看项目',exact:true}).click();await p.locator('.project-intro-project-layer.is-interactive').waitFor();
 fs.mkdirSync('qa/new-project-videos',{recursive:true});
 for(const [slug,title,file]of [['ai-commission','AI 委托玩法','ai-commission-v1.mp4'],['ava-league','AVA 联赛','ava-league-v1.mp4']]){
  for(let i=0;i<5&&await p.locator('.project-video-showcase').getAttribute('data-active-project')!==slug;i++){await p.getByRole('button',{name:'Next project',exact:true}).click();await p.waitForTimeout(700);}
  assert.equal(await p.locator('.project-video-showcase').getAttribute('data-active-project'),slug);
  const v=p.locator('.is-active-slot video');assert.equal(await v.count(),1,'Project must use video, not placeholder: '+slug);assert.ok((await v.getAttribute('src')).endsWith(file));assert.equal(await p.locator('.is-active-slot .commission-cover').count(),0);
  await v.evaluate(async e=>{await e.play();});await p.waitForFunction(()=>{const v=document.querySelector('.is-active-slot video');return v.readyState>=2&&v.currentTime>0.1&&v.videoWidth>0;});
  console.log(slug,await v.evaluate(e=>({duration:e.duration,width:e.videoWidth,height:e.videoHeight,muted:e.muted,loop:e.loop})));await p.screenshot({path:'qa/new-project-videos/'+slug+'.png'});
  const open=p.getByRole('button',{name:'Open '+title,exact:true});await open.hover();assert.equal(await open.evaluate(e=>getComputedStyle(e).cursor),'pointer');assert.equal(await open.locator('.lucide-play').count(),1);
  await p.emulateMedia({reducedMotion:'no-preference'});await open.click();await p.locator('.project-open-overlay video').waitFor();assert.ok((await p.locator('.project-open-overlay video').getAttribute('src')).endsWith(file));await p.locator('.project-open-overlay').waitFor({state:'detached'});assert.ok(p.url().endsWith('/projects/'+slug));await p.emulateMedia({reducedMotion:'reduce'});await p.locator('#top .back-link').click();await p.locator('.project-intro-project-layer.is-interactive').waitFor();
 }assert.deepEqual(errors,[]);console.log('PASS both videos decode/play, placeholders removed, play buttons, transition video and return');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
