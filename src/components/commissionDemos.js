export default function mountCommissionDemos(container, assetBase) {
 const cleanups=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const configs={
  discovery:{title:'对话发现：偏好从交流中进入任务记录',initial:80,final:85,tag:'低预算',verb:'已发现',image:'06',panel:'01',duration:9000,steps:[['沿线索继续追问','生活描述提供线索，玩家继续询问预算要求。'],['回复中出现新偏好','“发现偏好：低预算”与当前回复同时出现。'],['发现气泡飞入顶部面板','反馈从对话位置移动到偏好组件，说明信息的归属。'],['更新发现进度与标签','飞入完成后进度增加，对应标签点亮并保留。']]},
  placement:{title:'确认摆放：角色反馈飞入偏好进度',initial:70,final:75,tag:'音乐区',verb:'满足',image:'21',panel:'02',duration:8500,steps:[['确认当前家具摆放','确认标记提示操作发生，家具退出选中状态。'],['委托者回应设计变化','角色气泡在房间中出现，说明音乐区需求已满足。'],['角色反馈飞入顶部组件','反馈由房间移向偏好面板，连接布置与任务进展。'],['更新满足进度','反馈落入面板后，满足进度增加，对应目标点亮。']]}
 };
 const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 const range=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a)));
 const demos=[];
 container.querySelectorAll('[data-demo]').forEach(root=>{
  const type=root.dataset.demo,c=configs[type],isChat=type==='discovery';
  root.innerHTML=`<div class="live-demo-header"><div><h3>${c.title}</h3><p>界面动效示意 · 进度变化与播放节奏用于演示，非产品录屏</p></div><div class="live-controls"><button type="button" class="demo-toggle" title="暂停自动播放" aria-label="暂停自动播放"><i data-lucide="pause"></i></button><button type="button" data-replay="${root.id}" title="重新播放" aria-label="重新播放">↻</button></div></div><div class="live-demo-body"><div class="demo-stage demo-${type}" role="img" aria-label="${c.title}的完整界面动画"><img class="demo-base" src="${assetBase}${c.image}.webp" alt="" width="1440" height="2559"><div class="demo-panel"><img src="${assetBase}${c.panel}.webp" alt=""><span class="demo-progress-label">${c.verb}${c.initial}%</span><div class="demo-meter-mask"><div class="demo-meter-track"><div class="demo-meter-fill"></div></div></div><span class="demo-tag">${c.tag}</span></div>${isChat?'<div class="demo-chat-cover"></div><div class="demo-chat-message demo-context"><img src="${assetBase}10.webp" alt="委托者的生活描述与线索"></div><div class="demo-chat-message demo-question">好的，那老爷爷您对房间的预算有预期吗？</div><div class="demo-chat-message demo-answer"><img src="${assetBase}09.webp" alt="预算不太高，也要方便使用。发现偏好：低预算"></div><div class="demo-flight">✓发现偏好：低预算</div>':'<img class="demo-confirmed" src="${assetBase}26.webp" alt="" width="1440" height="2559"><div class="demo-confirm-ring"></div><div class="demo-reaction"><img src="${assetBase}npc-bubble-demo.webp" alt="角色气泡：音乐区完成"></div><div class="demo-flight"><img src="${assetBase}npc-bubble-demo.webp" alt=""></div>'}</div><div><ol class="demo-timeline">${c.steps.map((s,i)=>`<li><span>0${i+1}</span><strong>${s[0]}</strong><p>${s[1]}</p></li>`).join('')}</ol><p class="demo-status"><i data-lucide="repeat-2"></i><span>自动循环播放</span></p></div></div>`;
  root.querySelectorAll('img').forEach(img=>img.setAttribute('src',img.getAttribute('src').replace('${assetBase}',assetBase)));
  const stage=root.querySelector('.demo-stage'),fly=root.querySelector('.demo-flight'),tag=root.querySelector('.demo-tag'),fill=root.querySelector('.demo-meter-fill'),label=root.querySelector('.demo-progress-label'),toggle=root.querySelector('.demo-toggle'),status=root.querySelector('.demo-status span'),steps=[...root.querySelectorAll('.demo-timeline li')];
  let elapsed=reduced.matches?6500:0,paused=reduced.matches,visible=false,last=0,raf=0;
  function draw(t){
   const flightStart=isChat?3700:3300,flightEnd=isChat?5100:4750;
   const progress=ease(range(t,flightEnd,flightEnd+850));
   const value=c.initial+(c.final-c.initial)*progress;
   fill.style.width=value+'%';label.textContent=c.verb+Math.round(value)+'%';tag.classList.toggle('lit',t>=flightEnd);
   const index=t<(isChat?1900:1300)?0:t<flightStart?1:t<flightEnd?2:3;
   steps.forEach((el,i)=>el.classList.toggle('current',i===index));root.dataset.phase=String(index);root.dataset.progress=value.toFixed(2);root.dataset.elapsed=Math.round(t);
   const f=ease(range(t,flightStart,flightEnd));
   const originX=isChat?.505:.355,originY=isChat?.68:.365;
   const targetX=.147,targetY=.188;
   const dx=(targetX-originX)*stage.clientWidth,dy=(targetY-originY)*stage.clientHeight;
   const arc=Math.sin(f*Math.PI)*stage.clientWidth*.12;
   fly.style.transform=`translate(${dx*f+arc}px,${dy*f}px) scale(${1-.87*f})`;
   fly.style.opacity=t>=flightStart&&t<flightEnd?String(1-range(t,flightEnd-150,flightEnd)): '0';
   if(isChat){
    const answer=root.querySelector('.demo-answer');answer.style.opacity=String(range(t,1900,2300));answer.style.transform=`translateY(${(1-range(t,1900,2300))*12}px)`;
    root.querySelector('.demo-question').style.opacity=String(range(t,500,1000));
   }else{
    root.querySelector('.demo-confirmed').style.opacity=t>=950?'1':'0';
    const ring=root.querySelector('.demo-confirm-ring');ring.style.opacity=t>300&&t<950?'1':'0';ring.style.transform=`scale(${1+range(t,300,950)*.35})`;
    root.querySelector('.demo-reaction').style.opacity=t>=1300&&t<flightStart?String(range(t,1300,1700)):'0';
   }
  }
  function loop(now){if(!last)last=now;elapsed=(elapsed+now-last)%c.duration;last=now;draw(elapsed);raf=requestAnimationFrame(loop);}
  function sync(){cancelAnimationFrame(raf);last=0;root.dataset.paused=String(paused);toggle.setAttribute('aria-label',paused?'播放动画':'暂停自动播放');toggle.title=paused?'播放动画':'暂停自动播放';toggle.innerHTML=`<i data-lucide="${paused?'play':'pause'}"></i>`;status.textContent=paused?'已暂停':visible?'自动循环播放':'进入视野后自动播放';toggle.textContent=paused?'▶':'Ⅱ';if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(loop);}
  const onToggle=()=>{paused=!paused;sync()}; toggle.addEventListener('click',onToggle);
  const replay=root.querySelector('[data-replay]'); const onReplay=()=>{elapsed=0;paused=false;draw(0);sync()}; replay.addEventListener('click',onReplay);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.15});observer.observe(root);
  document.addEventListener('visibilitychange',sync);
  const onMotion=event=>{if(event.matches){paused=true;elapsed=6500;draw(elapsed);sync()}}; reduced.addEventListener('change',onMotion);
 cleanups.push(()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',onMotion);toggle.removeEventListener('click',onToggle);replay.removeEventListener('click',onReplay);root.replaceChildren();});
  
  draw(elapsed);sync();demos.push(root);
 });
 
return ()=>cleanups.forEach(cleanup=>cleanup());
}