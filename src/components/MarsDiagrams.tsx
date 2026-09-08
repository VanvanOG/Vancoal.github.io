import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ComponentType } from 'react';
import { ArrowDownRight, CalendarClock, CalendarCheck2, Crosshair, Flag, Gamepad2, Layers, LayoutDashboard, LogIn, MousePointer2, Route, ShieldCheck, Swords, UserRound, X } from 'lucide-react';
import MarsImage from './MarsImage';
import { interactionSettings } from '../data/interactionSettings';

type LineIcon = ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
const stagger = (index: number) => ({ '--node-delay': `${index * interactionSettings.stagger}ms` } as CSSProperties);

function useRenderedSvgSize(defaultWidth: number, defaultHeight: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setSize(current => Math.abs(current.width - width) < 0.1 && Math.abs(current.height - height) < 0.1
        ? current
        : { width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}

/** Relationships run between nodes; labels and screenshots remain ordinary HTML. */
function CurveArrow({ className = '', upward = false }: { className?: string; upward?: boolean }) {
  const id = useId();
  const { ref, width, height } = useRenderedSvgSize(100, 60);
  const path = upward
    ? `M1 ${height * .8} C${width * .32} ${height / 30} ${width * .68} ${height / 30} ${width - 2} ${height * 7 / 12}`
    : `M1 ${height * .2} C${width * .32} ${height * 29 / 30} ${width * .68} ${height * 29 / 30} ${width - 2} ${height * 5 / 12}`;
  return <svg ref={ref} className={`diagram-arrow ${className}`} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <defs><marker id={id} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path className="arrow-head" d="M1 1 L6 4 L1 7" /></marker></defs>
    <path d={path} markerEnd={`url(#${id})`} />
  </svg>;
}

function Medallion({ icon: Icon, number }: { icon: LineIcon; number?: string }) {
  return <span className="diagram-medallion"><Icon size={30} strokeWidth={1.5} aria-hidden />{number && <span className="medallion-number">{number}</span>}</span>;
}

export function VerticalLink() {
  const id = useId();
  const { ref, width, height } = useRenderedSvgSize(28, 100);
  const path = `M${width / 2} 1 C${-width / 14} ${height * .3} ${width * 15 / 14} ${height * .68} ${width / 2} ${height - 3}`;
  return <svg ref={ref} className="vertical-link" viewBox={`0 0 ${width} ${height}`} aria-hidden="true"><defs><marker id={id} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path className="arrow-head" d="M1 1 L6 4 L1 7" /></marker></defs><path d={path} markerEnd={`url(#${id})`} /></svg>;
}

const strategies = [
  { id:'access', icon:Route, stage:'参与前 / 报名与时间选择', title:'链路简化', copy:'省去前置报名和排期，将主要决策集中到实战环节。', link:'参与路径对比' },
  { id:'focus', icon:Crosshair, stage:'对战中 / 对象与操作判断', title:'目标明确', copy:'依据目标锁定和战斗进展，同步场景表现、操作入口与限制说明。', link:'完整布局与战斗状态' },
  { id:'feedback', icon:Layers, stage:'持续参与 / 反馈与差异化目标', title:'阶梯式反馈', copy:'区分胜负与目标反馈；复仇丰富进攻方式，局内成长提供低成本提升战力的途径。', link:'胜负、奖励、复仇与养成' },
];

export function MarsStrategyOverview() {
  return <div className="strategy-map">{strategies.map((s,i)=><a href={`#${s.id}`} key={s.id} data-diagram-node style={stagger(i)}>
    <Medallion icon={s.icon} number={`0${i+1}`} />
    {i<2 && <><CurveArrow upward={i===1} /><VerticalLink /></>}
    <span className="strategy-friction">{s.stage}</span><h3>{s.title}</h3><p>{s.copy}</p>
    <span className="strategy-action">{s.link}<ArrowDownRight size={18} aria-hidden /></span>
  </a>)}</div>;
}

const steps: { title:string; icon:LineIcon }[] = [
  { title:'主活动入口', icon:LogIn }, { title:'对应活动页', icon:LayoutDashboard },
  { title:'报名弹窗', icon:UserRound }, { title:'选择报名时间', icon:CalendarClock },
  { title:'确认报名时间', icon:CalendarCheck2 },
  { title:'核心玩法', icon:Gamepad2 },
];

function PathRow({ direct = false }: { direct?: boolean }) {
  const indexes = direct ? [0,1,5] : [0,1,2,3,4,5];
  return <div className={`path-row${direct?' after':''}`}>
    <div className="path-label">{direct?'简化后路径':'原方案路径'}<small>{direct?'03':'06'} STEPS</small></div>
    <ol className="flow">{indexes.map((step,index)=>{
      const omitted=!direct && step>1 && step<5;
      const Icon=steps[step].icon;
      return <li key={step} data-diagram-node className={`${omitted?'removed ':''}${step===5?'destination':''}`} style={{...stagger(index),'--step-column':step+1} as CSSProperties}>
        <span className="path-symbol"><Icon size={26} strokeWidth={1.5} aria-hidden />{omitted && <X className="omission-cross" size={13} aria-hidden />}</span>
        <span className="path-step-name">{steps[step].title}</span>{omitted&&<small>省略此前置环节</small>}
        {index<indexes.length-1 && <><CurveArrow className={direct&&step===1?'direct-connection':''} upward={step%2===1}/><VerticalLink/></>}
      </li>;
    })}</ol>
  </div>;
}

export function MarsPathComparison() {
  return <figure className="path-comparison" aria-label="原路径与简化后路径对照">
    <div className="diagram-heading"><span className="mini-label">参与路径对比</span><p className="path-saving"><strong>6 <span>个步骤</span><i aria-hidden>→</i> 3 <span>个步骤</span></strong><span>省去 3 个前置环节</span></p></div>
    <div className="path-drawing"><PathRow/><PathRow direct/></div>
    <figcaption>省去报名、选择报名时间与确认时间三个前置环节，玩家从活动页直接进入核心玩法。</figcaption>
  </figure>;
}

const battle = [
  { title:'查看与选择', image:'基地状态-默认.png', caption:'识别可选对象', icon:MousePointer2 },
  { title:'锁定目标', image:'基地状态-瞄准.png', caption:'聚焦当前对手', icon:Crosshair },
  { title:'发起进攻', caption:'队列前往目标', icon:Swords },
  { title:'胜负结算', image:'基地状态-击倒.png', caption:'击败后衔接收益操作', icon:Flag },
  { title:'当前目标结束', caption:'刷新后恢复选择', icon:ShieldCheck },
] as const;

export function MarsBattlePath() {
  return <div className="journey-overview" aria-label="对战主路径与同步保护状态"><span className="diagram-caption">主操作路径</span>
    <ol>{battle.map((s,i)=><li key={s.title} data-diagram-node style={stagger(i)}>
      <div className="battle-preview">{'image' in s ? <MarsImage name={s.image} alt={s.caption} loading="lazy"/> : <Medallion icon={s.icon}/>}</div>
      {i<4&&<><CurveArrow upward={i%2===1}/><VerticalLink/></>}
      <span className="diagram-caption">0{i+1}</span><h3>{s.title}</h3><p>{s.caption}</p>
      {i===1&&<small className="parallel-state"><ShieldCheck size={17} aria-hidden/><span>并发状态</span>其他对象同步受保护</small>}
      {i===3&&<small className="condition-state"><span>操作条件</span>胜利且有剩余次数时可掠夺</small>}
    </li>)}</ol>
  </div>;
}

function EvidencePreview({ name, caption }: { name: Parameters<typeof MarsImage>[0]['name']; caption:string }) {
  return <figure><MarsImage name={name} alt={caption} loading="lazy"/><figcaption>{caption}</figcaption></figure>;
}

export function MarsFeedbackOverview() {
  return <div className="feedback-ladder" aria-label="反馈层次与对应游戏画面">
    <article data-diagram-node style={stagger(0)}>
      <div className="feedback-level"><span>01</span><span className="level">操作层</span></div><CurveArrow upward/><VerticalLink/>
      <div className="feedback-proof feedback-models"><EvidencePreview name="基地状态-设为目标.png" caption="目标锁定 / 血条显示"/><EvidencePreview name="基地状态-受击.png" caption="受击表现 / 血量下降"/></div>
      <h3>确认攻击效果</h3><p>目标聚焦、受击表现与血量变化</p>
    </article>
    <article data-diagram-node style={stagger(1)}>
      <div className="feedback-level"><span>02</span><span className="level">结算层</span></div><CurveArrow upward/><VerticalLink/>
      <div className="feedback-proof"><EvidencePreview name="战斗胜利-掠夺引导.png" caption="胜利 / 奖励与掠夺引导"/><EvidencePreview name="战斗失败-补偿奖励.png" caption="失败 / 补偿与结束条件"/></div>
      <h3>说明胜负结果</h3><p>胜利奖励与掠夺引导、战败补偿与刷新提示</p>
    </article>
    <article data-diagram-node style={stagger(2)}>
      <div className="feedback-level"><span>03</span><span className="level">持续目标层</span></div>
      <div className="feedback-proof feedback-goals"><EvidencePreview name="奖励栏-有可领取奖励.png" caption="阶段奖励 / 可领取提示"/><EvidencePreview name="复仇界面.png" caption="复仇 / 更多进攻方式"/><EvidencePreview name="水晶养成-强化.png" caption="局内成长 / 低成本提升"/></div>
      <h3>回应不同参与需求</h3><p>阶段奖励、更多进攻方式与低成本战力成长</p>
    </article>
  </div>;
}

export function RewardCoexistence() {
  return <div className="reward-coexistence" aria-label="奖励与进度可以并存"><span>阶段目标达成</span><svg viewBox="0 0 150 90" preserveAspectRatio="none" aria-hidden><path d="M0 45 C70 45 60 15 150 15 M0 45 C70 45 60 75 150 75"/></svg><div><span>奖励可领取</span><span>下一目标进度</span></div><small>同时保留</small></div>;
}
