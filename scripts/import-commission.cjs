const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
// One-time semantic import. Source styles, navigation and image zoom are excluded.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=narrativePath('AI委托玩法-叙事演示-20260907');
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage();
 await page.route('**/*.js',route=>route.abort());
 await page.goto('file:///'+source+'/index.html');
 const tree=await page.locator('main').evaluate(main=>{
  const read=n=>{
   if(n.nodeType===3)return n.textContent;
   if(n.nodeType!==1)return null;
   const attrs={};for(const a of n.attributes)if(['class','id','data-image','data-caption','data-box','data-inspect','data-demo','data-lucide','aria-label','title'].includes(a.name))attrs[a.name]=a.value;
   return {tag:n.tagName.toLowerCase(),attrs,children:[...n.childNodes].map(read).filter(n=>n!==null)};
  };return [...main.children].map(read);
 });
 const dimensions=JSON.parse(fs.readFileSync(path.join(source,'assets/dimensions.js'),'utf8').replace(/^window.assetDimensions\s*=\s*/,'').replace(/;\s*$/,''));
 fs.writeFileSync('src/data/commissionNarrative.json',JSON.stringify({tree,dimensions},null,2));
 fs.mkdirSync('public/media/ai-commission',{recursive:true});
 for(const file of fs.readdirSync(path.join(source,'assets')))if(file.endsWith('.webp'))fs.copyFileSync(path.join(source,'assets',file),path.join('public/media/ai-commission',file));
 // Preserve source demo choreography, but make lifetime local to the React case.
 let js=fs.readFileSync(path.join(source,'live-demos.js'),'utf8');
 js=js.replace('(() => {','export default function mountCommissionDemos(container, assetBase) {\n const cleanups=[];');
 js=js.replace("document.querySelectorAll('[data-demo]')","container.querySelectorAll('[data-demo]')");
 js=js.replaceAll('src="assets/','src="${assetBase}');
 js=js.replace("  const stage=root.querySelector", "  root.querySelectorAll('img').forEach(img=>img.setAttribute('src',img.getAttribute('src').replace('${assetBase}',assetBase)));\n  const stage=root.querySelector");
 js=js.replace("toggle.addEventListener('click',()=>{paused=!paused;sync()});","const onToggle=()=>{paused=!paused;sync()}; toggle.addEventListener('click',onToggle);");
 js=js.replace("root.querySelector('[data-replay]').addEventListener('click',()=>{elapsed=0;paused=false;root.classList.add('is-playing');draw(0);sync()});","const replay=root.querySelector('[data-replay]'); const onReplay=()=>{elapsed=0;paused=false;draw(0);sync()}; replay.addEventListener('click',onReplay);");
 js=js.replace("reduced.addEventListener('change',event=>{if(event.matches){paused=true;elapsed=6500;draw(elapsed);sync()}});","const onMotion=event=>{if(event.matches){paused=true;elapsed=6500;draw(elapsed);sync()}}; reduced.addEventListener('change',onMotion);\n cleanups.push(()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',onMotion);toggle.removeEventListener('click',onToggle);replay.removeEventListener('click',onReplay);root.replaceChildren();});");
 js=js.replace(/root.demo=\{seek\(t\).*?\};/,'');
 js=js.replace("if(window.lucide)lucide.createIcons({root:toggle});", "toggle.textContent=paused?'▶':'Ⅱ';");
 js=js.replaceAll('if(window.lucide)lucide.createIcons();','');
 js=js.replace('<i data-lucide="rotate-ccw"></i>','↻').replace('<i data-lucide="circle-check"></i>','✓');
 js=js.replace(/\}\)\(\);\s*$/,'return ()=>cleanups.forEach(cleanup=>cleanup());\n}');
 fs.writeFileSync('src/components/commissionDemos.js',js);
 let css=fs.readFileSync(path.join(source,'live-demos.css'),'utf8').replaceAll("url('assets/","url('/media/ai-commission/");
 // All selectors are local, including declarations inside media queries.
 css=css.replace(/(^|\})(\s*)([^@}{][^{}]*)\{/g,(_,end,space,selector)=>end+space+(selector.trim().startsWith('@')?selector:selector.split(',').map(s=>'.commission-case '+s.trim()).join(','))+'{');
 css=css.replace(/(@media[^{}]+\{)(\s*)(\.[^{]+)\{/g,(_,media,space,selector)=>media+space+selector.split(',').map(s=>'.commission-case '+s.trim()).join(',')+'{');
 fs.writeFileSync('src/styles/commission-demos.css',css);
 await browser.close();console.log('Imported semantic content and demo assets');
})();
