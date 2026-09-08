import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft,ArrowUpRight,ArrowDownRight,MessageSquare,MousePointer2,ScanEye,Check,Layers,GitBranch,Send,CheckCircle2,Focus,Sparkles} from 'lucide-react';
import data from '../data/aiDialogueNarrative.json';
import {publicPath} from '../utils/publicPath';
import ReadingProgress,{readingOffset} from './MarsReadingProgress';
import useAiReveal,{revealAiSection} from './useAiReveal';
import ControllerHints from './ControllerHints';
import '../styles/ai-dialogue-case.css';
import CaseStrategyTimeline from './CaseStrategyTimeline';
import '../styles/case-overview.css';

type Evidence={name:string;alt:string;caption:string;crop:{ratio:number;y:string}|null};
type Item={title:string;copy:string;image:Evidence};
type HeadingData={label:string;title:string;copy:string[]};
type Group={title:string;copy:string;label:string;items:Item[];notes:string[];video:{name:string;poster:string;label:string}|null};
const asset=(name:string)=>publicPath('/media/ai-dialogue-20260907/assets/'+encodeURIComponent(name));
const sections=[['top','项目概览'],['context','项目背景'],['layout','完整界面'],['task-map','任务总图'],['states','气泡状态'],['control','轻量任务'],['process','重型任务'],['outcomes','保存与退出']];
const iconSet=[MessageSquare,Focus,Send,CheckCircle2,ScanEye,Sparkles];

function Picture({image,hero=false}:{image:Evidence;hero?:boolean}){
 const size=data.assets[image.name as keyof typeof data.assets];
 const kind=image.crop?'crop':size.height>size.width*1.3?'portrait':'detail';
 return <figure className={`ai-proof ${kind}`}>
  <div className={image.crop?'ai-crop':'ai-image-frame'} style={{'--crop-ratio':image.crop?.ratio,'--crop-y':image.crop?.y,'--intrinsic-width':`${size.width}px`,'--image-ratio':size.width/size.height} as CSSProperties}>
   <img src={asset(image.name)} alt={image.alt} width={size.width} height={size.height} loading={hero?'eager':'lazy'} decoding="async" />
  </div>{image.caption&&<figcaption>{image.caption}</figcaption>}
 </figure>;
}
function Heading({value,number}:{value:HeadingData;number?:string}){
 return <header className="section-heading" data-ai-module><span className="ai-eyebrow">{number} / {value.label}</span><h2>{value.label.includes('·')||value.label==='任务与状态总图'?value.label:value.title}</h2>
 {(value.label.includes('·')||value.label==='任务与状态总图')&&<p className="ai-thesis">{value.title}</p>}{value.copy.map(p=><p key={p}>{p}</p>)}</header>;
}
function EvidenceItems({items}:{items:Item[]}){return <div className={`ai-evidence count-${items.length}`}>{items.map(item=><article key={item.title} data-ai-module><h4>{item.title}</h4><p>{item.copy}</p><Picture image={item.image}/></article>)}</div>;}
function Story({group}:{group:Group}){return <div className="ai-story">
 {group.title&&<header className="story-heading" data-ai-module>{group.label&&<span className="ai-eyebrow">{group.label}</span>}<h3>{group.title}</h3><p>{group.copy}</p></header>}
 {group.items.length>0&&<EvidenceItems items={group.items}/>}
 {group.notes.map(n=><p key={n} className="ai-note" data-ai-module>{n}</p>)}
 {group.video&&<div className="ai-video" data-ai-module><video controls playsInline preload="metadata" poster={asset(group.video.poster)} aria-label={group.video.label}><source src={asset(group.video.name)} type="video/mp4"/></video></div>}
 </div>;}
function Connector(){
 const ref=useRef<SVGSVGElement>(null);const [size,setSize]=useState({w:100,h:44});
 useEffect(()=>{const el=ref.current;if(!el)return;const ro=new ResizeObserver(()=>setSize({w:el.clientWidth,h:el.clientHeight}));ro.observe(el);return()=>ro.disconnect();},[]);
 const {w,h}=size,vertical=h>w;
 const curve=vertical?`M ${w/2} 2 C ${w*.9} ${h*.3},${w*.9} ${h*.7},${w/2} ${h-3}`:`M 5 12 C ${w*.3} ${h-3},${w*.7} ${h-3},${w-5} 12`;
 const arrow=vertical?`m ${w/2-4} ${h-9} 4 6 4 -6`:`m ${w-12} 13 7 -1 -3 7`;
 return <svg ref={ref} className="ai-connector" viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><path d={curve}/><path d={arrow}/></svg>;
}
function Flow({steps,offset=0}:{steps:{title:string;copy:string}[];offset?:number}){return <ol className="ai-flow" style={{'--steps':steps.length} as CSSProperties}>{steps.map((step,i)=>{const Icon=iconSet[(i+offset)%iconSet.length];return <li key={step.title} data-ai-node style={{'--node-delay':`${i*100}ms`} as CSSProperties}>
 <span className="ai-node-icon"><Icon size={25} strokeWidth={1.5}/></span><strong>{step.title}</strong><small>{step.copy}</small>
 {i<steps.length-1&&<Connector/>}
 </li>;})}</ol>;}
function TaskMap(){return <div className="ai-task-map">
 <div className="ai-origin" data-ai-module><MessageSquare size={28}/><strong>{data.map.origin[0]}</strong><span>{data.map.origin[1]}</span></div>
 {data.map.lanes.map((lane,index)=><section className="ai-task-lane" key={lane.title}>
  <header data-ai-module><span className="ai-medallion">{index===0?<MousePointer2 size={34}/>:<ScanEye size={34}/>}</span><span className="ai-eyebrow">{lane.level}</span><h3>{lane.title}</h3><p>{lane.copy}</p></header>
  <div className="ai-lane-body">{lane.branches.map(branch=><div className="ai-branch" key={branch.title} data-ai-module><h4><GitBranch size={20}/>{branch.title}</h4><Flow steps={branch.steps}/>{branch.sub&&<p className="ai-subbranch"><ArrowDownRight size={20}/>{branch.sub}</p>}</div>)}
  {lane.steps.length>0&&<div className="ai-heavy-flow" data-ai-module><Flow steps={lane.steps.slice(0,3)}/><div className="ai-flow-continuation"><ArrowDownRight size={20}/>分析后形成具体方案</div><Flow steps={lane.steps.slice(3)} offset={3}/><p className="ai-note">{lane.note}</p></div>}</div>
 </section>)}
 <div className="ai-related" data-ai-module>{data.map.related.map(item=><article key={item.title}><h4>{item.title}</h4><p>{item.copy}</p></article>)}</div>
 <div className="ai-depth" data-ai-module><Layers size={20}/><strong>界面层级</strong>{data.map.depth.map(d=><span key={d}>{d}</span>)}</div>
 </div>;}

export default function AiDialogueCasePage(){
 const rootRef=useRef<HTMLElement>(null),navRef=useRef<HTMLElement>(null);
 const [active,setActive]=useState('top'),[zoneKey,setZoneKey]=useState('tools');
 useAiReveal(rootRef);
 const zone=data.zones.find(z=>z.key===zoneKey)!;
 const goTo=(id:string)=>{const el=rootRef.current?.querySelector<HTMLElement>(`[id="${id}"]`);if(!el)return;revealAiSection(el);window.scrollTo({top:id==='top'?0:scrollY+el.getBoundingClientRect().top-readingOffset(navRef.current),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});};
 useEffect(()=>{let raf=0;const update=()=>{raf=0;let current='top';for(const [id] of sections){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=readingOffset(navRef.current)+3)current=id;}setActive(current);};const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};const ro=new ResizeObserver(schedule);if(rootRef.current)ro.observe(rootRef.current);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);update();return()=>{ro.disconnect();cancelAnimationFrame(raf);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};},[]);
 useEffect(()=>{const nav=navRef.current,button=nav?.querySelector<HTMLElement>('[aria-current]');if(!nav||!button)return;const n=nav.getBoundingClientRect(),b=button.getBoundingClientRect();if(b.left<n.left||b.right>n.right)nav.scrollBy({left:b.left-n.left-16,behavior:'instant'});},[active]);
 const navButtons=()=>sections.map(([id,label])=><button key={id} aria-current={active===id?'location':undefined} onClick={()=>goTo(id)}>{label}</button>);
 const chapter=(id:string,heading:HeadingData,number:string,children:ReactNode)=><section id={id} className="ai-chapter ai-wrap"><Heading value={heading} number={number}/>{children}</section>;
 return <><ReadingProgress rootRef={rootRef}/><main className="project-page ai-case" ref={rootRef}>
 <section id="top" className="ai-hero ai-wrap case-overview">
  <Link className="ai-back" to="/" state={{targetPanel:'projects'}}><ArrowLeft size={18}/>返回项目</Link>
  <nav className="project-menu" aria-label="AI 装修对话章节" data-ai-module>{navButtons()}</nav>
  <div className="project-title-block" data-ai-module><span className="ai-eyebrow">CASE STUDY / 02 · AI × 家园创作</span><h1>{data.hero.title}</h1><p className="ai-lead">{data.hero.lead}</p><p className="ai-role">{data.hero.role}</p><div className="overview-screens">{data.hero.images.map(image=><Picture key={image.name} image={image} hero/>)}</div></div>
  <aside className="project-status-panel" data-ai-module><span className="ai-eyebrow">交互设计重点</span><strong>状态清晰<br/>创造乐趣</strong><p>对话交互 / 空间编辑 / 状态反馈</p><a href="#task-map" onClick={e=>{e.preventDefault();goTo('task-map');}}>查看任务与状态总图<ArrowDownRight size={18}/></a></aside>
  <CaseStrategyTimeline onNavigate={goTo} items={[{id:'states',title:'状态表达',detail:'区分对话、处理中与异常反馈，让当前状态可理解。'},{id:'control',title:'轻量任务',detail:'通过对话入口承接局部调整，保留玩家的选择。'},{id:'process',title:'重型任务',detail:'从空间分析到方案执行，呈现处理进度与阶段结果。'}]}/>
 </section>
 <nav className="ai-reading-nav" ref={navRef} aria-label="案例阅读目录">{navButtons()}</nav>
 {chapter('context',data.context,'01',null)}
 {chapter('layout',data.layout.heading,'02',<div className="ai-layout" data-ai-module><div className="ai-full-interface"><Picture image={{name:'基础界面.png',alt:'AI装修完整界面：顶部编辑操作、中央房间、下方对话与任务入口',caption:'',crop:null}}/><div className="ai-zone-highlight" style={{left:zone.box[0]+'%',top:zone.box[1]+'%',width:zone.box[2]+'%',height:zone.box[3]+'%'}}><span>{zone.number}</span></div></div><div className="ai-layout-copy"><div className="ai-zone-list" role="group" aria-label="界面分区">{data.zones.map(z=><button key={z.key} data-zone={z.key} aria-pressed={z.key===zoneKey} onClick={()=>setZoneKey(z.key)}><span>{z.number}</span>{z.label}{zoneKey===z.key&&<Check size={16}/>}</button>)}</div><div className="zone-explanation" key={zoneKey}><h3>{zone.title}</h3><p>{zone.copy}</p></div><p className="ai-note">{data.layout.note}</p></div></div>)}
 {chapter('task-map',data.map.heading,'03',<TaskMap/>)}
 {chapter('states',data.bubbles.heading,'04',<div className="ai-bubbles">{data.bubbles.categories.map(category=><section className="ai-bubble-category" data-bubble-category={category.id} key={category.id}><header data-ai-module><h3>{category.title}</h3><p>{category.copy}</p></header><EvidenceItems items={category.items}/></section>)}</div>)}
 {chapter('control',data.light.heading,'05',data.light.groups.map((group,i)=><Story key={i} group={group}/>))}
 {chapter('process',data.heavy.heading,'06',<><div className="ai-process-line" data-ai-module>{data.heavy.steps.map((step,i)=><span key={step}><small>0{i+1}</small>{step}</span>)}</div>{data.heavy.groups.map((group,i)=><Story key={i} group={group}/>)}</>)}
 {chapter('outcomes',data.outcomes.heading,'07',<><EvidenceItems items={data.outcomes.items}/><p className="ai-note" data-ai-module>{data.outcomes.note}</p></>)}
 <footer className="ai-footer ai-wrap"><span>钟成龙 / VANCOAL · 项目主负责 · 交互设计</span><button onClick={()=>goTo('top')}>返回开头<ArrowUpRight size={18}/></button><ControllerHints placement="inline" left="SCROLL TO EXPLORE" right="BACK TO PROJECTS"/></footer>
 </main></>;
}
