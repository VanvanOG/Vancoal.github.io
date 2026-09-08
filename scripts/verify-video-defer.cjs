const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/86183/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', {cacheDisabled:true});
    await page.goto(process.env.BASE_URL || 'http://localhost:5181');
    await page.locator('.startup-loading').waitFor({state:'detached',timeout:120000});
    const requests=[];
    page.on('request',request=>{if(request.url().includes('/project-videos/'))requests.push(request.url());});
    await page.getByRole('button',{name:'查看项目',exact:true}).click();
    await page.locator('.project-intro-project-layer.is-interactive').waitFor({timeout:30000});
    const inactive=requests.filter(url=>/ai-dialogue-2|ai-commission-v1|ava-league-v1/.test(url));
    assert.deepEqual(inactive,[],'inactive startup-poster videos must not be re-requested on project entry');
    await page.waitForFunction(()=>{const video=document.querySelector('video[src*="ai-lab.mp4"]');return video&&video.readyState>=2;});
    assert.ok(requests.some(url=>url.includes('ai-lab.mp4')),'posterless LAB still obtains a first frame');
    await page.getByRole('button',{name:'Next project',exact:true}).click();
    await page.waitForFunction(()=>{const video=document.querySelector('video[src*="ai-dialogue-2.mp4"]');return video&&video.readyState>=2&&!video.paused;});
    assert.ok(requests.some(url=>url.includes('ai-dialogue-2.mp4')),'selecting a deferred card loads and plays its video');
    console.log('PASS inactive three videos defer, LAB first-frame preview loads, selected dialogue video plays');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
