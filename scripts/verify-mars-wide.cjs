const { chromium } = require('C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.DEMO_URL || 'http://127.0.0.1:5174/';
const out = path.resolve(__dirname, '../qa/mars-wide');
fs.mkdirSync(out, {recursive:true});
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1920, 1440, 768, 390, 360]) {
      const page = await browser.newPage({viewport:{width,height:width<500?844:1080},reducedMotion:'reduce'});
      const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
      await page.goto(base+'#/projects/mars-era');
      await page.locator('.startup-loading').waitFor({state:'hidden',timeout:45000});
      await page.evaluate(async()=>{
        document.querySelectorAll('.mars-case img').forEach(i=>i.loading='eager');
        await Promise.all([...document.querySelectorAll('.mars-case img')].map(i=>i.decode()));
        await document.fonts.ready;
      });
      const shell=await page.locator('#access').boundingBox();
      const expected=width===1920?1700:width===1440?1312:width===768?704:width-40;
      assert.ok(Math.abs(shell.width-expected)<1, `Fluid case shell at ${width}: expected ${expected}, got ${shell.width}`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');
      assert.equal(await page.locator('.strategy-map .diagram-medallion').count(),3,'Strategies have recognizable graphic anchors');
      assert.equal(await page.locator('.feedback-ladder > article').count(),3);
      for(const [index,count] of [[0,2],[1,2],[2,3]]) {
        const group=page.locator('.feedback-ladder > article').nth(index);
        assert.equal(await group.locator('img').count(),count,'Each feedback claim has its promised real evidence');
      }
      const imageData=await page.locator('.mars-case img').evaluateAll(imgs=>imgs.map(i=>({src:i.src,w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,nw:i.naturalWidth,nh:i.naturalHeight,kind:i.dataset.imageKind})));
      assert.equal(new Set(imageData.map(i=>i.src)).size,25,'All original independent evidence retained');
      assert.ok(imageData.length>26,'Overview reuses existing evidence');
      for(const i of imageData){
        assert.ok(i.w>0 && i.w<=i.nw+1 && i.h<=i.nh+1,'No upscaling or invisible evidence');
        assert.ok(Math.abs(i.w/i.h-i.nw/i.nh)<.02,'Evidence keeps intrinsic aspect ratio');
        if(i.kind==='model') assert.ok(i.w<=220.5 && i.h<=240.5,'Model cap survives fluid shell');
      }
      const rows=await page.locator('.path-row .flow').evaluateAll(rows=>rows.map(r=>[...r.children].map(n=>({x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y}))));
      if(width>=1100){
        for(const [a,b] of [[0,0],[1,1],[5,2]]) assert.ok(Math.abs(rows[0][a].x-rows[1][b].x)<1,'Common path nodes align');
        const end=await page.locator('.after .direct-connection').boundingBox();
        const destination=await page.locator('.after .destination .path-symbol').boundingBox();
        assert.ok(destination.x-(end.x+end.width)<24 && destination.x-(end.x+end.width)>0,'Shortcut visibly reaches destination, not truncated by generic SVG max-width');
        const scale=await page.locator('.after .direct-connection').evaluate(svg=>{const m=svg.getScreenCTM();return Math.abs(m.a-m.d);});
        assert.ok(scale<.05,'Connector coordinate scale keeps arrowheads proportional rather than flattened');
      }else{
        assert.ok(rows.every(row=>row.every((n,i)=>i===0||n.y>row[i-1].y)),'Paths become readable vertical nodes below 1100');
        const scale=await page.locator('.flow .vertical-link').first().evaluate(svg=>{const m=svg.getScreenCTM();return Math.abs(m.a-m.d);});
        assert.ok(scale<.05,'Vertical connectors preserve arrowhead proportions');
      }
      if(width<760){
        const groups=await page.locator('.feedback-proof').evaluateAll(groups=>groups.map(g=>[...g.children].map(f=>f.getBoundingClientRect().toJSON())));
        assert.ok(groups.every(g=>g.every((f,i)=>i===0||f.top>=g[i-1].bottom+10)),'Mobile feedback evidence reflows into one readable column');
      }
      assert.equal(await page.locator('.flow .removed').count(),3);
      assert.ok(await page.locator('.parallel-state').innerText().then(t=>t.includes('同步受保护')));
      assert.equal(await page.locator('[data-target-step]').count(),6);
      assert.equal(await page.locator('[data-reward-state]').count(),5);
      assert.equal(await page.locator('.bar-row').count(),12);
      if(width===768){
        const menu=await page.locator('.project-menu').boundingBox();
        assert.ok(menu.width>=500,'Tablet directory uses a full row, not narrow vertical text columns');
      }
      for(const selector of ['.strategy-map','.path-comparison','.journey-overview','.feedback-ladder']) {
        await page.locator(selector).screenshot({path:path.join(out,`${selector.slice(1)}-${width}.png`),style:'.site-nav,.site-nav *,.mars-reading-nav,.mars-reading-nav *,.mars-reading-progress{visibility:hidden!important}'});
      }
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.screenshot({path:path.join(out,`hero-${width}.png`)});
      assert.deepEqual(errors,[]);
      console.log(`${width}: fluid shell, graphic nodes, feedback evidence, ratios, mobile path and content PASS`);
      await page.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
