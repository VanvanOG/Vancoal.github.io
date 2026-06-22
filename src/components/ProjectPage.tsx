import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  Braces,
  CheckCircle2,
  CircleDot,
  Code2,
  FileText,
  Frame,
  GitBranch,
  Layers3,
  ListChecks,
  MousePointer2,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Undo2,
  Video,
  WandSparkles,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import type {
  LabExperimentSection,
  LabIconKey,
  LabPathItem,
  Project,
  ProjectDataVisual,
  ProjectEvidenceGroup,
  ProjectEvidenceItem,
  ProjectInteractiveDemo,
  ProjectLabPage,
} from "../types";
import ControllerHints from "./ControllerHints";
import DiagramBlock from "./DiagramBlock";
import ImagePlaceholder from "./ImagePlaceholder";
import MetricStrip from "./MetricStrip";
import ProjectDemoModal from "./ProjectDemoModal";

interface ProjectPageProps {
  project: Project;
}

const menuItems = [
  { href: "#overview", label: "OVERVIEW" },
  { href: "#storyline", label: "STORYLINE" },
  { href: "#system", label: "SYSTEM" },
  { href: "#evidence", label: "EVIDENCE" },
];

const labMenuItems = [
  { href: "#lab-overview", label: "OVERVIEW" },
  { href: "#lab-prototype", label: "PROTOTYPE" },
  { href: "#lab-plugin", label: "PLUGIN" },
  { href: "#lab-skill", label: "SKILL" },
];

const labSectionIds = ["lab-prototype", "lab-plugin", "lab-skill"] as const;

const collectEvidenceItems = (project: Project) => {
  const items = [
    project.coverEvidence,
    ...project.sections.flatMap((section) =>
      section.evidenceGroups?.flatMap((group) => group.items) ?? [],
    ),
  ].filter(Boolean) as ProjectEvidenceItem[];
  const unique = new Map<string, ProjectEvidenceItem>();

  items.forEach((item) => {
    if (!unique.has(item.name)) {
      unique.set(item.name, item);
    }
  });

  return Array.from(unique.values());
};

function EvidenceGroup({ group }: { group: ProjectEvidenceGroup }) {
  const variant = group.variant ?? "feature";

  return (
    <div className="evidence-group" data-count={group.items.length} data-layout={variant} data-reveal>
      <div className="evidence-group-heading" data-reveal>
        <span>
          {variant === "matrix"
            ? "STATE MATRIX"
            : variant === "state-strip"
              ? "STATE STRIP"
              : variant === "comparison"
                ? "SWITCH GROUP"
                : "INTERFACE EVIDENCE"}
        </span>
        <h3>{group.title}</h3>
        {group.summary ? <p>{group.summary}</p> : null}
      </div>
      <div className="evidence-grid">
        {group.items.map((item, index) => (
          <figure
            className={`evidence-card evidence-card-${item.type}${item.display ? ` evidence-display-${item.display}` : ""}`}
            data-display={item.display ?? item.type}
            data-index={String(index + 1).padStart(2, "0")}
            data-reveal
            key={`${group.title}-${item.name}`}
          >
            <div className="evidence-image-wrap">
              {item.media === "video" ? (
                <video
                  src={item.src}
                  aria-label={item.description}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={item.src} alt={item.description} loading="lazy" />
              )}
            </div>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.description}</span>
              <p>{item.purpose}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function DataVisuals({ visuals }: { visuals: ProjectDataVisual[] }) {
  return (
    <div className="data-visual-grid">
      {visuals.map((visual) => (
        <article className="data-visual" data-chart={visual.chartType} data-reveal key={visual.title}>
          <div className="data-visual-heading">
            <span>{visual.chartType.toUpperCase()}</span>
            <h3>{visual.title}</h3>
            <p>{visual.summary}</p>
          </div>
          <div className="data-visual-items">
            {visual.items.map((item, index) => (
              <div className="data-visual-row" key={`${visual.title}-${item.label}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.value}</strong>
                <div>
                  <b>{item.label}</b>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {visual.note ? <p className="data-visual-note">{visual.note}</p> : null}
        </article>
      ))}
    </div>
  );
}

const labIconMap = {
  prototype: Code2,
  workflow: Workflow,
  skill: WandSparkles,
  structure: Layers3,
  gesture: MousePointer2,
  guardrail: ShieldCheck,
  history: Undo2,
  schema: Braces,
  mapping: Frame,
  state: Workflow,
  rules: GitBranch,
  evidence: ListChecks,
  report: FileText,
} satisfies Record<LabIconKey, typeof Code2>;

function LabIcon({ icon }: { icon: LabIconKey }) {
  const Icon = labIconMap[icon];

  return <Icon aria-hidden="true" size={20} strokeWidth={1.8} />;
}

function LabPathCard({ path }: { path: LabPathItem }) {
  return (
    <article className="ai-lab-path-card" data-accent={path.accent} data-reveal>
      <div className="ai-lab-path-icon">
        <LabIcon icon={path.icon} />
      </div>
      <span>{path.label}</span>
      <h3>{path.title}</h3>
      <p>{path.detail}</p>
    </article>
  );
}

function LabSideMenu() {
  return (
    <aside className="ai-lab-side-menu" data-reveal>
      {labMenuItems.map((item, index) => (
        <a href={item.href} key={item.href} data-active={index === 0 ? "true" : undefined}>
          <span>{item.label}</span>
        </a>
      ))}
    </aside>
  );
}

function LabTimeline({ paths }: { paths: LabPathItem[] }) {
  return (
    <div className="ai-lab-storyline" data-reveal>
      <svg className="ai-lab-storyline-wave" viewBox="0 0 900 170" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 84 C128 32 198 136 318 84 S530 28 666 86 796 122 900 66" />
        <path d="M0 102 C132 66 214 116 332 98 S538 54 670 104 800 128 900 92" />
        <path d="M0 72 C142 96 202 42 336 74 S552 122 682 76 808 36 900 80" />
      </svg>
      <div className="ai-lab-storyline-axis" />
      <div className="ai-lab-storyline-nodes">
        {paths.map((path) => (
          <article className="ai-lab-storyline-node" data-accent={path.accent} key={path.title}>
            <i aria-hidden="true" />
            <span>{path.label}</span>
            <strong>{path.title}</strong>
            <p>{path.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function AiLabStatusPanel({ project, labPage }: { project: Project; labPage: ProjectLabPage }) {
  return (
    <aside className="ai-lab-status-panel" data-reveal>
      <span>CASE FILE</span>
      <strong>{String(labPage.experiments.length).padStart(2, "0")}</strong>
      <p>LAB EXPERIMENTS</p>
      <dl>
        <div>
          <dt>ROLE</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>FOCUS</dt>
          <dd>AI / RULE / TOOL</dd>
        </div>
        <div>
          <dt>MODE</dt>
          <dd>{project.category}</dd>
        </div>
      </dl>
      <div className="ai-lab-current-objective">
        <span>
          <CircleDot aria-hidden="true" size={13} strokeWidth={2} />
          CURRENT OBJECTIVE
        </span>
        <p>{project.response}</p>
      </div>
    </aside>
  );
}

function LabFlowDiagram({
  diagram,
  accent,
}: {
  diagram: LabExperimentSection["mainDiagram"];
  accent: LabExperimentSection["accent"];
}) {
  const flowStyle = { "--flow-count": diagram.nodes.length } as CSSProperties;

  return (
    <article className="ai-lab-flow-diagram" data-accent={accent} data-reveal>
      <span>System Flow</span>
      <h3>{diagram.title}</h3>
      <p>{diagram.summary}</p>
      <div className="ai-lab-flow-nodes" style={flowStyle}>
        {diagram.nodes.map((node, index) => (
          <div className="ai-lab-flow-node" key={node}>
            <i>{String(index + 1).padStart(2, "0")}</i>
            <strong>{node}</strong>
            {index < diagram.nodes.length - 1 ? <b aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
      {diagram.note ? <p className="ai-lab-flow-note">{diagram.note}</p> : null}
    </article>
  );
}

function LabVideoFigure({
  video,
  accent,
}: {
  video: NonNullable<LabExperimentSection["video"]>;
  accent: LabExperimentSection["accent"];
}) {
  return (
    <figure className="ai-lab-video-asset" data-accent={accent} data-reveal>
      <div className="ai-lab-video-frame">
        <video src={video.src} autoPlay loop muted playsInline preload="metadata" />
      </div>
      <figcaption>
        <span>
          <Video aria-hidden="true" size={14} strokeWidth={1.8} />
          {video.name}
        </span>
        <strong>{video.title}</strong>
        <p>{video.description}</p>
      </figcaption>
    </figure>
  );
}

function LabAssetFigure({
  asset,
  demo,
  onOpenDemo,
  accent,
}: {
  asset: LabExperimentSection["asset"];
  demo?: ProjectInteractiveDemo;
  onOpenDemo: (demo: ProjectInteractiveDemo) => void;
  accent: LabExperimentSection["accent"];
}) {
  const isReport = asset.display === "report";

  return (
    <figure
      className={`ai-lab-asset ai-lab-asset-${asset.display}`}
      data-accent={accent}
      data-reveal
    >
      <div className={isReport ? "ai-lab-report-frame" : "ai-lab-phone-frame"}>
        <img src={asset.src} alt={asset.description} loading="lazy" />
      </div>
      <figcaption>
        <span>{asset.name}</span>
        <strong>{asset.title}</strong>
        <p>{asset.description}</p>
        {demo ? (
          <button className="subcase-demo-launch ai-lab-demo-launch" type="button" onClick={() => onOpenDemo(demo)}>
            <Play aria-hidden="true" size={18} fill="currentColor" />
            <span>{demo.label}</span>
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}

function LabExperiment({
  experiment,
  index,
  onOpenDemo,
}: {
  experiment: LabExperimentSection;
  index: number;
  onOpenDemo: (demo: ProjectInteractiveDemo) => void;
}) {
  return (
    <section
      className="ai-lab-experiment section-band"
      data-accent={experiment.accent}
      id={labSectionIds[index]}
    >
      <div className="page-shell ai-lab-experiment-inner">
        <div className="ai-lab-section-head" data-reveal>
          <span className="section-kicker">
            <span className="kicker-line" />
            {experiment.eyebrow} / {String(index + 1).padStart(2, "0")}
          </span>
          <h2>{experiment.title}</h2>
          <p>{experiment.value}</p>
        </div>

        <div className="ai-lab-section-grid">
          <div className="ai-lab-analysis-stack">
            <article className="ai-lab-problem-panel" data-reveal>
              <span>{experiment.problemTitle}</span>
              <ul>
                {experiment.problems.map((problem) => (
                  <li key={problem}>
                    <TriangleAlert aria-hidden="true" size={15} strokeWidth={1.8} />
                    <p>{problem}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="ai-lab-judgment" data-reveal>
              <Sparkles aria-hidden="true" size={18} strokeWidth={1.8} />
              <div>
                <span>Design Judgment</span>
                <p>{experiment.judgment}</p>
              </div>
            </article>

            <LabFlowDiagram diagram={experiment.mainDiagram} accent={experiment.accent} />
          </div>

          <div className="ai-lab-media-stack">
            {experiment.video ? <LabVideoFigure video={experiment.video} accent={experiment.accent} /> : null}
            <LabAssetFigure
              asset={experiment.asset}
              demo={experiment.demo}
              onOpenDemo={onOpenDemo}
              accent={experiment.accent}
            />
          </div>
        </div>

        <div className="ai-lab-micro-area" data-reveal>
          <div className="ai-lab-micro-heading">
            <span>{experiment.microTitle}</span>
            <h3>机制拆解</h3>
          </div>
          <div className="ai-lab-micro-grid">
            {experiment.microItems.map((item) => (
              <article className="ai-lab-micro-card" key={item.title}>
                <div className="ai-lab-micro-icon">
                  <LabIcon icon={item.icon} />
                </div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="ai-lab-mechanism-table" aria-label={`${experiment.title} mechanism table`}>
            {experiment.mechanisms.map((row) => (
              <div className="ai-lab-mechanism-row" key={row.label}>
                <span>{row.label}</span>
                <p>{row.detail}</p>
                <strong>{row.outcome}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AiLabProjectPage({
  project,
  labPage,
  onOpenDemo,
}: {
  project: Project;
  labPage: ProjectLabPage;
  onOpenDemo: (demo: ProjectInteractiveDemo) => void;
}) {
  return (
    <main className="project-page ai-lab-page" data-accent={project.accent}>
      <section className="ai-lab-hero" id="lab-overview">
        <div className="page-shell ai-lab-hero-inner">
          <Link className="back-link" to="/#projects">
            <ArrowLeft aria-hidden="true" size={17} />
            <span>Back Home</span>
          </Link>
          <LabSideMenu />
          <div className="ai-lab-hero-copy" data-reveal>
            <span className="section-kicker">
              <span className="kicker-line" />
              {labPage.intro.eyebrow}
            </span>
            <h1>{labPage.intro.title}</h1>
            <p>{labPage.intro.value}</p>
          </div>
          <AiLabStatusPanel project={project} labPage={labPage} />
          <LabTimeline paths={labPage.intro.paths} />
          <div className="ai-lab-hero-hints" data-reveal>
            <ControllerHints placement="inline" left="SWITCH LAB MODULES" right="BACK HOME" />
          </div>
        </div>
      </section>

      {labPage.experiments.map((experiment, index) => (
        <LabExperiment
          experiment={experiment}
          index={index}
          key={experiment.title}
          onOpenDemo={onOpenDemo}
        />
      ))}

      <section className="ai-lab-closing section-band" data-accent={project.accent}>
        <div className="page-shell ai-lab-closing-inner">
          <div className="ai-lab-section-head" data-reveal>
            <span className="section-kicker">
              <span className="kicker-line" />
              {labPage.closing.eyebrow}
            </span>
            <h2>{labPage.closing.title}</h2>
            <p>{labPage.closing.value}</p>
          </div>
          <div className="ai-lab-closing-chain">
            {labPage.closing.chains.map((chain) => (
              <article className="ai-lab-closing-card" data-accent={chain.accent} data-reveal key={chain.title}>
                <LabIcon icon={chain.icon} />
                <span>{chain.label}</span>
                <strong>{chain.title}</strong>
                <p>{chain.detail}</p>
              </article>
            ))}
          </div>
          <div className="ai-lab-final-line" data-reveal>
            <CheckCircle2 aria-hidden="true" size={20} strokeWidth={1.8} />
            <p>{labPage.closing.sentence}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const [activeDemo, setActiveDemo] = useState<ProjectInteractiveDemo | null>(null);
  const closeDemo = useCallback(() => setActiveDemo(null), []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".project-page");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!root || reducedMotion) {
      root?.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 34}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [project.slug]);

  if (project.labPage) {
    return (
      <>
        <AiLabProjectPage project={project} labPage={project.labPage} onOpenDemo={setActiveDemo} />
        <ProjectDemoModal demo={activeDemo} onClose={closeDemo} />
      </>
    );
  }

  const currentNodeIndex = Math.max(
    project.timeline.findIndex((node) => node.accent === "orange"),
    0,
  );
  const currentNode = project.timeline[currentNodeIndex] ?? project.timeline[0];
  const evidenceItems = collectEvidenceItems(project);
  const evidenceCount = evidenceItems.length || project.placeholders.length;
  const isAiDesignLab = project.slug === "ai-design-lab";

  return (
    <>
    <main className="project-page" data-accent={project.accent}>
      <section className="project-hero">
        <div className="page-shell project-hero-inner">
          <Link className="back-link" to="/#projects">
            <ArrowLeft aria-hidden="true" size={17} />
            <span>Back Home</span>
          </Link>

          <div className="project-title-block" data-reveal>
            <span className="section-kicker">
              <span className="kicker-line" />
              Case Study
            </span>
            <h1>{project.title}</h1>
            <p>{project.category}</p>
            {project.coverEvidence ? (
              <figure className="project-cover-evidence">
                <div>
                  <img src={project.coverEvidence.src} alt={project.coverEvidence.description} />
                </div>
                <figcaption>
                  <strong>{project.coverEvidence.name}</strong>
                  <span>{project.coverEvidence.purpose}</span>
                </figcaption>
              </figure>
            ) : null}
          </div>

          <nav className="project-menu" aria-label="Project case sections" data-reveal>
            {menuItems.map((item, index) => (
              <a className={index === 0 ? "is-active" : undefined} href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="project-storyline" id="storyline" data-reveal>
            <div className="project-storyline-copy">
              <span>STORYLINE OVERVIEW</span>
              <p>{project.summary}</p>
            </div>
            <div className="timeline-track" aria-label="Project storyline timeline">
              <svg className="timeline-wave" aria-hidden="true" viewBox="0 0 1000 180" preserveAspectRatio="none">
                <path d="M0 92 C120 42 190 132 305 82 C425 30 530 142 650 96 C785 44 865 116 1000 70" />
                <path d="M0 116 C145 82 220 146 348 112 C470 80 565 132 694 104 C820 76 900 124 1000 94" />
                <path d="M0 70 C130 108 246 54 362 86 C486 118 565 58 698 82 C820 104 902 52 1000 86" />
              </svg>
              {project.timeline.map((node, index) => {
                const isCurrent = index === currentNodeIndex;

                return (
                  <article
                    aria-current={isCurrent ? "step" : undefined}
                    className="timeline-node"
                    data-accent={isCurrent ? "orange" : node.accent}
                    data-current={isCurrent ? "true" : undefined}
                    key={node.title}
                  >
                    <span>{node.label}</span>
                    <strong>{node.title}</strong>
                    <p>{node.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="project-status-panel" aria-label="Project status summary" data-reveal>
            <span>CASE FILE</span>
            <strong>{String(project.timeline.length).padStart(2, "0")}</strong>
            <p>STORY PARTS</p>
            <dl>
              <div>
                <dt>ROLE</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>FOCUS</dt>
                <dd>{project.category}</dd>
              </div>
              <div>
                <dt>MODE</dt>
                <dd>CASE STUDY</dd>
              </div>
              <div>
                <dt>EVIDENCE</dt>
                <dd>{String(evidenceCount).padStart(2, "0")} ITEMS</dd>
              </div>
            </dl>
            {currentNode ? (
              <div className="current-objective">
                <span>CURRENT OBJECTIVE</span>
                <p>{currentNode.description}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="project-overview section-band" id="overview">
        <div className="page-shell overview-grid">
          <article data-reveal>
            <div className="overview-mini-icon" aria-hidden="true">
              <TriangleAlert size={25} strokeWidth={1.8} />
            </div>
            <span>Original Resistance</span>
            <p>{project.challenge}</p>
          </article>
          <article data-reveal>
            <div className="overview-mini-icon" aria-hidden="true">
              <Route size={25} strokeWidth={1.8} />
            </div>
            <span>Design Response</span>
            <p>{project.response}</p>
          </article>
          <article data-reveal>
            <div className="overview-mini-icon" aria-hidden="true">
              <ShieldCheck size={25} strokeWidth={1.8} />
            </div>
            <span>Evidence Boundary</span>
            <p>{project.evidenceBoundary}</p>
          </article>
        </div>
      </section>

      {!isAiDesignLab ? (
        <section className="project-metrics-section section-band" aria-label="Project metrics">
          <div className="page-shell">
            <MetricStrip metrics={project.metrics} />
          </div>
        </section>
      ) : null}

      <section className="case-sections section-band" id="system">
        <div className="page-shell case-section-stack">
          {project.sections.map((section) => (
            <article className="case-section" data-reveal key={section.title}>
              <div className="case-section-copy">
                <span className="case-eyebrow">{section.eyebrow}</span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {section.diagramTitle && section.diagramItems ? (
                <DiagramBlock title={section.diagramTitle} items={section.diagramItems} />
              ) : null}
              {section.evidenceGroups ? (
                <div className="case-section-evidence">
                  {section.evidenceGroups.map((group) => (
                    <EvidenceGroup group={group} key={group.title} />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {project.dataVisuals ? (
        <section className="project-data-results section-band" id="evidence">
          <div className="page-shell">
            <div className="section-heading compact" data-reveal>
              <span className="section-kicker">
                <span className="kicker-line" />
                Data Evidence
              </span>
              <h2>活动系统结果证据</h2>
              <p>所有数据保留分母、对比对象和结论边界，只用于验证活动系统整体表现。</p>
            </div>
            <DataVisuals visuals={project.dataVisuals} />
          </div>
        </section>
      ) : null}

      {project.subcases ? (
        <section className="lab-section">
          <div className="page-shell">
            <div className="section-heading compact">
              <span className="section-kicker">
                <span className="kicker-line" />
                Lab Cases
              </span>
              <h2>AI Design Lab</h2>
            </div>
            <div className="subcase-grid">
              {project.subcases.map((subcase) => (
                <article className="subcase" key={subcase.title}>
                  <span>{subcase.subtitle}</span>
                  <h3>{subcase.title}</h3>
                  <p>{subcase.summary}</p>
                  <ul>
                    {subcase.proof.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {subcase.demo ? (
                    <button
                      className="subcase-demo-launch"
                      type="button"
                      onClick={() => setActiveDemo(subcase.demo ?? null)}
                    >
                      <Play aria-hidden="true" size={18} fill="currentColor" />
                      <span>{subcase.demo.label}</span>
                    </button>
                  ) : null}
                  <div className="subcase-placeholders">
                    {subcase.placeholders.slice(0, 3).map((item) => (
                      <ImagePlaceholder item={item} key={item.id} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {evidenceItems.length === 0 && !isAiDesignLab ? (
        <section className="placeholder-gallery section-band" id="evidence">
          <div className="page-shell">
            <div className="section-heading compact">
              <span className="section-kicker">
                <span className="kicker-line" />
                Evidence Slots
              </span>
              <h2>Interface Evidence Slots</h2>
              <p>All numbered slots stay aligned with the delivery file structure. Replace placeholders with real screenshots later.</p>
            </div>
            <div className="placeholder-grid">
              {project.placeholders.map((item) => (
                <ImagePlaceholder item={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!isAiDesignLab ? (
        <ControllerHints left="READ CASE SECTIONS" right="BACK HOME" placement="inline" />
      ) : null}
    </main>
    <ProjectDemoModal demo={activeDemo} onClose={closeDemo} />
    </>
  );
}
