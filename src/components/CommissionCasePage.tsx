import {createElement,useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft,ArrowRight,MessageSquare,PackageOpen,Sparkles,Armchair,DoorOpen,CheckCheck,Scissors,Wallet,RotateCcw} from 'lucide-react';
import narrative from '../data/commissionNarrative.json';
import {publicPath} from '../utils/publicPath';
import ReadingProgress,{readingOffset} from './MarsReadingProgress';
import useAiReveal,{revealAiSection} from './useAiReveal';
import mountDemos from './commissionDemos';
import '../styles/commission-case.css';
import '../styles/commission-demos.css';
import CaseStrategyTimeline from './CaseStrategyTimeline';
import '../styles/case-overview.css';

type Node=string|{tag:string;attrs:Record<string,string>;children:Node[]};
const asset=(id:string)=>publicPath('/media/ai-commission/'+id+'.webp');
const icons:Record<string,typeof ArrowRight>={'messages-square':MessageSquare,'package-open':PackageOpen,sparkles:Sparkles,armchair:Armchair,'door-open':DoorOpen,'arrow-right':ArrowRight,'check-check':CheckCheck,scissors:Scissors,wallet:Wallet,'rotate-ccw':RotateCcw};
const regions:Record<string,number[][]>={hall:[[3,12,94,26],[64,54,31,9],[28,90,44,8]],brief:[[3,7,94,45],[3,52,94,14],[3,67,94,31]],dialogue:[[2,0,96,7],[2,7,96,16],[2,24,96,51],[2,76,96,23]],design:[[2,7,96,16],[8,25,83,45],[1,70,98,5],[1,75,98,24]],success:[[2,0,96,41],[7,51,86,27],[6,79,88,20]],failure:[[2,0,96,43],[7,52,86,33],[5,86,90,13]],mine:[[3,11,94,34],[3,48,94,39]]};
const nav=[['top','项目概览'],['overview','玩法关系'],['entry','委托入口'],['dialogue','对话探索'],['dialogue-states','对话状态'],['handover','阶段衔接'],['design','装修挑战'],['feedback','动效反馈'],['results','结果与卡片']];
const shape=(box:number[])=>({left:box[0]+'%',top:box[1]+'%',width:box[2]+'%',height:box[3]+'%'});
function Picture({node,box}:{node:Exclude<Node,string>;box?:number[]}){
 const id=node.attrs['data-image'],size=narrative.dimensions[id as keyof typeof narrative.dimensions];
 const [w,h]=Array.isArray(size)?size:[(size as {width:number;height:number}).width,(size as {width:number;height:number}).height];
 const highlight=box||node.attrs['data-box']?.split(',').map(Number);
 return <figure data-image={id} className={node.attrs.class||''}><div className={`commission-image ${h>w*1.3?'portrait':'detail'}`} style={{'--ratio':w/h,'--original':w+'px'} as CSSProperties}><img src={asset(id)} width={w} height={h} alt={node.attrs['data-caption']||'委托界面'} loading="lazy" decoding="async"/>{highlight&&<span className="commission-highlight" style={shape(highlight)} aria-hidden="true"/>}</div><figcaption>{node.attrs['data-caption']}</figcaption></figure>;
}
function Inspector({node}:{node:Exclude<Node,string>}){
 const [selected,setSelected]=useState(0);const children=node.children.filter(n=>typeof n!=='string') as Exclude<Node,string>[];
 const picture=children.find(n=>n.tag==='figure')!;
 const name=node.attrs['data-inspect']||(picture.attrs['data-image']==='06'?'dialogue':'design');
 const group=children.find(n=>n.attrs.class==='regions')!;
 return <div className={'layout '+(node.attrs.class||'')} data-inspect={name} data-ai-module><Picture node={picture} box={regions[name][selected]}/><div className="regions">{group.children.filter(n=>typeof n!=='string').map((n,index)=>{const item=n as Exclude<Node,string>;return <article key={index} className={selected===index?'is-selected':''}>{item.children.map((part,i)=>typeof part!=='string'&&part.tag==='h3'?<h3 key={i}><button className="region-choice" aria-pressed={selected===index} onClick={()=>setSelected(index)}>{part.children.map(render)}</button></h3>:render(part,i))}</article>;})}</div></div>;
}
function LiveDemo({type,id}:{type:string;id:string}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>ref.current?mountDemos(ref.current,publicPath('/media/ai-commission/')):undefined,[]);return <div ref={ref} data-ai-module><div className="live-demo" id={id} data-demo={type}/></div>;}
function Reward({node}:{node:Exclude<Node,string>}){const [playing,setPlaying]=useState(false);const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);useEffect(()=>()=>clearTimeout(timer.current),[]);return <div className={'motion-demo'+(playing?' is-playing':'')} id="reward-motion" data-ai-module><div className="motion-top"><div><h4>奖励反馈的连续关系</h4><span>动效流程示意 · 非运行录屏</span></div><button aria-label="重播奖励反馈示意" onClick={()=>{setPlaying(false);clearTimeout(timer.current);timer.current=setTimeout(()=>{setPlaying(true);},30);}}><RotateCcw size={20}/></button></div>{node.children.filter(n=>typeof n!=='string'&&n.attrs.class==='motion-track four').map(render)}</div>;}
function render(node:Node,key:number=0):ReactNode{
 if(typeof node==='string')return node;
 const a=node.attrs,classes=(a.class||'').split(' ');
 if(node.tag==='br'||node.tag==='hr')return createElement(node.tag,{key});
 if(node.tag==='figure')return <Picture key={key} node={node}/>;
 if(classes.includes('layout'))return <Inspector key={key} node={node}/>;
 if(a['data-demo'])return <LiveDemo key={key} type={a['data-demo']} id={a.id}/>;
 if(classes.includes('motion-demo'))return <Reward key={key} node={node}/>;
 if(a['data-lucide']){const Icon=icons[a['data-lucide']]||Sparkles;return <Icon key={key} size={26} strokeWidth={1.5}/>;}
 const props:Record<string,unknown>={key,className:a.class,id:classes.includes('transition-band')?'handover':a.id};
 const module=node.tag==='article'&&!classes.includes('state')||classes.some(c=>['section-heading','strategy-title','title-row','opening-lead','opening-panels','page-route','operation-map','handover','error-row','rule-strip','small-note'].includes(c));
 if(module)props['data-ai-module']='';
 if(node.tag==='article'&&classes.includes('state'))props['data-ai-module']='';
 if(classes.includes('title-row'))props.className+=' project-title-block';
 if(classes.includes('grid'))props.className+=' ai-evidence'+(classes.includes('three')?' count-3':' count-2');
 if(node.tag==='h1')return <h1 key={key}>AI 委托玩法</h1>;
 // Keep a subsection's judgment and explanation together during entrance.
 const children:ReactNode[]=[];
 for(let i=0;i<node.children.length;i++){
  const child=node.children[i];
  if((classes.includes('subsection')||classes.includes('chapter'))&&typeof child!=='string'&&['h2','h3'].includes(child.tag)){
   const group:Node[]=[child];
   while(i+1<node.children.length){const next=node.children[i+1];if(typeof next==='string'&&!next.trim()||typeof next!=='string'&&next.tag==='p'){group.push(next);i++;}else break;}
   children.push(<div className="commission-module-heading" data-ai-module key={i}>{group.map(render)}</div>);
  }else if(classes.includes('grid')&&typeof child!=='string'&&child.tag==='figure')children.push(<div data-ai-module key={i}><Picture node={child}/></div>);
  else children.push(render(child,i));
 }
 return createElement(node.tag,props,children);
}
export default function CommissionCasePage(){
 const root=useRef<HTMLElement>(null),navRef=useRef<HTMLElement>(null);const [active,setActive]=useState('top');useAiReveal(root);
 useEffect(()=>{const bar=navRef.current,button=bar?.querySelector<HTMLElement>('[aria-current]');if(!bar||!button)return;const outer=bar.getBoundingClientRect(),inner=button.getBoundingClientRect();if(inner.left<outer.left||inner.right>outer.right)bar.scrollBy({left:inner.left-outer.left-20,behavior:'instant'});},[active]);
 const go=(id:string)=>{const target=document.getElementById(id);if(!target)return;revealAiSection(target);window.scrollTo({top:id==='top'?0:scrollY+target.getBoundingClientRect().top-readingOffset(navRef.current),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 useEffect(()=>{let raf=0;const update=()=>{raf=0;let current='top';for(const [id]of nav){if((document.getElementById(id)?.getBoundingClientRect().top??Infinity)<=readingOffset(navRef.current)+4)current=id;}setActive(current);};const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const observer=new ResizeObserver(schedule);if(root.current)observer.observe(root.current);update();return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};},[]);
 const buttons=()=>nav.map(([id,label])=><button key={id} aria-current={active===id?'location':undefined} onClick={()=>go(id)}>{label}</button>);
 const opening=narrative.tree[0] as Exclude<Node,string>;
 const panels=opening.children.find(n=>typeof n!=='string'&&n.attrs.class?.includes('opening-panels')) as Exclude<Node,string>;
 return <><ReadingProgress rootRef={root}/><main ref={root} className="project-page commission-case">
 <section id="top" className="wrap case-overview">
 <Link className="back-link" to="/" state={{targetPanel:'projects'}}><ArrowLeft size={18}/>返回项目</Link>
 <div className="project-title-block title-row" data-ai-module><span className="ai-eyebrow">CASE STUDY / 03 · AI × 装修游戏</span><h1>AI 委托玩法</h1><p className="overview-lead">从了解委托者到完成房间设计，<br/>通过交互衔接两个阶段的目标、操作与奖励。</p><p className="overview-role">项目主负责 · 交互设计<br/>对话探索 / 阶段衔接 / 游戏反馈</p><div className="overview-screens count-2">{panels.children.map(render)}</div></div>
 <aside className="project-status-panel" data-ai-module><span className="ai-eyebrow">交互设计重点</span><strong>理解偏好<br/>回应委托</strong><p>AI 提出需求，玩家决定装修方案。</p><a href="#overview" onClick={e=>{e.preventDefault();go('overview');}}>查看两阶段玩法关系<ArrowRight size={18}/></a></aside>
 <nav className="project-menu" aria-label="AI 委托章节" data-ai-module>{buttons()}</nav>
 <CaseStrategyTimeline onNavigate={go} items={[{id:'dialogue',title:'对话探索',detail:'将交流中的线索组织为可查阅的偏好记录。'},{id:'handover',title:'阶段衔接',detail:'对话确定奖励上限，装修决定实际所得。'},{id:'feedback',title:'操作反馈',detail:'将家具变化、角色反应与任务进展联系起来。'}]}/>
 </section>
 <nav className="commission-reading-nav" ref={navRef} aria-label="案例阅读目录">{buttons()}</nav>{(narrative.tree.slice(1) as Node[]).map(render)}<footer className="wrap commission-footer"><Link to="/" state={{targetPanel:'projects'}}>返回项目<ArrowLeft size={18}/></Link><button onClick={()=>go('top')}>返回顶部 ↑</button></footer></main></>;
}
