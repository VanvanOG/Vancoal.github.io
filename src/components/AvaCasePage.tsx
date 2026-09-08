import {createElement,useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft,ArrowRight,ArrowDownRight,ChartNoAxesCombined,Signpost,PanelsTopLeft,ChartLine,ScanSearch,ListChecks,ShoppingBag,Trophy,DoorOpen,BookOpen,Gift} from 'lucide-react';
import narrative from '../data/avaNarrative.json';
import {publicPath} from '../utils/publicPath';
import ReadingProgress,{readingOffset} from './MarsReadingProgress';
import useAiReveal,{revealAiSection} from './useAiReveal';
import CaseStrategyTimeline from './CaseStrategyTimeline';
import '../styles/ava-case.css';
import '../styles/case-overview.css';

type Node=string|{tag:string;attrs:Record<string,string>;children:Node[]};
type ElementNode=Exclude<Node,string>;
const nav=[['top','项目概览'],['scope','研究范围'],['reward','规则与奖励'],['tracking','主界面埋点'],['analysis','分层发现'],['decisions','任务原则'],['shop','商店原则'],['ranking','排名原则'],['outcome','分析产出']];
const icons:Record<string,typeof ArrowRight>={'arrow-down-right':ArrowDownRight,'arrow-right':ArrowRight,'chart-no-axes-combined':ChartNoAxesCombined,signpost:Signpost,'panels-top-left':PanelsTopLeft,'chart-line':ChartLine,'scan-search':ScanSearch,'list-checks':ListChecks,'shopping-bag':ShoppingBag,trophy:Trophy};
function Picture({node,box,eager=false}:{node:ElementNode;box?:number[];eager?:boolean}){
 const id=node.attrs['data-image'];const {width,height}=narrative.dimensions[id as keyof typeof narrative.dimensions];
 return <figure className={node.attrs.class} data-image={id} style={{'--original':width+'px'} as CSSProperties}><div className="ava-image"><img src={publicPath('/media/ava-league/'+id+'.webp')} width={width} height={height} loading={eager?'eager':'lazy'} decoding="async" alt={node.attrs['data-caption']}/>{box&&<span aria-hidden="true" className="ava-highlight" style={{left:box[0]+'%',top:box[1]+'%',width:box[2]+'%',height:box[3]+'%'}}/>}</div><figcaption>{node.attrs['data-caption']}</figcaption></figure>;
}
function Inspector({node}:{node:ElementNode}){
 const [selected,setSelected]=useState(0);const children=node.children.filter(n=>typeof n!=='string') as ElementNode[];
 const figure=children.find(n=>n.tag==='figure')!;const group=children.find(n=>n.attrs.class==='regions')!;const buttons=group.children.filter(n=>typeof n!=='string') as ElementNode[];
 return <div className="inspector" data-ai-module><Picture node={figure} box={buttons[selected].attrs['data-box'].split(',').map(Number)}/><div className="regions" role="group" aria-label="主界面五类埋点">{buttons.map((button,i)=><button key={i} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{button.children.map(render)}</button>)}</div></div>;
}
function PathNode({name,kind}:{name:string;kind:'entry'|'rules'|'reward'}){const Icon={entry:DoorOpen,rules:BookOpen,reward:Gift}[kind];return <div className={'ava-path-node '+kind}><span className="ava-node-icon"><Icon size={28} strokeWidth={1.4}/></span><strong>{name}</strong></div>;}
function RouteComparison(){return <div className="route-comparison" data-ai-module>
 <div className="ava-route-original"><h3>原访问结构</h3><div className="ava-route-nodes"><PathNode name="主活动入口" kind="entry"/><span className="ava-route-link" aria-hidden="true"><svg viewBox="0 0 120 40"><path d="M2 10 C45 45 75 -10 115 20 M106 12 L115 20 L104 24"/></svg></span><PathNode name="规则入口" kind="rules"/><span className="ava-route-link" aria-hidden="true"><svg viewBox="0 0 120 40"><path d="M2 10 C45 45 75 -10 115 20 M106 12 L115 20 L104 24"/></svg></span><PathNode name="奖励 TAB" kind="reward"/></div></div>
 <div className="ava-route-proposal"><h3>调整建议</h3><div className="ava-route-branch"><PathNode name="主活动入口" kind="entry"/><svg className="ava-fork" viewBox="0 0 220 220" aria-hidden="true"><path d="M2 110 C105 110 95 38 209 38 M200 30 L210 38 L200 46 M2 110 C105 110 95 182 209 182 M200 174 L210 182 L200 190"/></svg><div className="ava-destinations"><PathNode name="规则界面" kind="rules"/><PathNode name="奖励界面" kind="reward"/></div></div></div>
 </div>;}
function render(node:Node,key:number=0):ReactNode{
 if(typeof node==='string')return node;
 const a=node.attrs,classes=(a.class||'').split(' ');
 if(node.tag==='figure')return <Picture key={key} node={node}/>;
 if(classes.includes('inspector'))return <Inspector key={key} node={node}/>;
 if(classes.includes('route-comparison'))return <RouteComparison key={key}/>;
 if(a['data-lucide']){const Icon=icons[a['data-lucide']]||ArrowRight;return <Icon key={key} size={24} strokeWidth={1.5}/>;}
 const props:Record<string,unknown>={key,className:a.class,id:a.id,role:a.role,'aria-label':a['aria-label'],href:a.href};
 if(a.style?.startsWith('width:'))props.style={width:a.style.slice(6)};
 if(['section-heading','strategy-title','study-overview','population','wide-story','reward-evidence','chart-layout','interpretation','evidence-strip','table-scroll','closing-note'].some(c=>classes.includes(c))||node.tag==='article')props['data-ai-module']='';
 if(classes.includes('grid'))props.className+=' ai-evidence count-2';
 if(node.tag==='br')return <br key={key}/>;
 const children:ReactNode[]=[];
 for(let i=0;i<node.children.length;i++){
  const child=node.children[i];
  if(classes.includes('subsection')&&typeof child!=='string'&&['h2','h3'].includes(child.tag)){
   const group:Node[]=[child];while(i+1<node.children.length){const next=node.children[i+1];if(typeof next==='string'&&!next.trim()||typeof next!=='string'&&next.tag==='p'){group.push(next);i++;}else break;}
   children.push(<div className="ava-module-heading" data-ai-module key={i}>{group.map(render)}</div>);
  }else children.push(render(child,i));
 }
 return createElement(node.tag,props,children);
}
export default function AvaCasePage(){
 const root=useRef<HTMLElement>(null),navRef=useRef<HTMLElement>(null);const [active,setActive]=useState('top');useAiReveal(root);
 const go=(id:string)=>{const target=document.getElementById(id);if(!target)return;revealAiSection(target);window.scrollTo({top:id==='top'?0:scrollY+target.getBoundingClientRect().top-readingOffset(navRef.current),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 useEffect(()=>{let raf=0;const update=()=>{raf=0;let current='top';for(const [id]of nav)if((document.getElementById(id)?.getBoundingClientRect().top??Infinity)<=readingOffset(navRef.current)+4)current=id;setActive(current);};const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const observer=new ResizeObserver(schedule);if(root.current)observer.observe(root.current);update();return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};},[]);
 useEffect(()=>{const bar=navRef.current,item=bar?.querySelector<HTMLElement>('[aria-current]');if(!bar||!item)return;const outer=bar.getBoundingClientRect(),inner=item.getBoundingClientRect();if(inner.left<outer.left||inner.right>outer.right)bar.scrollBy({left:inner.left-outer.left-20,behavior:'instant'});},[active]);
 const buttons=()=>nav.map(([id,label])=><button key={id} aria-current={active===id?'location':undefined} onClick={()=>go(id)}>{label}</button>);
 const opening=narrative.tree[0] as ElementNode;const cover=opening.children.find(n=>typeof n!=='string'&&n.attrs.class==='cover') as ElementNode;const preview=cover.children.find(n=>typeof n!=='string'&&n.tag==='figure') as ElementNode;
 return <><ReadingProgress rootRef={root}/><main ref={root} className="project-page ava-case" onClick={e=>{if(e.defaultPrevented)return;const link=(e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');if(link){e.preventDefault();go(link.getAttribute('href')!.slice(1));}}}>
 <section id="top" className="wrap case-overview"><Link className="back-link" to="/" state={{targetPanel:'projects'}}><ArrowLeft size={18}/>返回项目</Link>
 <div className="project-title-block" data-ai-module><span className="ai-eyebrow">CASE STUDY / 04 · SLG 活动行为分析</span><h1>AVA 联赛</h1><p className="overview-lead">分析规则与奖励页、活动主界面的操作记录，<br/>分别确定内容访问路径与功能展示优先级。</p><p className="overview-role">项目主负责 · 交互设计<br/>行为分层 / 数据分析 / 设计原则</p><div className="ava-overview-preview"><Picture node={preview} eager/></div></div>
 <aside className="project-status-panel" data-ai-module><span className="ai-eyebrow">数据埋点与界面决策</span><strong>从行为记录<br/>到界面取舍</strong><p>规则与奖励页的查询记录，用于调整入口结构；主界面的分层数据，用于提炼任务、商店与排名的设计原则。</p><a href="#scope">查看研究范围<ArrowRight size={18}/></a></aside>
 <nav className="project-menu" aria-label="AVA 联赛章节" data-ai-module>{buttons()}</nav>
 <CaseStrategyTimeline onNavigate={go} items={[{id:'reward',title:'访问路径',detail:'规则与奖励页：检查两类内容的入口关系。'},{id:'analysis',title:'行为分层',detail:'活动主界面：比较不同付费组的五类操作。'},{id:'decisions',title:'界面原则',detail:'依据观察，形成任务、商店与排名的展示建议。'}]}/></section>
 <nav ref={navRef} className="ava-reading-nav" aria-label="案例阅读目录">{buttons()}</nav>
 {(narrative.tree.slice(1) as Node[]).map(render)}
 <footer className="wrap ava-footer"><Link to="/" state={{targetPanel:'projects'}}><ArrowLeft size={18}/>返回项目</Link><button onClick={()=>go('top')}>返回顶部 ↑</button></footer>
 </main></>;
}
