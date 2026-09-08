const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:5174/';
(async()=>{const browser=await chromium.launch();try{
 const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await p.goto(base+'#/projects/ava-league');await p.waitForTimeout(800);
 assert.equal(await p.locator('main.ava-case').count(),1,'AVA must render its new narrative page');
 await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});
 const source=await browser.newPage();await source.goto(narrativeUrl('AVA联赛-数据分析演示-20260907','index.html'));
 const expected=await source.locator('main>section:not(#top)').evaluateAll(sections=>sections.flatMap(s=>[...s.querySelectorAll('h2,h3,h4,p')].map(e=>e.textContent.replace(/\s/g,''))).filter(Boolean));
 const text=(await p.locator('main').textContent()).replace(/\s/g,'');for(const s of expected)assert.ok(text.includes(s),'Missing source passage: '+s);
 assert.equal(await p.locator('.ava-case figure[data-image]').count(),8);assert.equal(new Set(await p.locator('.ava-case img').evaluateAll(es=>es.map(e=>e.src))).size,7);
 for(const id of ['main','rules','behavior-chart','tasks-list','tasks-action','shop','ranking'])assert.ok(fs.readFileSync(`public/media/ava-league/${id}.webp`).equals(fs.readFileSync(narrativePath('AVA联赛-数据分析演示-20260907','assets',`${id}.webp`))),'Original asset retained: '+id);
 await p.locator('.ava-case img').evaluateAll(es=>Promise.all(es.map(async e=>{e.loading='eager';await e.decode();})));assert.ok(await p.locator('.ava-case img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)));
 const captions=await source.locator('main figure[data-image]').evaluateAll(es=>es.map(e=>e.dataset.caption));assert.deepEqual(await p.locator('.ava-case figcaption').allTextContents(),captions);
 assert.equal(await p.locator('.ava-case dialog,.ava-case [title*=放大]').count(),0);
 fs.mkdirSync('qa/ava',{recursive:true});
 for(const width of [1440,1920,768,390,360]){
  await p.setViewportSize({width,height:1000});await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(100);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Overflow at '+width);
  await p.locator('#top').screenshot({path:`qa/ava/hero-${width}.png`});
  const buttons=p.locator('.ava-case .regions button');assert.equal(await buttons.count(),5);
  for(let i=0;i<5;i++){await buttons.nth(i).click();assert.equal(await buttons.nth(i).getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.ava-case .regions [aria-pressed=true]').count(),1);const box=await p.locator('.ava-highlight').evaluate(e=>[e.style.left,e.style.top]);assert.deepEqual(box,[['19%','72%'],['63%','75%'],['94%','16%'],['94%','29%'],['94%','43%']][i]);}
  for(const id of ['reward','analysis','decisions','outcome']){await p.locator('.ava-reading-nav').getByRole('button',{name:({reward:'规则与奖励',analysis:'分层发现',decisions:'任务原则',outcome:'分析产出'})[id],exact:true}).click();await p.waitForTimeout(100);assert.ok((await p.locator('#'+id+' h2').boundingBox()).y>=60,'Heading obscured');}
  const invalid=await p.locator('.ava-case img').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.width>Number(e.getAttribute('width'))+1||Math.abs(r.width/r.height-Number(e.getAttribute('width'))/Number(e.getAttribute('height')))>0.01;}).map(e=>e.src));assert.deepEqual(invalid,[]);
  console.log(width+' content/layout/hotspots PASS');
 }
 await p.goto(base);await p.locator('.startup-loading').waitFor({state:'detached',timeout:45000});await p.getByRole('button',{name:'查看项目',exact:true}).click();await p.locator('.project-intro-project-layer.is-interactive').waitFor();
 for(const name of ['火星纪元','AI 装修对话','AI 委托玩法','AVA 联赛','AI Design Lab']){await p.getByRole('button',{name:'Open '+name,exact:true}).waitFor({state:'visible'});if(name!=='AI Design Lab')await p.getByRole('button',{name:'Next project',exact:true}).click();}
 await p.getByRole('button',{name:'Previous project',exact:true}).click();const open=p.getByRole('button',{name:'Open AVA 联赛',exact:true});await open.hover();assert.equal(await open.locator('.lucide-play').count(),1);assert.equal(await open.evaluate(e=>getComputedStyle(e).cursor),'pointer');await open.click();await p.locator('main.ava-case').waitFor();await p.locator('.project-open-overlay').waitFor({state:'detached'});await p.locator('#top .back-link').click();await p.locator('.project-intro-project-layer.is-interactive').waitFor();console.log('AVA carousel entry and return PASS');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
