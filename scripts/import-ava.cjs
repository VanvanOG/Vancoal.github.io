const {narrativePath,narrativeUrl}=require('./source-paths.cjs');
// Semantic content import only. No source styles, zoom or external scripts enter the site.
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=narrativePath('AVA联赛-数据分析演示-20260907');
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage();await page.route('**/*.js',r=>r.abort());await page.goto('file:///'+source+'/index.html');
 const tree=await page.locator('main').evaluate(main=>{
  main.querySelector('[data-box]').dataset.box='19,72,15,10';
  main.querySelector('[data-image="behavior-chart"]').dataset.caption='各付费组的人均点击频次：横轴为付费分组，纵轴为次数';
  const sections=[...main.children];sections[6].id='shop';sections[7].id='ranking';
  const read=n=>{if(n.nodeType===3)return n.textContent;if(n.nodeType!==1)return null;
   const attrs={};for(const a of n.attributes)if(['class','id','data-image','data-caption','data-box','data-lucide','aria-label','role','href','style'].includes(a.name))attrs[a.name]=a.value;
   return {tag:n.tagName.toLowerCase(),attrs,children:[...n.childNodes].map(read).filter(n=>n!==null)};
  };return sections.map(read);
 });
 const dimensions=JSON.parse(fs.readFileSync(path.join(source,'assets/dimensions.js'),'utf8').replace(/^window.assetDimensions\s*=\s*/,'').replace(/;\s*$/,''));
 fs.writeFileSync('src/data/avaNarrative.json',JSON.stringify({tree,dimensions},null,2));
 fs.mkdirSync('public/media/ava-league',{recursive:true});for(const file of fs.readdirSync(path.join(source,'assets')))if(file.endsWith('.webp'))fs.copyFileSync(path.join(source,'assets',file),path.join('public/media/ava-league',file));
 console.log('AVA imported: '+tree.length+' source sections');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
