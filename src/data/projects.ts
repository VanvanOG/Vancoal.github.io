import type {
  Accent,
  Project,
  ProjectLabPage,
} from "../types";
import { publicPath } from "../utils/publicPath";


const aiLabImage = (name: string) =>
  publicPath(`/media/ai-design-lab/${encodeURIComponent(`${name}.png`)}`);
const aiLabVideo = (name: string) =>
  publicPath(`/media/ai-design-lab/${encodeURIComponent(`${name}.mp4`)}`);

const aiLabPage: ProjectLabPage = {
  intro: {
    eyebrow: "Lab System",
    title: "AI Design Lab",
    value:
      "我把 AI 放进交互设计流程的三个关键位置：用 AI Coding 验证可操作原型，用插件把界面说明变成结构化交付，用 Skill 把评审经验沉淀成可调用方法。",
    paths: [
      {
        title: "AI Coding 原型验证",
        label: "Prototype",
        detail: "把规则判断推进到可试玩 Demo，而不是停在静态稿说明。",
        accent: "cyan",
        icon: "prototype",
      },
      {
        title: "AI 插件工作流",
        label: "Workflow",
        detail: "把 Frame 输入、规则提示、JSON 解析和文档回写串成工具链。",
        accent: "purple",
        icon: "workflow",
      },
      {
        title: "Skill 方法沉淀",
        label: "Method",
        detail: "把审查对象、规则来源、证据等级和输出模板组织成可复用流程。",
        accent: "green",
        icon: "skill",
      },
    ],
  },
  experiments: [
    {
      eyebrow: "Experiment 01",
      title: "画格子 Demo：从自由涂格到可控户型编辑原型",
      value:
        "我用两轮 AI Coding，把基础网格工具推进成会识别房间归属、手势意图和空间风险的交互原型。",
      problemTitle: "问题诊断",
      problems: [
        "初版可以点击、拖拽、撤销，但本质仍是自由涂格。",
        "用户真实编辑户型时，不是从空白格子开始，而是在已有房间结构上局部修改。",
        "同一个拖动动作可能代表新增、擦除、浏览或误触，不能只按鼠标移动处理。",
        "删除、覆盖、清空会破坏房间连通性，必须给出风险判断和反馈。",
        "静态稿只能说明规则，不能证明这些规则在连续操作中是否成立。",
      ],
      judgment:
        "把画格子改成编辑空间对象：先建立默认户型和房间归属，再围绕人的操作习惯设计手势分流、规则校验、对象工具栏和风险反馈。",
      mainDiagram: {
        title: "初版到终版交互细节增量图",
        summary: "从基础编辑器逐步增加对象、手势、校验和反馈层。",
        nodes: ["初版基础编辑器", "空间对象", "手势意图", "规则校验", "风险反馈", "终版规则型原型"],
        note: "新增设计层负责把自由操作收束为可控户型编辑。",
      },
      microTitle: "关键机制",
      microItems: [
        {
          title: "操作习惯映射",
          detail: "围绕已有结构、连续拖动、靠近对象操作和高风险确认设计默认行为。",
          icon: "structure",
        },
        {
          title: "手势分流",
          detail: "第二格后判断 paint / erase / pan，避免连续拖动被误读。",
          icon: "gesture",
        },
        {
          title: "空间规则护栏",
          detail: "新增格子先判断相邻，再判断连通，最后决定允许或提示原因。",
          icon: "guardrail",
        },
        {
          title: "撤销节点",
          detail: "一次连续操作对应一次历史提交，让回退符合人的操作记忆。",
          icon: "history",
        },
      ],
      mechanisms: [
        {
          label: "输入对象",
          detail: "默认户型、房间归属、选中格和相邻格",
          outcome: "让编辑发生在空间对象上",
        },
        {
          label: "判断规则",
          detail: "相邻、连通、清空、覆盖和删除风险",
          outcome: "降低误删和结构破坏",
        },
        {
          label: "反馈方式",
          detail: "工具栏、禁用态、提示原因和二次确认",
          outcome: "把规则限制变成可理解反馈",
        },
      ],
      asset: {
        title: "终版原型主界面",
        name: "画格子",
        src: aiLabImage("画格子"),
        description: "规则型户型编辑原型的可试玩主界面。",
        display: "phone",
      },
      demo: {
        label: "PLAY DEMO",
        src: publicPath("/demos/grid-demo/index.html"),
        title: "画格子 Demo 终版",
        description: "在弹窗中试玩规则型户型编辑原型，验证相邻、连通、对象归属和风险反馈保护。",
      },
      accent: "cyan",
    },
    {
      eyebrow: "Experiment 02",
      title: "AI 自动描述插件：把交互说明从手工整理变成可回写工具",
      value:
        "我把 Frame 输入、规则提示、JSON 解析、编号标注和文档回写串成工具流程，让 AI 输出能进入交付格式。",
      problemTitle: "生产断点",
      problems: [
        "手写交互说明要反复读图、编号、解释状态，容易漏掉局部组件。",
        "直接把界面丢给 AI，模型容易写视觉描述，而不是可交付的交互说明。",
        "聊天结果只是文本，不能和 Figma 里的组件位置建立对应关系。",
        "多 Frame、多状态任务有等待、失败、暂停和继续问题，不能只靠一次请求。",
      ],
      judgment:
        "AI 不能只负责说一段话，它的输出必须被工具规则收束：先限定输入范围，再约束输出格式，再用解析和渲染机制把结果回写为标注文档。",
      mainDiagram: {
        title: "交互说明自动化链路",
        summary: "从选中 Frame 到文档回写，中间用规则提示和结构化解析控制输出。",
        nodes: ["选中 Frame", "导出图像", "规则提示", "AI 识别", "JSON 解析", "编号标注", "交付文档"],
        note: "工具重点不是生成文本，而是让生成内容能回到可交付结构。",
      },
      microTitle: "工具护栏",
      microItems: [
        {
          title: "正则解析漏斗",
          detail: "去除 code fence、匹配 JSON 数组、JSON.parse、字段校验，最后形成可回写数据。",
          icon: "schema",
        },
        {
          title: "字段结构",
          detail: "index / name / desc / x_pct / y_pct 共同确定说明和画布位置。",
          icon: "mapping",
        },
        {
          title: "编号映射",
          detail: "编号水滴、组件位置和说明文档建立一一对应关系。",
          icon: "evidence",
        },
        {
          title: "批量状态机",
          detail: "等待、失败继续、暂停恢复和完成状态让多任务可控。",
          icon: "state",
        },
      ],
      mechanisms: [
        {
          label: "输入约束",
          detail: "只处理选中 Frame，并给出交互说明规则",
          outcome: "减少泛化视觉描述",
        },
        {
          label: "格式约束",
          detail: "要求结构化字段，再经过解析和校验",
          outcome: "让输出能被工具继续使用",
        },
        {
          label: "回写机制",
          detail: "把编号、位置和说明同步到画布与文档",
          outcome: "交付物不再停留在聊天窗口",
        },
      ],
      asset: {
        title: "插件入口与标注样式设置",
        name: "标注插件",
        src: aiLabImage("标注插件"),
        description: "AI 自动描述插件的入口、样式设置和批量说明工作台。",
        display: "phone",
      },
      video: {
        title: "插件演示视频",
        name: "标注插件演示视频",
        src: aiLabVideo("标注插件演示视频"),
        description: "展示从选择界面、触发 AI 说明到生成标注结果的完整运行过程。",
      },
      accent: "purple",
    },
    {
      eyebrow: "Experiment 03",
      title: "交互设计原则 Skill：把交互评审经验组织成可调用方法",
      value:
        "我把审查对象、场景规则、证据等级、严重度和报告模板拆成 Skill 结构，让评审结论能被调用和追溯。",
      problemTitle: "评审失真点",
      problems: [
        "人工或 AI 评审容易凭经验直接下判断，缺少证据链。",
        "没有证据等级时，容易把没看到写成缺失，把待确认项写成确定问题。",
        "Apple、Material、NNGroup、游戏、UGC、AI 异步等规则来源不同，不能用一套话覆盖所有场景。",
        "评审报告如果没有固定结构，很难追溯问题来源、严重度依据和下一步处理。",
      ],
      judgment:
        "Skill 不是规范合集，而是评审流程组织方式：先识别审查对象和场景，再选择规则来源，最后用证据等级和严重度矩阵约束输出。",
      mainDiagram: {
        title: "Skill 方法系统地图",
        summary: "从审查对象到报告输出，每一步都先定义证据和规则边界。",
        nodes: ["审查对象", "场景判断", "规则来源", "证据等级", "严重度", "报告输出"],
        note: "SKILL.md、agents、references、evidence-and-severity 和 report-template 共同构成方法结构。",
      },
      microTitle: "方法模块",
      microItems: [
        {
          title: "规则来源路由",
          detail: "Apple HIG、Material 3、NNGroup、游戏 UI、UGC、SaaS 和 AI 异步生成按场景调用。",
          icon: "rules",
        },
        {
          title: "证据等级矩阵",
          detail: "明确可见、界面+说明、材料不足和待补充对应不同结论强度。",
          icon: "evidence",
        },
        {
          title: "任务风险矩阵",
          detail: "低、中、高风险决定问题优先级和是否升级处理。",
          icon: "guardrail",
        },
        {
          title: "报告输出结构",
          detail: "审查范围、关键结论、评分卡、P0-P3 问题、待确认项和下一步建议。",
          icon: "report",
        },
      ],
      mechanisms: [
        {
          label: "先看对象",
          detail: "确认审查的是页面、流程、组件、游戏 HUD 还是 AI 异步状态",
          outcome: "避免套用错误规则",
        },
        {
          label: "再定证据",
          detail: "区分明确可见、可推断、材料不足和需要追问",
          outcome: "避免把不确定写成确定",
        },
        {
          label: "最后输出",
          detail: "按严重度和报告模板组织问题、证据和建议",
          outcome: "让评审可以复盘",
        },
      ],
      asset: {
        title: "交互设计审查报告输出",
        name: "交互原则SKILL",
        src: aiLabImage("交互原则SKILL"),
        description: "Skill 输出的交互设计审查报告预览，重点展示上半部结构。",
        display: "report",
      },
      accent: "green",
    },
  ],
  closing: {
    eyebrow: "Lab Closure",
    title: "从 AI 使用到 AI 工作流设计",
    value:
      "三个实验共同证明：我不是只让 AI 生成内容，而是在设计流程中定义问题、设置规则、审查边界，并把结果落成可操作产物。",
    chains: [
      {
        title: "复杂交互规则",
        label: "Demo",
        detail: "落成可操作 Demo",
        accent: "cyan",
        icon: "prototype",
      },
      {
        title: "交互说明交付",
        label: "Plugin",
        detail: "落成可运行插件",
        accent: "purple",
        icon: "workflow",
      },
      {
        title: "评审经验标准",
        label: "Skill",
        detail: "落成可调用 Skill",
        accent: "green",
        icon: "skill",
      },
    ],
    sentence: "AI 负责生成与执行，设计判断负责定义规则、验证边界和组织交付。",
  },
};


const habitatProject: Project = {
  slug: "habitat-ai-dialogue",
  shortTitle: "AI 装修对话",
  title: "AI 装修对话",
  category: "AI × 家园创作",
  role: "项目主负责 · 交互设计 / 对话交互 / 空间编辑 / 状态反馈",
  summary: "贴合算法处理框架，设计状态清晰、具有创造乐趣的 AI 装修对话体验。",
  positioning: "轻量任务在当前场景内执行，重型任务通过方向与方案确认组织深入分析和生成。",
  accent: "purple",
  cardStat: "轻量 / 重型",
  cardCaption: "按分析与改动范围组织任务，兼顾状态理解与创造乐趣",
  challenge: "按任务所需的分析与改动范围，组织对象选择、状态反馈和确认时机。",
  response: "轻量任务按对象是否明确决定是否确认；重型任务在进入完整流程前确认方向，形成具体方案后再确认执行。",
  evidenceBoundary: "项目展示交互方案与原型素材，尚无上线效果数据。",
  metrics: [],
  timeline: [
    { label: "DIALOGUE", title: "对话层", description: "按交流、提示与操作用途，统一气泡类型和样式。", accent: "orange" },
    { label: "LIGHT", title: "轻量任务", description: "保留当前对话与场景，按对象是否明确组织执行。", accent: "orange" },
    { label: "HEAVY", title: "重型任务", description: "进入深入分析流程，分开方向确认与方案确认。", accent: "orange" }
  ],
  // Dedicated narrative component uses aiDialogueNarrative.json for the complete source content.
  sections: [],
  placeholders: [],
};

export const projects: Project[] = [
  {
    slug: "mars-era",
    shortTitle: "火星纪元",
    title: "火星纪元",
    category: "SLG · 轻量 PVP 活动",
    role: "项目总负责 / 交互设计主导",
    summary: "面向不同 PVP 参与意愿的玩家，设计低战损成本的对战活动。",
    positioning: "通过链路简化、目标明确与阶梯式反馈，组织轻量 PVP 体验。",
    accent: "orange" as Accent,
    cardStat: "2.66 倍",
    cardCaption: "同周完成至少一个目标并领奖：18.46%，最高参考值 6.94%",
    challenge: "非重度 PVP 用户希望以较低成本尝试对战、提升战力；重度 PVP 用户需要更丰富的对抗机会与进攻方式。",
    response: "省去前置报名和排期，同步战斗对象与操作状态，分层呈现战斗结果和后续行动。",
    evidenceBoundary: "上线数据反映整体活动参与和关键行为，不单独证明某个界面设计的效果。",
    metrics: [
      { value: "2.66 倍", label: "同周活动参与率对比", detail: "18.46% / 6.94%；人数 2,736 / 1,028，同一目标人群 14,822 人", accent: "orange" },
      { value: "89.96%", label: "进攻人数 / 进入战场人数", detail: "5,781 / 6,426；事件去重人数比，非已核验的同批用户顺序转化", accent: "purple" },
      { value: "24.75%", label: "休闲-社交组进攻参与率", detail: "294 / 1,188；原表行为分组不等同于 PVP 意愿", accent: "cyan" },
    ],
    timeline: [
      { label: "STRATEGY 01", title: "链路简化", description: "省去前置报名和排期，将主要决策集中到实战环节。", accent: "purple" },
      { label: "STRATEGY 02", title: "目标明确", description: "依据目标锁定和战斗进展，同步场景表现、操作入口与限制说明。", accent: "orange" },
      { label: "STRATEGY 03", title: "阶梯式反馈", description: "区分胜负与目标反馈，衔接复仇与局内成长。", accent: "cyan" },
    ],
    sections: [],
    placeholders: [],
    coverEvidence: {
      name: "战场完整交互设计稿",
      src: publicPath("/media/mars-era/完整界面图.png"),
      type: "full",
      description: "火星纪元完整战场 · 交互设计稿，非最终上线截图",
      purpose: "中央呈现战场对象，底部集中目标、资源与操作入口。",
    },
  },
  habitatProject,
  {
    slug: "ai-commission", shortTitle: "AI 委托", title: "AI 委托玩法",
    category: "AI × 装修游戏", role: "项目主负责 · 交互设计", accent: "orange",
    summary: "从了解委托者到完成房间设计，通过交互衔接两个阶段的目标、操作与奖励。",
    positioning: "AI 扮演提出需求的委托者，装修方案由玩家决定。",
    cardStat: "探索 → 设计", cardCaption: "对话探索 / 阶段衔接 / 游戏反馈",
    challenge: "让对话中发现的信息成为后续设计的依据。",
    response: "用偏好记录和奖励关系连接交流与装修，并在操作位置反馈进展。",
    evidenceBoundary: "界面与动效为设计示例，不代表上线指标或产品录屏。",
    metrics: [], timeline: [], sections: [], placeholders: [],
  },
  {
    slug: "ava-league", shortTitle: "AVA 联赛", title: "AVA 联赛",
    category: "SLG · 活动行为分析", role: "项目主负责 · 交互设计", accent: "orange",
    summary: "分析规则与奖励页、活动主界面的操作记录，分别确定内容访问路径与功能展示优先级。",
    positioning: "规则与奖励查询用于调整入口结构；主界面分层数据用于提炼任务、商店与排名的设计原则。",
    cardStat: "行为 → 决策", cardCaption: "两组分析 / 访问路径 / 界面原则",
    challenge: "区分内容查询与功能访问，避免把不同口径的行为记录混为结论。",
    response: "分别梳理入口关系与付费分层频次，形成界面方案建议。",
    evidenceBoundary: "现有资料包含行为分析与界面方案，未保留方案上线后的效果测量。",
    metrics: [], timeline: [], sections: [], placeholders: [],
  },
  {
    slug: "ai-design-lab",
    shortTitle: "AI Design Lab",
    title: "AI Design Lab",
    category: "AI Coding / AI 工具 / 方法 Skill 实验室",
    role: "AI 原型验证 / 工具机制 / 方法沉淀",
    summary:
      "把 AI 用在交互设计流程中的三个位置：可操作原型、结构化交付工具、可追溯评审方法。",
    positioning:
      "方法与原型实验室项目，证明 AI 协作不是结果包装，而是设计判断、工具边界和规则沉淀。",
    accent: "cyan" as Accent,
    cardStat: "3 个子实验",
    cardCaption: "画格子 Demo、AI 自动描述插件、交互设计原则 Skill",
    challenge:
      "AI 可以快速生成原型、说明和报告，但如果没有规则、证据和边界审查，产物容易跑偏。",
    response:
      "分别通过空间编辑规则、AI 输出护栏和证据-严重度决策，把 AI 协作固定到可解释、可复盘的工作流里。",
    evidenceBoundary:
      "这些是 Lab 实验与本地验证，不包装成上线项目，不写未提供的结果指标。",
    metrics: [],
    timeline: [
      {
        label: "DEMO",
        title: "AI Coding 原型",
        description: "用设计判断审查 AI 生成代码的规则边界。",
        accent: "cyan",
      },
      {
        label: "PLUGIN",
        title: "AI 交付工具",
        description: "把 Frame 转成结构化交互说明和编号标注。",
        accent: "purple",
      },
      {
        label: "SKILL",
        title: "方法沉淀",
        description: "把交互评审从经验判断变成可追溯流程。",
        accent: "green",
      },
    ],
    sections: [],
    placeholders: [],
    labPage: aiLabPage,
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug);

