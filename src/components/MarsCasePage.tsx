import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Crosshair, Layers, Route, ScanEye, ShieldCheck, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { marsMetrics, marsStrategies, marsZones, type MarsMetric } from "../data/marsNarrative";
import ControllerHints from "./ControllerHints";
import MarsImage from "./MarsImage";
import MarsReadingProgress, { readingOffset } from "./MarsReadingProgress";
import { MarsPathComparison, MarsBattlePath, MarsStrategyOverview, MarsFeedbackOverview, RewardCoexistence } from "./MarsDiagrams";
import useMarsReveal, { revealMarsSection } from "./useMarsReveal";
import useCaseAccentMotion from "./useCaseAccentMotion";
import "../styles/mars-case.css";
import "../styles/mars-diagrams.css";
import "../styles/case-overview.css";

const caseIcons = { "arrow-down-right": ArrowDownRight, "arrow-up-right": ArrowUpRight, "crosshair": Crosshair, "layers": Layers, "route": Route, "scan-eye": ScanEye };
function CaseIcon({ name }: { name: string }) {
  const Icon = caseIcons[name as keyof typeof caseIcons] ?? ArrowDownRight;
  return <Icon aria-hidden="true" size={18} strokeWidth={1.6} />;
}

function MarsChart({ id, data, maximum }: { id: string; data: MarsMetric[]; maximum: number }) {
  return <div id={id} className="bar-chart"><div className="chart-axis" aria-hidden="true"><span>0</span><span>{maximum / 2}%</span><span>{maximum}%</span></div>{data.map(item => {
    const rate = item.count / item.denominator * 100;
    return <div className={`bar-row${item.highlight ? " highlight" : ""}`} data-count={item.count} data-denominator={item.denominator} key={item.label}>
      <div className="bar-label">{item.label}<small>{item.count.toLocaleString("en-US")} / {item.denominator.toLocaleString("en-US")}</small></div>
      <div className="bar-track" aria-hidden="true"><div className="bar-fill" style={{ width: `${rate / maximum * 100}%` }} /></div>
      <span className="bar-value">{rate.toFixed(2)}%</span>
    </div>;
  })}</div>;
}

const sections = [
  { id: "top", label: "项目概览" }, { id: "context", label: "用户与背景" },
  { id: "strategies", label: "设计策略" }, { id: "layout", label: "完整界面" },
  { id: "access", label: "链路简化" }, { id: "focus", label: "目标明确" },
  { id: "feedback", label: "阶梯式反馈" }, { id: "results", label: "数据结果" },
];

export default function MarsCasePage() {
  const [zoneKey, setZoneKey] = useState<keyof typeof marsZones>("battle");
  const [activeSection, setActiveSection] = useState("top");
  const rootRef = useRef<HTMLElement>(null);
  const readingNavRef = useRef<HTMLElement>(null);
  useMarsReveal(rootRef);
  useCaseAccentMotion(rootRef);
  const activeZone = marsZones[zoneKey];
  const zoneStyle: CSSProperties = { left: activeZone.box[0] + "%", top: activeZone.box[1] + "%", width: activeZone.box[2] + "%", height: activeZone.box[3] + "%" };
  const goTo = (id: string) => {
    const target = rootRef.current?.querySelector<HTMLElement>(`[id="${id}"]`);
    revealMarsSection(target ?? null);
    const heading = target?.querySelector<HTMLElement>(".section-heading") ?? target;
    if (heading) window.scrollTo({ top: id === "top" ? 0 : window.scrollY + heading.getBoundingClientRect().top - readingOffset(readingNavRef.current), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  useEffect(() => {
    let pending = 0;
    const update = () => {
      pending = 0;
      rootRef.current?.style.setProperty("--mars-reading-nav-height", `${readingNavRef.current?.getBoundingClientRect().height || 56}px`);
      let selected = "top";
      for (const { id } of sections) {
        const section = rootRef.current?.querySelector<HTMLElement>(`[id="${id}"]`);
        if (section && section.getBoundingClientRect().top <= readingOffset(readingNavRef.current) + 2) selected = id;
      }
      setActiveSection(selected);
    };
    const onScroll = () => { if (!pending) pending = requestAnimationFrame(update); };
    const observer = new ResizeObserver(onScroll);
    if (rootRef.current) observer.observe(rootRef.current);
    if (readingNavRef.current) observer.observe(readingNavRef.current);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(pending); };
  }, []);

  useEffect(() => {
    const nav = readingNavRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !active) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    const offset = itemRect.left < navRect.left + 16 ? itemRect.left - navRect.left - 16
      : itemRect.right > navRect.right - 16 ? itemRect.right - navRect.right + 16 : 0;
    if (offset) nav.scrollBy({ left: offset, behavior: "instant" });
  }, [activeSection]);

  const onContentClick = (event: MouseEvent<HTMLElement>) => {
    const element = event.target as Element;
    const zoneButton = element.closest<HTMLElement>("[data-zone]");
    if (zoneButton && zoneButton.dataset.zone! in marsZones) setZoneKey(zoneButton.dataset.zone as keyof typeof marsZones);
    const anchor = element.closest<HTMLAnchorElement>('a[href^="#"]');
    if (anchor) { event.preventDefault(); goTo(anchor.getAttribute("href")!.slice(1)); }
  };

  return <>
    <MarsReadingProgress rootRef={rootRef} />
    <main ref={rootRef} className="project-page mars-case" data-accent="orange" onClick={onContentClick}>
      <section className="project-hero" id="top" aria-labelledby="case-title">
        <div className="page-shell project-hero-inner case-overview">
          <Link className="back-link" to="/" state={{ targetPanel: "projects" }}><ArrowLeft aria-hidden="true" size={17} /><span>返回项目</span></Link>
          <div className="project-title-block">
            <span className="section-kicker"><span className="kicker-line" />CASE STUDY / 01 · SLG · 轻量 PVP 活动</span>
            <h1 id="case-title">火星纪元</h1>
            <p>面向不同 PVP 参与意愿的玩家，<br />设计低战损成本的对战活动。</p>
            <div className="mars-meta"><span>项目总负责 / 交互设计主导</span><span>核心工作：链路、信息架构、状态与反馈</span><span>2024</span></div>
            <figure className="project-cover-evidence">
              <MarsImage name="完整界面图.png" alt="火星纪元战场全图：中央本人飞船、周边敌方对象、底部目标与操作区" fetchPriority="high"  />
              <figcaption><strong>战场完整交互设计稿</strong><span>原稿中的玩家名、资源数值与队列样式包含示意及旧版内容。</span></figcaption>
            </figure>
          </div>
          <aside className="project-status-panel mars-result-preview">
            <span>目标达成并领奖 / 同周活动对比</span>
            <strong>2.66<small>倍</small></strong>
            <p>本活动参与率为 18.46%<br />同周其他三项竞技活动中的最高值为 6.94%</p>
            <a className="text-link" href="#results">查看比较范围与数据口径<ArrowDownRight aria-hidden="true" size={18} /></a>
            <dl><div><dt>ROLE</dt><dd>项目总负责<br />交互设计主导</dd></div><div><dt>YEAR</dt><dd>2024</dd></div><div><dt>FOCUS</dt><dd>路径 / 状态 / 反馈</dd></div></dl>
            <div className="current-objective"><span>交互设计重点</span><p>参与路径 → 战斗决策 → 反馈与后续行动</p><p>围绕进入、对战和战后行动，组织轻量 PVP 体验。</p></div>
          </aside>
          <nav className="project-menu" aria-label="火星纪元章节">{sections.map(item => <button key={item.id} className={activeSection === item.id ? "is-active" : ""} aria-current={activeSection === item.id ? "location" : undefined} onClick={() => goTo(item.id)}>{item.label}</button>)}</nav>
          <div className="project-storyline">
            <div className="project-storyline-copy"><span>DESIGN STRATEGY</span><p>从参与路径到战后行动，三项策略组织轻量 PVP 体验。</p></div>
            <div className="timeline-track">
              <svg className="timeline-wave" aria-hidden="true" viewBox="0 0 1000 180" preserveAspectRatio="none"><path d="M0 92 C120 42 190 132 305 82 C425 30 530 142 650 96 C785 44 865 116 1000 70" /><path d="M0 116 C145 82 220 146 348 112 C470 80 565 132 694 104 C820 76 900 124 1000 94" /><path d="M0 70 C130 108 246 54 362 86 C486 118 565 58 698 82 C820 104 902 52 1000 86" /></svg>
              {marsStrategies.map((item, index) => <a href={`#${item.id}`} className="timeline-node" data-accent={item.accent} key={item.id}><span>STRATEGY 0{index + 1}</span><strong>{item.title}</strong><p>{item.detail}</p></a>)}
            </div>
          </div>
        </div>
      </section>
      <nav ref={readingNavRef} className="mars-reading-nav" aria-label="案例阅读目录">{sections.map(item => <button key={item.id} aria-current={activeSection === item.id ? "location" : undefined} onClick={() => goTo(item.id)}>{item.label}</button>)}</nav>
    <section className="chapter wrap" id="context">
      <div className="section-heading"><span className="section-no">01 / CONTEXT</span><div><h2>轻量 PVP 活动的两类目标用户</h2><p className="lead">常规 SLG 对战存在战损与决策成本，部分玩家因此较少参与；重度 PVP 用户则受活动间隔和城外对抗环境限制，缺少合适的对战机会。火星纪元希望通过独立的轻量活动，同时满足这两类需求。</p></div></div>
      <div className="audiences">
        <article><span className="audience-icon"><ShieldCheck size={30} strokeWidth={1.5} aria-hidden /></span><span className="mini-label">非重度 PVP 用户</span><h3>希望以较低成本尝试对战、提升战力</h3><p>担心资源损失，不熟悉对战规则。除了明确目标与操作，也需要通过局内成长，以较低成本提高战力，逐步参与对抗。</p><div className="direction"><span className="diagram-caption">设计回应</span><CaseIcon name="scan-eye" /><span>操作过程中明确目标、成本与规则</span></div></article>
        <article><span className="audience-icon"><Swords size={30} strokeWidth={1.5} aria-hidden /></span><span className="mini-label">重度 PVP 活跃用户</span><h3>需要更丰富的对抗机会与进攻方式</h3><p>常规活动存在间隔，城外对抗又受联盟格局限制。轻量战场提供对抗场景，复仇则在常规目标选择之外增加针对袭击者的进攻方式。</p><div className="direction"><span className="diagram-caption">设计回应</span><CaseIcon name="crosshair" /><span>提供明确的对抗目标与收益反馈</span></div></article>
      </div>
      <div className="premise"><span>产品前提</span><p>活动部队由系统提供，不产生真实损兵。活动仍涉及<strong>体力消耗、资源管理、目标锁定和飞船损毁</strong>。交互设计需要说明各项操作的条件与后果。</p></div>
    </section>

    <section className="strategy-band" id="strategies"><div className="wrap chapter">
      <div className="section-heading"><span className="section-no">DESIGN STRATEGY</span><div><span className="kicker">从用户需求到交互决策</span><h2>围绕参与、对战与战后行动，<br />形成三项交互设计策略。</h2><p className="lead">低战损规则提供了参与条件。交互设计进一步处理进入前的流程负担、对战中的判断与操作，以及战斗结果之后的行动衔接。</p></div></div>
      <MarsStrategyOverview />
    </div></section>

    <section className="band" id="layout"><div className="wrap chapter">
      <div className="section-heading"><span className="section-no">02 / INTERFACE</span><div><h2>根据战斗任务，<br />划分界面区域与信息层级。</h2><p className="lead">战场对象占据主要视野，目标进度、资源与常用操作集中在底部。区域划分主要考虑信息之间的关联，以及玩家在战斗前后查看和操作的需要。</p></div></div>
      <div className="layout-module"><div className="layout-study">
        <div>
          <div className="annotated-screen">
            <MarsImage name="完整界面图.png" alt="带分区高亮的完整战场设计稿" loading="lazy"  />
            <div id="zone-highlight" className="zone-highlight" aria-hidden="true" style={zoneStyle}><span id="zone-number">{activeZone.number}</span></div>
            
          </div>
          <p className="caption">中央呈现战场对象，底部集中目标、资源与操作入口。</p>
        </div>
        <div className="zone-list" role="group" aria-label="界面分区">
          <button data-zone="battle" aria-pressed={zoneKey === "battle"}><span>01</span><div><strong>战场对象</strong><small>优先呈现可交互的战场对象</small></div></button>
          <button data-zone="goal" aria-pressed={zoneKey === "goal"}><span>02</span><div><strong>目标与奖励</strong><small>持续显示目标进度与奖励状态</small></div></button>
          <button data-zone="cost" aria-pressed={zoneKey === "cost"}><span>03</span><div><strong>关键资源</strong><small>在操作附近呈现资源与消耗</small></div></button>
          <button data-zone="actions" aria-pressed={zoneKey === "actions"}><span>04</span><div><strong>常用操作</strong><small>集中成长、驻防等相关入口</small></div></button>
          <button data-zone="queue" aria-pressed={zoneKey === "queue"}><span>05</span><div><strong>行军队列</strong><small>持续显示已派遣队列的状态</small></div></button>
          <button data-zone="secondary" aria-pressed={zoneKey === "secondary"}><span>06</span><div><strong>辅助入口</strong><small>与战斗相关操作分区放置</small></div></button>
          <button data-zone="time" aria-pressed={zoneKey === "time"}><span>07</span><div><strong>全局时间</strong><small>顶部提供活动时间背景</small></div></button>
        </div>
      </div>
      <div className="zone-explanation" key={zoneKey} aria-live="polite"><span id="zone-question">{activeZone.question}</span><p id="zone-copy">{activeZone.copy}</p></div>
      <aside className="source-note"><span>原稿版本说明</span><p>主图用于说明布局，不代表最终上线界面。原稿仍有队列解锁示意和旧资源文案；后续规则改为固定4条活动队列、满仓不再标红。此处保留原稿，用于说明信息布局。</p></aside>
      </div>
    </div></section>

    <section className="chapter wrap" id="access">
      <div className="section-heading strategy-heading"><div className="strategy-label"><CaseIcon name="route" /><h2>链路简化</h2></div><div><p className="strategy-thesis">将决策的重心置于实战环节，<br />而非前置的报名与排期阶段。</p><p className="lead">原方案要求玩家在进入玩法前完成报名、选择时段及确认时间。我在流程中省去了这三个环节，使玩家从活动页直接进入战场，将主要决策集中在目标选择和战斗操作上。</p></div></div>
      <MarsPathComparison />
      <div className="entry-note"><h3>保留进入战场前的必要校验</h3><p>流程简化针对报名和时间选择。资源下载、活动开放状态与参与资格仍分别校验，符合条件后进入战场。</p></div>
      <p className="transition-line"><span>接下来</span>进入战场后，设计重点转向目标识别：如何说明可选对象，以及锁定目标后的操作限制。</p>
    </section>

    <section className="band" id="focus"><div className="wrap chapter">
      <div className="section-heading strategy-heading"><div className="strategy-label"><CaseIcon name="crosshair" /><h2>目标明确</h2></div><div><p className="strategy-thesis">围绕一次完整对战，<br />同步目标、场景与操作状态。</p><p className="lead">一次只能锁定一位对手，但场景中同时存在多个敌方对象。我将目标选择、锁定后的限制、攻击效果和战后操作分别落实到对象表现与操作浮层中，避免玩家仅凭记忆判断当前可以做什么。</p></div></div>
      <MarsBattlePath />
      <div className="state-study journey-grid">
        <article className="journey-step" data-target-step="01"><div className="step-heading"><span className="step-number">01</span><div><span className="mini-label">选择前</span><h3>在锁定前，集中呈现收益与消耗</h3></div></div><figure className="screen-proof"><MarsImage name="基地浮层-默认状态.png" alt="选择目标：对手信息、单次可掠夺资源与设为目标的消耗" loading="lazy"  /></figure><p>目标浮层同时展示战力、可掠夺资源和体力消耗。玩家可以在一个位置完成收益与成本判断，再决定是否将其设为目标。</p><p className="rule-note">锁定前再确认更换条件，避免玩家把目标选择理解为可随时切换的普通选中操作。</p></article>
        <article className="journey-step" data-target-step="02"><div className="step-heading"><span className="step-number">02</span><div><span className="mini-label">确认锁定</span><h3>用场景聚焦和操作浮层确认当前目标</h3></div></div><div className="paired-proof"><figure className="model-proof"><MarsImage name="基地状态-瞄准.png" alt="锁定后的聚焦瞄准表现" loading="lazy"  /></figure><figure className="popup-proof"><MarsImage name="基地浮层-已被设为目标状态.png" alt="已锁定目标：进攻、侦察与剩余次数" loading="lazy"  /></figure></div><p>锁定后镜头聚焦目标，聚焦结束自动打开操作浮层；“设为目标”切换为“进攻”，同时展示剩余出击次数，使选择结果直接衔接下一步行动。</p><p className="rule-note">有进攻队列前往当前目标时，“放弃目标”不可用，并提示先撤回队列。</p></article>
        <article className="journey-step" data-target-step="03"><div className="step-heading"><span className="step-number">03</span><div><span className="mini-label">与锁定同时发生</span><h3>其他对象用保护罩说明进攻限制</h3></div></div><div className="paired-proof"><figure className="model-proof"><MarsImage name="基地状态-当前不可攻击.png" alt="其他敌方对象的保护罩" loading="lazy"  /></figure><figure className="popup-proof"><MarsImage name="基地浮层-当前不可攻击.png" alt="受保护对象：限制说明及前往已选目标" loading="lazy"  /></figure></div><p>保护罩使当前不可攻击的对象在场景中可辨认。玩家仍可点击查看原因，并通过“前往已选目标”回到当前对手。</p><p className="rule-note">保护状态与目标锁定同时存在，不是完成锁定后还需要额外经过的一步。</p></article>
        <article className="journey-step" data-target-step="04"><div className="step-heading"><span className="step-number">04</span><div><span className="mini-label">队列到达目标</span><h3>将攻击效果反馈到被攻击对象上</h3></div></div><div className="paired-proof"><figure className="model-proof"><MarsImage name="基地状态-设为目标.png" alt="目标已锁定：血条显示" loading="lazy"  /></figure><figure className="popup-proof"><MarsImage name="基地状态-受击.png" alt="队列到达后，目标受击并扣减血量" loading="lazy"  /></figure></div><p>行军队列到达后，目标播放受击表现，顶部血条同步下降。反馈出现在被攻击对象上，玩家可以直接对应自己的行动与对方的血量变化。</p><p className="rule-note">发起进攻前校验目标是否存在、是否有空闲队列；已有其他队列派出时，说明当前不可进攻的原因。</p></article>
        <article className="journey-step" data-target-step="05"><div className="step-heading"><span className="step-number">05</span><div><span className="mini-label">击败且仍有剩余出击次数</span><h3>击败后切换为掠夺操作</h3></div></div><div className="paired-proof"><figure className="model-proof"><MarsImage name="基地状态-击倒.png" alt="血量清空后的损毁状态" loading="lazy"  /></figure><figure className="popup-proof"><MarsImage name="基地浮层-一键掠夺状态.png" alt="击败后浮层切换为一键掠夺" loading="lazy"  /></figure></div><p>目标损毁确认战斗结束，浮层随后提供“一键掠夺”。胜利弹窗先说明剩余出击次数转化为掠夺资源倍数，再引导玩家完成这次收益操作。</p><p className="rule-note">已有掠夺队列时禁止重复派遣；目标不存在时拦截操作。具体胜负反馈见下一节。</p></article>
        <article className="journey-step" data-target-step="06"><div className="step-heading"><span className="step-number">06</span><div><span className="mini-label">本轮目标结束</span><h3>清除目标限制，恢复后续选择</h3></div></div><figure className="model-proof"><MarsImage name="基地状态-默认.png" alt="可被重新选择的敌方对象默认状态" loading="lazy"  /></figure><p>掠夺成功后，弹窗提示对手即将刷新，资源和奖牌飞入对应区域；其他敌方播放破罩表现，当前敌方刷新。次数耗尽的结算也会说明即将刷新。</p><p className="rule-note">通过对象、保护罩和收益反馈同步交代本轮结束，避免界面残留上一目标的可操作状态。</p></article>
      </div>
      <p className="transition-line"><span>战斗结果</span>对象状态说明战况；结算反馈还需要说明本次获得什么，以及接下来可以采取什么行动。</p>
    </div></section>

    <section className="chapter wrap" id="feedback">
      <div className="section-heading strategy-heading"><div className="strategy-label"><CaseIcon name="layers" /><h2>阶梯式反馈</h2></div><div><p className="strategy-thesis">分层呈现战斗结果，<br />并提供继续参与的行动方向。</p><p className="lead">命中、血量变化和胜负结算分别反馈操作与结果，目标栏持续呈现奖励进度。在此基础上，复仇为喜欢 PVP 的玩家增加进攻方式，局内成长为非重度 PVP 玩家提供低成本提升战力的途径。</p></div></div>
      <MarsFeedbackOverview />

      <div className="feature-story">
        <div className="story-heading"><span className="mini-label">01 / 战斗结果反馈</span><h3>胜利与失败分别说明收益及后续操作</h3><p>胜利后仍需执行掠夺，才能获得对应资源；失败且次数耗尽时，则需要明确本轮结束。两种结算分别呈现结果、收益和后续状态，避免玩家在结算后仍不清楚该如何继续。</p></div>
        <div className="result-pair" id="battle-results">
          <article id="victory"><span className="outcome-label positive">胜利</span><h4>通过胜利氛围，引导战后掠夺</h4>
            <figure className="screen-proof"><MarsImage name="战斗胜利-掠夺引导.png" alt="战斗胜利：击败确认、奖励、剩余次数的资源倍数与前往掠夺" loading="lazy"  /></figure>
            <p>胜利标题、被击败对象与金色氛围共同突出战果，再在收益说明下提供“前往掠夺”，使额外操作与获胜时的情绪保持连贯。</p>
            <dl className="result-rules"><dt>奖励与掠夺分开说明</dt><dd>先展示本次战斗奖励，再说明后续资源收益。击败对手不等于已经完成掠夺。</dd><dt>剩余出击次数转化为掠夺资源倍数</dt><dd>倍数影响掠夺所得资源，掠夺仍需单独执行。没有剩余次数时，不提供不可执行的掠夺入口。</dd></dl>
          </article>
          <article id="defeat"><span className="outcome-label negative">失败</span><h4>呈现补偿，并说明本轮结束条件</h4>
            <figure className="screen-proof"><MarsImage name="战斗失败-补偿奖励.png" alt="战斗失败：系统补偿与次数耗尽、对手刷新说明" loading="lazy"  /></figure>
            <p>失败弹窗明确展示“战斗失败”和系统补偿，避免用奖励掩盖战败结果；同时说明次数耗尽、对手即将刷新，使玩家理解当前目标为何结束。</p>
            <dl className="result-rules"><dt>补偿与失败结果同时呈现</dt><dd>补偿提供本次行动的资源反馈，战败标题仍保留清晰的结果判断。</dd><dt>次数耗尽时说明对象刷新</dt><dd>图中对应出击次数已耗尽的失败结算；不能将这一结束条件等同于每一次进攻失败。</dd></dl>
          </article>
        </div>
      </div>

      <div className="feature-story rewards">
        <div className="story-heading"><span className="mini-label">02 / 阶段目标反馈</span><h3>区分进度增长、阶段达成与奖励领取</h3><p>战斗结果汇入常驻目标栏。我分别设计积分增加、目标完成和可领奖的反馈，确保继续推进目标时，已获得但尚未领取的奖励仍然可见。</p></div>
        <div className="reward-grid"><article data-reward-state="0"><div className="step-heading"><span className="step-number">01</span><div><span className="mini-label">当前目标</span><h4>常驻目标与奖牌获取方式</h4></div></div><figure className="reward-proof"><MarsImage name="奖励栏默认状态.png" alt="常驻目标与奖牌获取方式" loading="lazy"  /></figure><p>目标栏同时说明“进攻玩家获取奖牌”和距离下一目标的差距。玩家在战斗过程中即可查看行动方向与阶段进度。</p></article>
<article data-reward-state="1"><div className="step-heading"><span className="step-number">02</span><div><span className="mini-label">积分增加</span><h4>反馈本次行动带来的进度变化</h4></div></div><figure className="reward-proof"><MarsImage name="奖励栏-积分增加.png" alt="反馈本次行动带来的进度变化" loading="lazy"  /></figure><p>积分增长时更新进度条，保留当前目标。增长反馈与达成反馈分别处理，避免将每次增加都表达为任务完成。</p></article>
<article data-reward-state="2"><div className="step-heading"><span className="step-number">03</span><div><span className="mini-label">目标达成</span><h4>确认阶段完成，再切换下一目标</h4></div></div><figure className="reward-proof"><MarsImage name="奖励栏-当前目标完成.png" alt="确认阶段完成，再切换下一目标" loading="lazy"  /></figure><p>进度满时播放刷光表现，随后切换下一档目标。通过阶段性反馈区分“继续积累”和“已完成当前目标”。</p></article>
<article data-reward-state="3"><div className="step-heading"><span className="step-number">04</span><div><span className="mini-label">奖励可领</span><h4>领奖状态与后续进度同时保留</h4></div></div><figure className="reward-proof"><MarsImage name="奖励栏-有可领取奖励.png" alt="领奖状态与后续进度同时保留" loading="lazy"  /></figure><p>奖励入口显示边缘高亮和数量提示，进度栏仍可显示下一目标。玩家可以继续战斗，也能识别尚未领取的奖励。</p></article>
<article data-reward-state="4"><div className="step-heading"><span className="step-number">05</span><div><span className="mini-label">全部完成</span><h4>结束当前目标序列，提示成就方向</h4></div></div><figure className="reward-proof"><MarsImage name="奖励栏-全部目标完成.png" alt="结束当前目标序列，提示成就方向" loading="lazy"  /></figure><p>全部目标完成后，进度栏切换为完成文案，并提示仍可继续获得成就，不再沿用下一档目标的进度表达。</p></article></div>
        <RewardCoexistence />
        <p className="caption concurrent-note"><span className="concurrent-mark" aria-hidden="true">∥</span>奖励可领取与下一目标进度可以同时存在；这五种状态不是互斥的单线流程。图中数值为设计稿示意。</p>
      </div>

      <section className="feature-story" id="revenge" aria-labelledby="revenge-title">
        <div className="story-heading"><span className="mini-label">复仇 / 丰富 PVP 进攻方式</span><h3 id="revenge-title">通过复仇，为喜欢 PVP 的玩家增加进攻方式</h3><p>复仇在常规目标选择之外，让喜欢 PVP 的玩家可以主动回击曾经袭击自己的对手。交互设计将袭击者、资源损失和复仇状态集中到被攻打记录中，方便玩家选择对手并发起进攻；本人飞船损毁时，先通过修复恢复操作条件。</p></div>
        <div className="evidence-grid">
          <article><div className="step-heading"><span className="step-number">01</span><h4>在损毁对象上提供修复入口</h4></div><figure className="screen-proof"><MarsImage name="复仇-指引1.png" alt="本人飞船损毁：修复气泡与局内培养锁定" loading="lazy"  /></figure><p>飞船模型显示损毁和修复气泡，培养入口同步置灰、加锁。点击修复后播放动画并反馈成功；若损毁发生在培养过程中，则退出培养并提示先修复。</p></article>
          <article><div className="step-heading"><span className="step-number">02</span><h4>以受袭情境引出复仇行动</h4></div><figure className="screen-proof"><MarsImage name="复仇-指引2.png" alt="受袭后的角色对话引导" loading="lazy"  /></figure><p>角色对话指出“有个玩家刚刚掠夺了你”，将复仇与刚发生的受袭事件关联起来。引导说明行动背景，具体对手与损失随后由被攻打记录呈现。</p></article>
        </div>
        <div className="revenge-record"><div><span className="mini-label">03 / 选择复仇对象</span><h4>将袭击者、损失和处理状态放在同一条记录中</h4><p>列表同时呈现玩家、被掠夺资源、被击败时间与复仇入口。未复仇记录提供行动按钮，已复仇记录切换为完成状态，方便区分仍可处理的对象。</p><p>已有锁定目标时，其他复仇入口禁用，并提示先攻打当前目标。确认复仇后，目标出现在战场，其他敌方开启保护罩，沿用同一套目标约束。</p></div><figure className="screen-proof"><MarsImage name="复仇界面.png" alt="被攻打记录：袭击者、资源损失、时间、未复仇和已复仇状态" loading="lazy"  /></figure></div>
      </section>

      <section className="feature-story" id="growth" aria-labelledby="growth-title">
        <div className="story-heading"><span className="mini-label">局内成长 / 低成本提升战力</span><h3 id="growth-title">为非重度 PVP 玩家提供低成本提升战力的途径</h3><p>局内成长主要面向非重度 PVP 玩家，通过水晶强化、突破和技能学习，提供低成本提升战力的途径；重度 PVP 玩家同样可以参与养成。交互设计重点是明确每次投入的收益、成长条件与技能选择限制，使玩家能够判断如何培养，而不只看到一个战力数值。</p></div>
        <div className="evidence-grid growth-grid">
          <article><div className="step-heading"><span className="step-number">01</span><h4>强化前对照收益与消耗</h4></div><figure className="screen-proof"><MarsImage name="水晶养成-强化.png" alt="水晶强化：星级变化、产出与容量前后对比和消耗" loading="lazy"  /></figure><p>同屏展示当前与下一星级、资源产出、安全容量、储存容量和消耗，支持玩家判断投入价值。长按可连续强化，松开或资源不足时停止。</p><p className="rule-note">资源不足时提供攻击玩家、攻击野怪和采集资源的补充途径，并根据地图状态定位对应对象。</p></article>
          <article><div className="step-heading"><span className="step-number">02</span><h4>突破阶段明确新的等级变化</h4></div><figure className="screen-proof"><MarsImage name="水晶养成-突破.png" alt="水晶突破：等级变化、收益对比与突破按钮" loading="lazy"  /></figure><p>达到进阶阶段时，界面从星级强化切换为等级突破。水晶外观、等级和属性对比共同说明这次成长与普通强化的区别。</p><p className="rule-note">“满级预览”支持提前查看成长终点；达到满级后隐藏预览入口。</p></article>
          <article><div className="step-heading"><span className="step-number">03</span><h4>突破成功后直达可学习技能</h4></div><figure className="screen-proof"><MarsImage name="水晶养成-突破成功弹窗.png" alt="突破成功弹窗与前往选择技能入口" loading="lazy"  /></figure><p>突破成功弹窗提供“前往选择技能”。点击后进入技能页并定位可学习项，使解锁结果直接衔接后续选择，不要求玩家自行查找新内容。</p></article>
          <article><div className="step-heading"><span className="step-number">04</span><h4>以等级依赖与互斥状态组织技能选择</h4></div><figure className="screen-proof"><MarsImage name="局内技能界面.png" alt="技能界面：等级路径、可学习高亮和未解锁状态" loading="lazy"  /></figure><p>等级路径显示前置关系，可学习技能以边缘光效突出，未解锁项显示等级条件。选择同列一个技能后，另一个进入已弃学状态，避免误认为所有技能都能同时获得。</p><dl className="skill-rules"><dt>可学习</dt><dd>提示“同一列仅可学习1个技能”。</dd><dt>已弃学</dt><dd>说明该列另一技能已学习。</dd><dt>前置未完成</dt><dd>提示先学习低等级技能。</dd></dl></article>
        </div>
      </section>
    </section>

    <section className="results-band" id="results"><div className="wrap chapter">
      <div className="section-heading"><span className="section-no">06 / EVIDENCE</span><div><h2>活动参与及关键行为数据</h2><p className="lead">三项策略分别处理参与路径、战斗决策与后续行动。上线数据反映整体活动参与和关键行为，不单独证明某个界面设计的效果。</p></div></div>
      <article className="data-block"><div className="data-intro"><span className="mini-label">观察 01 / 活动参与</span><h3>同一周，更多目标玩家在本活动中<br />完成了至少一个目标并领奖。</h3><p>S1–S48 · 2024.06.10–06.16<br />同一近活目标人群 14,822 人，主城等级≥11。</p></div><div className="chart"><div className="chart-heading"><span>完成至少一个目标并领奖 / 占目标人群</span><span>0–20%</span></div><MarsChart id="comparison-chart" data={marsMetrics.comparison} maximum={20} /><p className="chart-footnote">三项参考活动为原表中其余同周、同领奖定义的竞技活动。火星纪元 2,736 / 14,822 = 18.46%，参考范围 2.61%–6.94%。与其中最高值相比，参与率之比为 2,736 / 1,028 ≈ 2.66；两者使用相同分母。</p></div></article>

      <article className="data-block"><div className="data-intro"><span className="mini-label">观察 02 / 战场内行动</span><h3>进攻人数相当于<br />进入战场人数的 <em>89.96%</em>。</h3><p>S1–S72 · 2024.06.14–06.16<br />以 6,426 名进入战场的玩家为参照。</p></div><div className="chart"><div className="chart-heading"><span>各行为去重人数 / 进入战场人数</span><span>0–100%</span></div><MarsChart id="behavior-chart" data={marsMetrics.behavior} maximum={100} /><p className="chart-footnote">原表按事件统计去重UID；未提供同一批UID的时序核对。图中比例反映各事件人数与进入战场人数的关系，尚不能确认同一批玩家的完整转化路径。</p></div></article>

      <article className="data-block"><div className="data-intro"><span className="mini-label">观察 03 / 人群覆盖</span><h3>社交偏好用户的进攻参与率<br />高于对应的单机偏好用户。</h3><p>S1–S72 · 2024.06.14–06.16<br />分母为各行为组的近活目标人数。</p></div><div className="chart"><div className="chart-heading"><span>至少发起一次进攻 / 对应行为组</span><span>0–50%</span></div><MarsChart id="segment-chart" data={marsMetrics.segments} maximum={50} /><p className="chart-footnote">休闲-社交 294 / 1,188 = 24.75%；硬核-社交 4,697 / 9,659 = 48.63%。原表行为分组不等同于PVP意愿，也不证明用户此前从未对战。</p></div></article>
    </div></section>


      <footer className="case-footer wrap"><div><strong>钟成龙 / VANCOAL</strong><span>项目总负责 · 交互设计</span></div><a href="#top" className="text-link">返回开头<ArrowUpRight aria-hidden="true" size={18} /></a></footer>
      <ControllerHints left="READ CASE SECTIONS" right="BACK HOME" placement="inline" />
    </main>
  </>;
}
