export type Accent = "orange" | "purple" | "cyan" | "green" | "red";

export interface ProfileItem {
  label: string;
  value: string;
}

export interface ProfileGroup {
  title: string;
  items: string[];
}

export interface ProjectMetric {
  value: string;
  label: string;
  detail: string;
  accent: Accent;
}

export interface TimelineNode {
  label: string;
  title: string;
  description: string;
  accent: Accent;
}

export interface DiagramItem {
  label: string;
  detail: string;
}

export interface ProjectSection {
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  diagramTitle?: string;
  diagramItems?: DiagramItem[];
  evidenceGroups?: ProjectEvidenceGroup[];
}

export interface ImagePlaceholderItem {
  id: string;
  type: "full" | "small";
  description: string;
}

export interface ProjectEvidenceItem {
  name: string;
  src: string;
  type: "full" | "small" | "wide";
  media?: "image" | "video";
  display?:
    | "device"
    | "device-large"
    | "phone"
    | "phone-large"
    | "panel"
    | "state"
    | "strip"
    | "video";
  description: string;
  purpose: string;
}

export interface ProjectEvidenceGroup {
  title: string;
  summary: string;
  items: ProjectEvidenceItem[];
  variant?: "feature" | "comparison" | "state-strip" | "matrix";
}

export interface ProjectDataVisual {
  title: string;
  chartType: "bars" | "funnel" | "comparison" | "steps";
  summary: string;
  items: ProjectDataPoint[];
  note?: string;
}

export interface ProjectDataPoint {
  label: string;
  value: string;
  detail: string;
}

export interface ProjectInteractiveDemo {
  label: string;
  src: string;
  title: string;
  description: string;
}

export interface ProjectSubcase {
  title: string;
  subtitle: string;
  summary: string;
  proof: string[];
  placeholders: ImagePlaceholderItem[];
  demo?: ProjectInteractiveDemo;
}

export type LabIconKey =
  | "prototype"
  | "workflow"
  | "skill"
  | "structure"
  | "gesture"
  | "guardrail"
  | "history"
  | "schema"
  | "mapping"
  | "state"
  | "rules"
  | "evidence"
  | "report";

export interface LabPathItem {
  title: string;
  label: string;
  detail: string;
  accent: Accent;
  icon: LabIconKey;
}

export interface LabDiagram {
  title: string;
  summary: string;
  nodes: string[];
  note?: string;
}

export interface LabMicroItem {
  title: string;
  detail: string;
  icon: LabIconKey;
}

export interface LabMechanismRow {
  label: string;
  detail: string;
  outcome: string;
}

export interface LabAsset {
  title: string;
  name: string;
  src: string;
  description: string;
  display: "phone" | "report";
}

export interface LabVideoAsset {
  title: string;
  name: string;
  src: string;
  description: string;
}

export interface LabExperimentSection {
  eyebrow: string;
  title: string;
  value: string;
  problemTitle: string;
  problems: string[];
  judgment: string;
  mainDiagram: LabDiagram;
  microTitle: string;
  microItems: LabMicroItem[];
  mechanisms: LabMechanismRow[];
  asset: LabAsset;
  video?: LabVideoAsset;
  demo?: ProjectInteractiveDemo;
  accent: Accent;
}

export interface ProjectLabPage {
  intro: {
    eyebrow: string;
    title: string;
    value: string;
    paths: LabPathItem[];
  };
  experiments: LabExperimentSection[];
  closing: {
    eyebrow: string;
    title: string;
    value: string;
    chains: LabPathItem[];
    sentence: string;
  };
}

export interface Project {
  slug: string;
  shortTitle: string;
  title: string;
  category: string;
  role: string;
  summary: string;
  positioning: string;
  accent: Accent;
  cardStat: string;
  cardCaption: string;
  challenge: string;
  response: string;
  evidenceBoundary: string;
  metrics: ProjectMetric[];
  timeline: TimelineNode[];
  sections: ProjectSection[];
  placeholders: ImagePlaceholderItem[];
  coverEvidence?: ProjectEvidenceItem;
  dataVisuals?: ProjectDataVisual[];
  subcases?: ProjectSubcase[];
  labPage?: ProjectLabPage;
}
