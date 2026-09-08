const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
// One-time content extraction: emits structured data, never a runtime HTML embed.
const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage();await page.goto(narrativeUrl('生境-AI对话-叙事演示-20260907','index.html'));
 const data=await page.evaluate(()=>{
  const text=e=>e?.textContent.trim()||'';
  const textWithBreaks=e=>{const copy=e.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));return text(copy);};
  const all=(e,s)=>[...e.querySelectorAll(s)];
  const image=e=>{const img=e.querySelector('img'),crop=e.querySelector('.bubble-crop');return {name:img.getAttribute('src').split('/').pop(),alt:img.alt,caption:text(e.querySelector('figcaption')),crop:crop?{ratio:Number(crop.style.getPropertyValue('--crop-ratio')),y:crop.style.getPropertyValue('--crop-y')}:null};};
  const heading=e=>({label:text(e.querySelector('.strategy-label span,.section-no')),title:text(e.querySelector('h2')),copy:all(e,'.lead').map(text)});
  const item=e=>({title:text(e.querySelector('h4')),copy:text(e.querySelector(':scope > p')),image:image(e)});
  const group=e=>({title:text(e.querySelector('.story-heading h3')),copy:text(e.querySelector('.story-heading p')),label:text(e.querySelector('.mini-label')),items:all(e,'.screen-grid > article').map(item),notes:all(e,':scope > .diagram-note').map(text),video:e.querySelector('video')?{name:e.querySelector('source').getAttribute('src').split('/').pop(),poster:e.querySelector('video').getAttribute('poster').split('/').pop(),label:e.querySelector('video').getAttribute('aria-label')}:null});
  const section=id=>{const el=document.getElementById(id);return {heading:heading(el.querySelector('.section-heading')),groups:all(el,':scope > .feature-story,:scope > .chapter > .feature-story,:scope > .screen-grid').map(e=>e.classList.contains('screen-grid')?{title:'',copy:'',label:'',items:all(e,':scope > article').map(item),notes:[],video:null}:group(e))};};
  const states=document.getElementById('states'),map=document.getElementById('task-map');
  const flow=e=>all(e,'li').map(n=>({title:text(n.querySelector('strong')),copy:text(n.querySelector('small'))}));
  return {
   hero:{title:'AI 装修对话',lead:text(document.querySelector('.opening-lead')),role:textWithBreaks(document.querySelector('.ai-title p')),images:all(document,'.hero-screens figure').map(image)},
   context:heading(document.querySelector('#context .section-heading')),
   layout:{heading:heading(document.querySelector('#layout .section-heading')),note:text(document.querySelector('.layout-note'))},
   map:{heading:heading(map.querySelector('.section-heading')),origin:all(map.querySelector('.map-origin'),'strong,span').map(text),lanes:all(map,'.task-lane').map(e=>({title:text(e.querySelector('.lane-heading h3')),level:text(e.querySelector('.lane-level')),copy:text(e.querySelector('.lane-heading p')),branches:all(e,'.branch').map(b=>({title:text(b.querySelector('h4')),steps:flow(b.querySelector('ol')),sub:text(b.querySelector('.subbranch'))})),steps:all(e,'.lane-body > ol').flatMap(flow),note:text(e.querySelector('.branch-note'))})),related:all(map,'.map-related > div').map(e=>({title:text(e.querySelector('h4')),copy:text(e.querySelector('p'))})),depth:all(map,'.depth-key span').map(text)},
   bubbles:{heading:heading(states.querySelector('.section-heading')),categories:all(states,'.bubble-category').map(e=>({id:e.dataset.bubbleCategory,title:text(e.querySelector('.bubble-category-title h3')),copy:text(e.querySelector('.bubble-category-title p')),items:all(e,'.bubble-examples article').map(item)}))},
   light:section('control'),heavy:{...section('process'),steps:all(document,'#process .process-line span').map(text)},
   outcomes:{heading:heading(document.querySelector('#outcomes .section-heading')),items:all(document,'#outcomes article').map(item),note:text(document.querySelector('#outcomes .diagram-note'))}
  };
 });
 data.zones=[];for(const key of ['tools','progress','room','chat','suggestions','actions','input']){await page.locator(`[data-zone="${key}"]`).click();data.zones.push(await page.evaluate(key=>{const b=document.querySelector(`[data-zone="${key}"]`),s=document.querySelector('#zone-highlight').style;return {key,label:b.textContent.trim().slice(2),number:document.querySelector('#zone-number').textContent,title:document.querySelector('#zone-question').textContent,copy:document.querySelector('#zone-copy').textContent,box:[s.left,s.top,s.width,s.height].map(parseFloat)};},key));}
 data.assets={};for(const name of fs.readdirSync(narrativePath('生境-AI对话-叙事演示-20260907','assets')).filter(n=>n.endsWith('.png'))){const b=fs.readFileSync(path.join(narrativePath('生境-AI对话-叙事演示-20260907','assets'),name));data.assets[name]={width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}
 console.log(JSON.stringify(data,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
