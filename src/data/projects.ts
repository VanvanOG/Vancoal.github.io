import type {
  Accent,
  Project,
  ProjectDataVisual,
  ProjectEvidenceGroup,
  ProjectEvidenceItem,
  ProjectLabPage,
} from "../types";
import { publicPath } from "../utils/publicPath";

const marsImage = (name: string) => publicPath(`/media/mars-era/${encodeURIComponent(`${name}.png`)}`);

const marsEvidence = (
  name: string,
  type: ProjectEvidenceItem["type"],
  description: string,
  purpose: string,
  display?: ProjectEvidenceItem["display"],
): ProjectEvidenceItem => ({
  name,
  src: marsImage(name),
  type,
  display,
  description,
  purpose,
});

const marsGroup = (
  title: string,
  summary: string,
  items: ProjectEvidenceItem[],
  variant?: ProjectEvidenceGroup["variant"],
): ProjectEvidenceGroup => ({ title, summary, items, variant });

const habitatAsset = (name: string, extension = "png") =>
  publicPath(`/media/habitat-ai-dialogue/${encodeURIComponent(`${name}.${extension}`)}`);

const habitatEvidence = (
  name: string,
  type: ProjectEvidenceItem["type"],
  description: string,
  purpose: string,
  display?: ProjectEvidenceItem["display"],
  media: ProjectEvidenceItem["media"] = "image",
): ProjectEvidenceItem => ({
  name,
  src: habitatAsset(name, media === "video" ? "mp4" : "png"),
  type,
  display,
  media,
  description,
  purpose,
});

const habitatGroup = (
  title: string,
  summary: string,
  items: ProjectEvidenceItem[],
  variant?: ProjectEvidenceGroup["variant"],
): ProjectEvidenceGroup => ({ title, summary, items, variant });

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

const marsCoverEvidence = marsEvidence(
  "完整界面图",
  "wide",
  "主战场完整界面，能看到战场空间、操作区和活动整体视觉。",
  "建立项目真实产品感，证明这是完整上线活动系统。",
);

const marsEntryPrimaryEvidence = marsGroup("首次进入主路径", "进入战场后先解释驻防，再完成一键上阵和保存编队，降低第一次行动的心理压力。", [
  marsEvidence("上阵引导1", "full", "首次进入战场后的对话引导，包含战场和驻防提示。", "证明首次进入先解释行动，不直接压迫攻击。"),
  marsEvidence("上阵引导2", "full", "驻守部队、一键上阵、保存编队界面。", "证明低风险准备动作被设计进主路径。"),
], "comparison");

const marsEntryTargetEvidence = marsGroup("目标确认前后浮层", "点击目标后先看信息，再把目标确认成可执行对象，浮层按钮随状态变化。", [
  marsEvidence("基地浮层-默认状态", "small", "点击敌方基地后的默认信息浮层。", "证明目标判断发生在攻击前。"),
  marsEvidence("基地浮层-已被设为目标状态", "small", "目标已确认后的浮层状态。", "证明目标确认后操作语义发生变化。"),
], "comparison");

const marsLootEvidence = marsGroup("击败后的二次掠夺引导", "胜利反馈承接二次掠夺，让玩家知道击败目标后还需要继续拿资源。", [
  marsEvidence("战斗胜利-掠夺引导", "full", "战斗胜利弹窗，包含继续掠夺的下一步行动引导。", "证明击败后用强反馈承接下一步。"),
  marsEvidence("基地浮层-一键掠夺状态", "small", "敌方基地进入可掠夺后的浮层状态。", "证明击败、可掠夺、再次操作之间的收益链。"),
], "feature");

const marsProtectionEvidence = marsGroup("失败与不可攻击保护", "失败补偿和不可攻击提示把风险、限制原因说清楚，减少无效点击。", [
  marsEvidence("战斗失败-补偿奖励", "full", "战斗失败后的补偿奖励弹窗。", "证明低成本尝试中存在失败保护。", "device"),
  marsEvidence("基地浮层-当前不可攻击", "small", "不可攻击目标的浮层提示。", "证明异常或限制状态有明确反馈。", "panel"),
  marsEvidence("基地状态-当前不可攻击", "small", "不可攻击目标的对象状态。", "证明不可操作不是按钮无响应，而是对象状态变化。", "panel"),
], "feature");

const marsRevengeEvidence = marsGroup("复仇入口与路径引导", "复仇列表提供目标来源，后续引导把动机接到战场执行。", [
  marsEvidence("复仇界面", "full", "复仇列表界面，展示可反击目标与复仇入口。", "证明高 PVP 玩家有持续对抗目标。", "device"),
  marsEvidence("复仇-指引1", "full", "复仇功能的对话或引导界面。", "证明复仇动机被主动提示。", "device"),
  marsEvidence("复仇-指引2", "full", "复仇进入战场后的引导状态。", "证明复仇行为能进入战场执行。", "device"),
], "feature");

const marsAttackStateEvidence = marsGroup("攻击状态变化", "攻击过程需要连续反馈：锁定、受击、击倒和收益变化让结果可见。", [
  marsEvidence("基地状态-瞄准", "small", "目标被瞄准或攻击锁定状态。", "证明攻击前目标反馈明确。"),
  marsEvidence("基地状态-受击", "small", "基地受击状态。", "证明进攻过程有即时反馈。"),
  marsEvidence("基地状态-击倒", "small", "基地被击倒状态。", "证明攻击结果被对象状态承接。"),
  marsEvidence("奖励栏-积分增加", "small", "奖励栏积分增加状态。", "证明对抗行为产生即时收益反馈。"),
], "state-strip");

const marsSkillCrystalEvidence = marsGroup("技能与水晶成长", "局内技能是成长入口，水晶强化和突破把战斗收益转成能力推进。", [
  marsEvidence("局内技能界面", "full", "局内技能选择与学习界面。", "证明活动中有战斗能力成长系统。", "device-large"),
  marsEvidence("水晶养成-强化", "full", "水晶强化界面，展示资源投入和强化动作。", "证明战斗收益可转为成长。", "device"),
  marsEvidence("水晶养成-突破", "full", "水晶突破界面，展示突破条件和成长节点。", "证明成长存在阶段推进。", "device"),
  marsEvidence("水晶养成-突破成功弹窗", "full", "水晶突破成功反馈弹窗。", "证明成长结果有明确反馈。", "device"),
], "feature");

const marsGoalEvidence = marsGroup("GOAL 与成就奖励", "GOAL 与成就把阶段目标和长期奖励放在同一奖励体系里。", [
  marsEvidence("奖励界面-GOALTAB", "full", "奖励界面的 GOAL 页签。", "证明目标奖励体系存在。"),
  marsEvidence("奖励界面-成就TAB", "full", "奖励界面的成就页签。", "证明成就奖励与 GOAL 形成补充。"),
], "comparison");

const marsRewardBarEvidence = marsGroup("奖励栏状态条", "奖励栏承担即时目标反馈，从默认态到可领取再到全部完成。", [
  marsEvidence("奖励栏默认状态", "wide", "奖励栏默认状态。", "作为奖励状态组基准态。"),
  marsEvidence("奖励栏-当前目标完成", "wide", "当前目标完成的奖励栏状态。", "证明阶段目标完成反馈。"),
  marsEvidence("奖励栏-有可领取奖励", "wide", "奖励栏出现可领取奖励提示。", "证明奖励领取入口被显性化。"),
  marsEvidence("奖励栏-全部目标完成", "wide", "全部目标完成后的奖励栏状态。", "证明目标链路可收束。"),
], "state-strip");

const marsSelfBaseMatrix = marsGroup("本人基地状态组", "本人基地也需要对象状态，玩家能看见自身基地是否已被摧毁。", [
  marsEvidence("本人基地状态-默认", "small", "玩家自己基地默认状态。", "证明本人对象也有独立状态。"),
  marsEvidence("本人基地状态-被摧毁", "small", "玩家自己基地被摧毁后的状态。", "证明自身受击结果被明确展示。"),
], "matrix");

const marsEnemyBaseMatrix = marsGroup("敌方基地对象状态组", "敌方基地从默认、锁定到受击和击倒都有独立反馈，避免玩家误判当前对象。", [
  marsEvidence("基地状态-默认", "small", "敌方基地默认状态。", "作为敌方基地状态组基准态。"),
  marsEvidence("基地状态-设为目标", "small", "敌方基地被设为目标后的对象状态。", "证明目标确认可被对象层承接。"),
  marsEvidence("基地状态-瞄准", "small", "敌方基地处于瞄准或锁定攻击状态。", "证明攻击前目标反馈明确。"),
  marsEvidence("基地状态-受击", "small", "敌方基地正在受到攻击的表现。", "证明进攻过程有即时反馈。"),
  marsEvidence("基地状态-击倒", "small", "敌方基地被击倒或战败后的状态。", "证明攻击结果被对象状态承接。"),
  marsEvidence("基地状态-当前不可攻击", "small", "不可攻击目标的对象状态。", "证明不可操作有对象状态表达。"),
], "matrix");

const marsFloatingLayerMatrix = marsGroup("敌方基地浮层状态组", "同一个目标在判断、确认、可掠夺和不可攻击时，需要显示不同操作入口。", [
  marsEvidence("基地浮层-默认状态", "full", "点击敌方基地后的默认信息浮层。", "证明攻击前先进行目标判断。"),
  marsEvidence("基地浮层-已被设为目标状态", "small", "目标已确认后的浮层状态。", "证明目标确认后操作入口变化。"),
  marsEvidence("基地浮层-一键掠夺状态", "small", "可掠夺目标的一键掠夺浮层。", "证明击败后目标进入可操作收益状态。"),
  marsEvidence("基地浮层-当前不可攻击", "small", "不可攻击目标的浮层提示。", "证明限制原因被显性化。"),
], "matrix");

const marsResourceMatrix = marsGroup("资源地状态组", "资源对象用轻量状态展示默认、采集中和刷新等待，作为战场非玩家目标的补充反馈。", [
  marsEvidence("资源地-默认状态", "small", "资源地默认可见状态。", "证明战场中非玩家资源对象独立存在。"),
  marsEvidence("资源地-采集中", "small", "资源地采集中状态，带采集标识。", "证明采集对象有过程状态。"),
  marsEvidence("资源地-刷新中", "small", "资源地刷新倒计时状态。", "证明资源对象有不可用与等待反馈。"),
], "matrix");

const marsMonsterMatrix = marsGroup("怪物状态组", "怪物目标同样需要默认、受击和刷新等待反馈，支撑 solo 目标的战斗循环。", [
  marsEvidence("怪物-默认", "small", "怪物默认状态。", "证明非玩家战斗对象存在。"),
  marsEvidence("怪物-被攻击", "small", "怪物被攻击或受击状态。", "证明 solo 目标有战斗反馈。"),
  marsEvidence("怪物-刷新中", "small", "怪物刷新倒计时状态。", "证明怪物对象有刷新与不可用状态。"),
], "matrix");

const marsDataVisuals: ProjectDataVisual[] = [
  {
    title: "同类 PVP 活动参与人数对比",
    chartType: "bars",
    summary:
      "同一 S1-S48 目标用户口径下，火星纪元完成至少一个 goal 并领奖人数为 2,736，同类 PVP 活动为 502。",
    items: [
      { label: "火星纪元", value: "2,736", detail: "参与率 18.46%" },
      { label: "AVA", value: "1,028", detail: "同类活动对比样本" },
      { label: "军团战", value: "873", detail: "同类活动对比样本" },
      { label: "同类 PVP 活动", value: "502", detail: "参与率 3.39%" },
      { label: "袭击精矿石", value: "387", detail: "同类活动对比样本" },
      { label: "擂台赛", value: "244", detail: "同类活动对比样本" },
    ],
    note: "约 5.5 倍只表示 2,736 / 502；火星纪元高出同类 PVP 活动 15.07 个百分点，约为所选非 KVK 同类活动均值 607 的 4.5 倍。",
  },
  {
    title: "对战转化漏斗",
    chartType: "funnel",
    summary:
      "在 23,869 名近活目标玩家中，5,781 人发起至少一次进攻；进入战场后进攻转化为 89.96%。",
    items: [
      { label: "目标玩家", value: "23,869", detail: "S1-S72 近活目标玩家" },
      { label: "入口跳转去重", value: "10,820", detail: "进入活动入口路径" },
      { label: "进入战场", value: "6,426", detail: "进入活动战场" },
      { label: "保存队伍", value: "6,353", detail: "6,353 / 6,426 = 98.86%" },
      { label: "锁定对手", value: "6,040", detail: "6,040 / 6,426 = 93.99%" },
      { label: "发起进攻", value: "5,781", detail: "5,781 / 6,426 = 89.96%" },
    ],
    note: "24.22% = 5,781 / 23,869，是整体 PVP 行动参与率；不要脱离分母单独使用。",
  },
  {
    title: "玩家类型参与率对比",
    chartType: "comparison",
    summary:
      "高 PVP 倾向人群被活动承接，低 PVP 意愿但有社交动机的玩家也发生了 PVP 尝试。",
    items: [
      { label: "硬核-社交", value: "48.63%", detail: "4,697 / 9,659 发起至少一次进攻" },
      { label: "休闲-社交", value: "24.75%", detail: "294 / 1,188 发起至少一次进攻" },
      { label: "硬核-单机", value: "6.14%", detail: "602 / 9,800 发起至少一次进攻" },
      { label: "休闲-单机", value: "5.83%", detail: "188 / 3,222 发起至少一次进攻" },
    ],
    note: "该数据支持分层行为差异，不能写成所有休闲玩家都被转化。",
  },
  {
    title: "目标完成度分位",
    chartType: "steps",
    summary:
      "当前表中最高 Goal 似乎为 6，q30 到 q100 均达到 6，说明参与后的目标推进较深。",
    items: [
      { label: "q10", value: "1", detail: "低分位目标进度" },
      { label: "q20", value: "5", detail: "接近最高 Goal" },
      { label: "q30", value: "6", detail: "达到当前最高 Goal" },
      { label: "q40", value: "6", detail: "达到当前最高 Goal" },
      { label: "q50", value: "6", detail: "达到当前最高 Goal" },
      { label: "q60-q100", value: "6", detail: "均达到当前最高 Goal" },
    ],
    note: "如果统计母体确认为参与玩家，可估计约 70% 参与玩家达到最高 Goal=6；母体确认前不作为封面主数据。",
  },
];

const habitatProject: Project = {
  slug: "habitat-ai-dialogue",
  shortTitle: "生境 AI 对话模式",
  title: "让装修从手动编辑进入 AI 任务流",
  category: "类 Agent 家装对话体验设计",
  role: "产品体验设计主导 / AI 对话任务流 / 状态与对象机制",
  summary:
    "把玩家模糊的装修想法，翻译成可表达、可追踪、可确认、可收尾的 AI 装修任务链。",
  positioning:
    "AI 设计不是普通聊天框，而是把装修表达、AI 执行、空间对象、商业感知和结果处置组织成一条可执行任务流。",
  accent: "purple" as Accent,
  cardStat: "5 层机制",
  cardCaption: "输入、状态、对象、商业、结果共同构成 AI 装修任务链",
  challenge:
    "玩家知道想改造空间，但系统需要同时接住模糊表达、AI 等待、对象指向和付费感知；如果只补一个聊天框，需求依然无法稳定落到可执行操作。",
  response:
    "把聊天入口拆成五层机制：先降低输入门槛，再让 AI 状态可读，把自然语言落到具体家具和空间对象，同时用集中清单处理商业信息，最后提供继续修改、保存和退出保护。",
  evidenceBoundary:
    "本项目暂无结果数据，因此不写效率、留存、转化、付费提升或用户偏好提升；页面只证明机制完整度、状态组织、对象确认和商业提示取舍。",
  metrics: [
    {
      value: "输入层",
      label: "承接模糊表达",
      detail: "文字、图片、推荐气泡和一键补全覆盖不同表达能力",
      accent: "purple",
    },
    {
      value: "状态层",
      label: "解释 AI 等待",
      detail: "思考中、排队中、设计中、思考结束拆解黑箱过程",
      accent: "orange",
    },
    {
      value: "对象层",
      label: "控制空间风险",
      detail: "移动、删除、摆装饰前先确认家具对象和落点范围",
      accent: "cyan",
    },
  ],
  timeline: [
    {
      label: "INPUT",
      title: "输入承接",
      description: "用低门槛入口覆盖推荐、图片、按钮和自然语言表达。",
      accent: "purple",
    },
    {
      label: "STATE",
      title: "状态反馈",
      description: "把 AI 等待过程拆成用户能读懂的阶段反馈。",
      accent: "orange",
    },
    {
      label: "OBJECT",
      title: "对象确认",
      description: "让自然语言先落到具体家具、空间和操作目标。",
      accent: "cyan",
    },
    {
      label: "COMMERCE",
      title: "商业感知",
      description: "收费家具被集中感知，但不打断装修观看和生成体验。",
      accent: "green",
    },
    {
      label: "CLOSURE",
      title: "结果闭环",
      description: "生成后可继续修改、保存、退出和管理长对话。",
      accent: "purple",
    },
  ],
  sections: [
    {
      eyebrow: "Diagnosis",
      title: "核心矛盾：玩家有想法，系统接不住",
      body:
        "装修需求不是一句话输入就能解决。系统必须同时接住表达、执行、对象和商业四个断点，否则 AI 对话只会停留在聊天框层面。",
      bullets: [
        "表达断点：玩家知道想改，但不知道如何描述装修需求。",
        "执行断点：AI 工作过程不可见，用户不知道是否正在执行。",
        "对象断点：移动、删除、摆放都可能指向不清。",
        "商业断点：收费家具需要被感知，但不能破坏沉浸。",
      ],
      diagramTitle: "想法进入系统的四个断点",
      diagramItems: [
        { label: "表达", detail: "从模糊想法到可输入需求" },
        { label: "执行", detail: "从黑箱等待到阶段反馈" },
        { label: "对象", detail: "从自然语言到具体家具和空间" },
        { label: "商业", detail: "从隐藏成本到集中感知" },
      ],
    },
    {
      eyebrow: "Strategy",
      title: "总体策略：把想法翻译成可执行任务链",
      body:
        "设计判断不是增加更多入口，而是把断点翻译成输入层、状态层、对象层、商业层和结果层，让 AI 装修任务能被理解、确认和继续操作。",
      bullets: [
        "输入层回答“我怎么开始说”。",
        "状态层回答“AI 现在在做什么”。",
        "对象层回答“这句话到底作用到哪个家具”。",
        "商业层和结果层回答“成本如何被看见、结果如何被保留”。",
      ],
      diagramTitle: "断点到任务链的翻译器",
      diagramItems: [
        { label: "表达断点", detail: "文字 / 图片 / 推荐气泡 / 快捷按钮" },
        { label: "等待断点", detail: "思考中 / 排队中 / 设计中 / 结束" },
        { label: "对象断点", detail: "选择家具 / 移动 / 删除 / 摆装饰" },
        { label: "收尾断点", detail: "保存 / 退出保护 / 继续修改" },
      ],
      evidenceGroups: [
        habitatGroup("任务链主界面", "AI 对话入口、空间画面和任务进度同时出现，装修意图已经进入可执行流程。", [
          habitatEvidence(
            "基础界面",
            "full",
            "AI 对话模式基础界面，包含空间画面和对话入口。",
            "证明任务链不是抽象概念，而是已经落到可浏览、可输入、可执行的界面。",
            "phone-large",
          ),
        ]),
        habitatGroup(
          "输入到执行过渡",
          "文字和图片输入都能进入设计中状态，需求从表达入口过渡到 AI 执行。",
          [
            habitatEvidence("文字气泡", "full", "玩家用文字发起装修需求的界面。", "证明自然语言输入入口成立。", "phone"),
            habitatEvidence("图片气泡", "full", "玩家用图片作为参考输入的界面。", "证明图片输入可以补足文字描述压力。", "phone"),
            habitatEvidence("设计中界面表现", "full", "AI 正在设计中的完整界面表现。", "证明输入可以进入明确的执行状态。", "phone"),
          ],
          "state-strip",
        ),
      ],
    },
    {
      eyebrow: "Input Layer",
      title: "策略一：用低门槛入口承接模糊表达",
      body:
        "不要要求玩家一开始就会写装修需求，而是提供从推荐、按钮、图片到自然语言的输入梯度。",
      bullets: [
        "推荐气泡和一键补全降低启动成本。",
        "图片输入降低文字描述压力。",
        "自然语言保留完整表达空间。",
      ],
      diagramTitle: "输入梯度",
      diagramItems: [
        { label: "低启动成本", detail: "推荐气泡 / 一键补全" },
        { label: "高信息量", detail: "图片参考" },
        { label: "高自由度", detail: "自然语言描述" },
      ],
      evidenceGroups: [
        habitatGroup(
          "气泡承接状态",
          "从文字承接到家具选择确认，证明模糊表达可以被转成明确选项。",
          [
            habitatEvidence("AI气泡-文字气泡", "wide", "AI 气泡承接文字内容。", "证明文字输入被对话系统接住。", "state"),
            habitatEvidence("AI气泡-选择家具", "wide", "AI 引导或展示选择家具的气泡状态。", "证明推荐气泡能把需求转成选项。", "state"),
            habitatEvidence("AI气泡-已选择家具", "small", "家具已选择后的气泡状态。", "证明输入后的确认反馈存在。", "state"),
          ],
          "state-strip",
        ),
        habitatGroup("图片输入补充", "图片作为补充输入，降低用户把风格和空间关系完全写成文字的压力。", [
          habitatEvidence("图片气泡", "full", "玩家上传图片作为参考的界面。", "证明多模态输入能够补足文字表达。", "phone"),
        ]),
        habitatGroup(
          "一键补全任务链",
          "一键补全把空白输入前的犹豫转成连续可执行的快捷任务。",
          [
            habitatEvidence("一键补全1", "full", "快捷任务入口出现。", "证明快捷入口降低空白输入压力。", "phone"),
            habitatEvidence("一键补全2", "full", "系统开始承接补全需求。", "快捷任务从点击进入可执行状态。", "phone"),
            habitatEvidence("一键补全3", "full", "补全任务继续推进。", "证明系统能持续承接任务过程。", "phone"),
            habitatEvidence("一键补全4", "full", "补全过程出现状态变化。", "让用户知道任务仍在推进。", "phone"),
            habitatEvidence("一键补全5", "full", "补全任务进入结果反馈。", "证明快捷任务可以闭合到生成结果。", "phone"),
          ],
          "state-strip",
        ),
      ],
    },
    {
      eyebrow: "Execution Layer",
      title: "策略二：用阶段反馈降低 AI 等待不确定",
      body:
        "AI 不是黑箱等待，界面需要回答“开始了吗、为什么还没动、现在在做什么、什么时候结束”。",
      bullets: [
        "状态语义把等待拆成可解释阶段。",
        "动态执行证据用于证明生成过程不是纯静态提示。",
      ],
      diagramTitle: "AI 状态语义地图",
      diagramItems: [
        { label: "思考中", detail: "确认任务已经开始" },
        { label: "排队中", detail: "解释等待原因" },
        { label: "设计中", detail: "展示执行阶段" },
        { label: "结束", detail: "给出阶段结束反馈" },
      ],
      evidenceGroups: [
        habitatGroup("AI 执行主状态", "AI 工作时，界面同步给出进度和任务状态，避免用户把等待理解为空转。", [
          habitatEvidence("设计中界面表现", "full", "AI 正在设计中的完整界面状态。", "证明任务执行过程有界面反馈。", "phone-large"),
        ]),
        habitatGroup(
          "AI 状态语义",
          "四个气泡状态对应收到需求、等待原因、正在执行和阶段结束。",
          [
            habitatEvidence("AI气泡-思考中", "small", "AI 正在思考的气泡状态。", "确认任务开始。", "state"),
            habitatEvidence("AI气泡-排队中", "wide", "AI 任务排队中的气泡状态。", "解释等待原因。", "state"),
            habitatEvidence("AI气泡-设计中", "wide", "AI 正在设计的气泡状态。", "说明 AI 正在执行装修任务。", "state"),
            habitatEvidence("AI气泡-思结束", "wide", "AI 思考结束的气泡状态。", "给出阶段结束反馈。", "state"),
          ],
          "state-strip",
        ),
        habitatGroup("生成家具的动态过程", "生成过程让“设计中”从提示语变成可感知的执行行为。", [
          habitatEvidence(
            "原子动作视频-设计中，生成家具",
            "full",
            "AI 设计中生成家具的动态过程。",
            "证明生成过程有原子动作表现，而不是只有静态 loading。",
            "video",
            "video",
          ),
        ]),
      ],
    },
    {
      eyebrow: "Object Layer",
      title: "策略三：用对象确认控制空间操作风险",
      body:
        "空间改造不能只听懂一句话，还要先确认对象，再执行移动、删除和摆放。",
      bullets: [
        "移动和摆放属于中风险动作，需要先限定目标对象。",
        "删除属于高风险动作，需要更明确的对象确认。",
        "多家具、多台面、多装饰场景需要先限定范围和落点。",
      ],
      diagramTitle: "对象风险矩阵",
      diagramItems: [
        { label: "低风险", detail: "推荐 / 查看 / 选择" },
        { label: "中风险", detail: "移动 / 摆放，需要目标确认" },
        { label: "高风险", detail: "删除 / 替换，需要明确确认" },
        { label: "复杂风险", detail: "多家具 / 多台面，需要限定范围" },
      ],
      evidenceGroups: [
        habitatGroup(
          "移动 / 删除风险对照",
          "同样是空间操作，移动和删除的风险不同，但都需要先确认对象。",
          [
            habitatEvidence("界面-多家具移动选择", "full", "多家具移动时的选择界面。", "证明移动前先确认对象。", "phone"),
            habitatEvidence("界面-多家具删除", "full", "多家具删除时的选择界面。", "证明高风险动作需要对象确认。", "phone"),
          ],
          "comparison",
        ),
        habitatGroup(
          "装饰落点确认",
          "从选择家具到限定台面落点，证明复杂空间操作需要逐层收窄目标。",
          [
            habitatEvidence("界面-多家具摆装饰选择", "full", "多家具摆装饰时的对象选择界面。", "证明装饰需求也需要对象落点。", "phone"),
            habitatEvidence("界面-多家具摆装饰-台面选择", "full", "摆装饰时选择台面的界面。", "证明复杂操作需要限定目标范围。", "phone"),
          ],
          "comparison",
        ),
      ],
    },
    {
      eyebrow: "Commerce Layer",
      title: "策略四：用弱标识平衡付费透明和沉浸",
      body:
        "收费家具需要被玩家看见，但提示强度不能抢走装修观看和 AI 生成体验；适合把成本感知后置到清单确认，而不是在生成过程中强打断。",
      bullets: [
        "隐藏成本会让购买前的成本感知突兀。",
        "轻量提示适合在浏览中保持可见，但不应抢占装修内容。",
        "试装清单适合集中感知成本，不打断生成过程。",
      ],
      diagramTitle: "商业提示强度光谱",
      diagramItems: [
        { label: "隐藏成本", detail: "沉浸，但成本后置突兀" },
        { label: "弱标识", detail: "推荐方向，轻量可见" },
        { label: "清单汇总", detail: "集中确认成本" },
        { label: "强弹窗", detail: "信息明确但打断沉浸" },
      ],
      evidenceGroups: [
        habitatGroup("集中成本感知", "试装清单把成本、选择和确认集中到一个低打断环节。", [
          habitatEvidence("试装清单界面", "full", "试装清单界面，集中展示已试装或待购买家具。", "证明商业信息可以集中感知，不必打断生成过程。", "phone-large"),
        ]),
      ],
    },
    {
      eyebrow: "Result Closure",
      title: "结果闭环：让生成方案可继续、可保存、可退出",
      body:
        "AI 生成不是终点。结果需要支持继续修改、保留对话、确认保存和退出保护，避免任务链在结果页突然中断。",
      bullets: [
        "图片重新设计让结果可以继续被追问和修改。",
        "保存前确认和保存后反馈保护结果。",
        "退出和对话展示管理控制长任务带来的页面负担。",
      ],
      diagramTitle: "结果处置分叉地图",
      diagramItems: [
        { label: "继续修改", detail: "围绕图片重新设计继续追问" },
        { label: "保存方案", detail: "二次确认后保留结果" },
        { label: "退出保护", detail: "离开前提示保留对话" },
        { label: "状态管理", detail: "对话收起和展示上限" },
      ],
      evidenceGroups: [
        habitatGroup(
          "图片重设计连续修改",
          "图片重设计让用户在结果之后继续追问、比较和微调。",
          [
            habitatEvidence("图片重新设计-1", "full", "重新设计入口被保留。", "证明生成后可继续围绕图片修改。", "phone"),
            habitatEvidence("图片重新设计-2", "full", "修改需求继续进入对话。", "结果不是一次性输出，而是可继续追问。", "phone"),
            habitatEvidence("图片重新设计-3", "full", "系统承接新的修改方向。", "证明结果可以被连续追问。", "phone"),
            habitatEvidence("图片重新设计-4", "full", "任务进入新的调整阶段。", "让用户看到修改过程正在推进。", "phone"),
            habitatEvidence("图片重新设计-5", "full", "修改结果逐步形成。", "证明生成结果可以被二次塑造。", "phone"),
            habitatEvidence("图片重新设计-6", "full", "结果继续向新目标推进。", "展示连续修改中的状态反馈。", "phone"),
            habitatEvidence("图片重新设计-7", "full", "图片修改链路收束。", "证明图片输入可以进入完整结果链。", "phone"),
          ],
          "state-strip",
        ),
        habitatGroup(
          "保存保护",
          "保存前后的确认反馈让结果处置有明确闭环。",
          [
            habitatEvidence("二次确认保存", "small", "保存前二次确认弹窗。", "证明保存行为有确认保护。", "panel"),
            habitatEvidence("保存成功", "full", "保存成功后的完整界面。", "证明生成方案能被保留。", "phone"),
          ],
          "comparison",
        ),
        habitatGroup("退出保护", "退出前给出保留对话确认，避免用户误丢任务上下文。", [
          habitatEvidence("保留对话退出", "small", "退出前保留对话的确认弹窗。", "证明离开流程前保护对话结果。", "panel"),
        ]),
        habitatGroup(
          "对话展示管理",
          "对话收起和展示上限共同控制长对话对结果观看空间的挤占。",
          [
            habitatEvidence("界面-对话收起状态", "full", "对话面板收起后的界面状态。", "证明结果页可以降低对话占屏。", "phone"),
            habitatEvidence("界面-对话展示上限", "full", "对话展示达到上限的界面状态。", "证明长对话有展示边界管理。", "phone"),
          ],
          "comparison",
        ),
      ],
    },
  ],
  placeholders: [],
};

export const projects: Project[] = [
  {
    slug: "mars-era",
    shortTitle: "火星纪元",
    title: "火星纪元之战",
    category: "轻量型 SLG PVP 活动体验系统设计",
    role: "项目总负责 / 全项目主导",
    summary:
      "我主导设计了一个轻量型 SLG PVP 活动系统，将高成本 PVP 拆解为可引导、可理解、可循环的活动体验，同时服务高 PVP 热情玩家和低 PVP 意愿玩家。",
    positioning:
      "真实上线数据验证的商业化活动系统设计，重点证明参与门槛、行动路径、状态反馈和持续动机的系统组织能力。",
    accent: "orange" as Accent,
    cardStat: "约 5.5 倍",
    cardCaption: "同一 S1-S48 目标用户口径下，对比同类 PVP 活动的参与人数",
    challenge:
      "SLG PVP 行为天然具有高成本。玩家需要判断目标、承担战损、理解规则，并在不确定收益下做攻击决策。",
    response:
      "火星纪元不是增加战斗复杂度，而是把 PVP 行为拆成更容易进入、更容易理解、更容易持续行动的活动系统。",
    evidenceBoundary:
      "上线数据证明活动系统整体有效，但不能把整体结果绝对归因到单个 UI、按钮或弹窗。",
    metrics: [
      {
        value: "约 5.5 倍",
        label: "对比同类 PVP 活动的参与人数",
        detail: "2,736 / 502，同一 S1-S48 目标用户口径",
        accent: "orange",
      },
      {
        value: "89.96%",
        label: "进入战场后进攻转化",
        detail: "5,781 / 6,426，进入战场玩家中发起至少一次进攻",
        accent: "purple",
      },
      {
        value: "24.75%",
        label: "休闲-社交玩家进攻率",
        detail: "294 / 1,188，低 PVP 意愿但有社交动机玩家的尝试证据",
        accent: "cyan",
      },
    ],
    timeline: [
      {
        label: "CHAIN 1",
        title: "进入门槛",
        description: "先完成驻防、上阵和保存队伍等低风险准备动作，再进入攻击决策。",
        accent: "purple",
      },
      {
        label: "CHAIN 2",
        title: "规则教学",
        description: "把击败后仍需掠夺的规则转成胜利反馈后的下一步行动引导。",
        accent: "orange",
      },
      {
        label: "CHAIN 3",
        title: "持续对抗",
        description: "用复仇、锁定目标、侦查、进攻、掠夺和 GOAL 承接高意愿玩家。",
        accent: "cyan",
      },
      {
        label: "CHAIN 4",
        title: "成长闭环",
        description: "用资源、晶体、技能、GOAL、成就和奖励栏反馈延展单次战斗。",
        accent: "green",
      },
    ],
    sections: [
      {
        eyebrow: "Problem / Strategy",
        title: "如何让高成本 PVP 变成可尝试、可理解、可循环的轻量活动？",
        body:
          "项目面对两类核心阻力：高 PVP 热情玩家需要更集中、更明确、更有反馈的对抗目标；低 PVP 意愿玩家需要低成本、可引导、可退出的首次尝试路径。",
        bullets: [
          "设计判断：不提高战斗复杂度，而是用轻量活动系统承接 PVP 行为。",
          "表达重点：先讲 PVP 阻力与设计判断，再用四条证据链证明行为路径。",
          "归因边界：数据验证活动系统整体有效，不把结果拆给单个界面点。",
        ],
        diagramTitle: "PVP 三重门槛",
        diagramItems: [
          { label: "决策成本", detail: "判断目标价值、胜负概率和收益" },
          { label: "心理成本", detail: "担心损失，不敢攻击真人" },
          { label: "行为门槛", detail: "队伍、目标、侦查、进攻、奖励多步骤" },
        ],
      },
      {
        eyebrow: "Evidence Chain",
        title: "先让玩家完成低风险准备动作，再进入攻击决策",
        body:
          "玩家进入战场后，如果第一步就要求攻击真人，低 PVP 意愿玩家容易卡在决策前。因此首次进入采用强指引路径：进入活动战场、人物对话、点击驻防、进入驻守部队、一键上阵、保存编队、回到主界面、点击敌方目标。",
        bullets: [
          "行为变化：玩家先完成驻防和保存编队这类低风险动作，再接触敌方目标和进攻决策。",
          "结果证据：进入战场 6,426 人；保存队伍 6,353 / 6,426 = 98.86%；锁定对手 6,040 / 6,426 = 93.99%；发起进攻 5,781 / 6,426 = 89.96%。",
          "归因边界：这组数据说明进入战场后的主路径顺畅，不能单独归因给某一个按钮或弹窗。",
        ],
        diagramTitle: "首次进入路径",
        diagramItems: [
          { label: "进入战场", detail: "人物对话与点击驻防" },
          { label: "准备动作", detail: "一键上阵并保存编队" },
          { label: "目标确认", detail: "回到主界面并点击敌方目标" },
        ],
        evidenceGroups: [marsEntryPrimaryEvidence, marsEntryTargetEvidence],
      },
      {
        eyebrow: "Evidence Chain",
        title: "把“不敢打真人、不理解规则”转成低成本、可解释的行动",
        body:
          "低 PVP 意愿玩家担心损失，也不理解攻击、击败、掠夺之间的关系。项目用低成本战场、明确目标、异常保护和二次掠夺引导，把隐藏规则转成情境化教学。",
        bullets: [
          "设计动作：击败玩家血条后出现成功弹窗，用胜利氛围确认成就，并告诉玩家目标进入可掠夺状态。",
          "行为变化：玩家不是先记规则再操作，而是在成功反馈最强的时刻理解下一步，从“打赢了”继续走到“拿到资源”。",
          "结果证据：休闲-社交玩家 294 / 1,188 发起至少一次进攻，进攻率 24.75%，高于休闲-单机 5.83%。",
          "归因边界：该数据支持低 PVP 意愿但有社交动机玩家发生了 PVP 尝试，不能写成所有休闲玩家都被转化。",
        ],
        diagramTitle: "规则教学链路",
        diagramItems: [
          { label: "击败血条", detail: "第一次行动解决击败目标" },
          { label: "成功反馈", detail: "解释当前状态和下一步行动" },
          { label: "再次掠夺", detail: "第二次行动解决资源获取" },
        ],
        evidenceGroups: [marsLootEvidence, marsProtectionEvidence],
      },
      {
        eyebrow: "Evidence Chain",
        title: "让高 PVP 热情玩家有目标、有复仇、有收益",
        body:
          "高 PVP 热情玩家不是缺少一次攻击入口，而是需要持续对抗目标、明确收益和连续反馈。项目通过复仇、锁定目标、侦查、进攻、掠夺、GOAL 和局内成长组织持续对抗路径。",
        bullets: [
          "行为变化：核心玩家能够不断寻找目标、发起攻击、获得收益反馈，并进入下一轮目标选择。",
          "结果证据：硬核-社交玩家 4,697 / 9,659 发起至少一次进攻，进攻率 48.63%。",
          "归因边界：该数据证明高 PVP 倾向玩家被活动承接，不能外推为长期活跃或付费结果。",
        ],
        diagramTitle: "高 PVP 持续对抗路径",
        diagramItems: [
          { label: "被攻击线索", detail: "复仇入口与目标来源" },
          { label: "目标判断", detail: "锁定、侦查、进攻前确认" },
          { label: "收益反馈", detail: "攻击反馈、掠夺和 GOAL 推进" },
        ],
        evidenceGroups: [marsRevengeEvidence, marsAttackStateEvidence],
      },
      {
        eyebrow: "Evidence Chain",
        title: "用成长、技能和奖励闭环，把一次攻击延展为持续参与",
        body:
          "如果战斗后没有成长和目标反馈，玩家容易只完成一次点击。项目用资源获得、晶体强化、突破、技能学习、GOAL、成就奖励和目标完成反馈，把战斗收益转成持续动机。",
        bullets: [
          "行为变化：玩家从一次攻击进入资源获取、成长强化、技能学习、目标推进和再次行动的循环。",
          "结果证据：晶体等级中位数 q50 为 31；技能学习次数中位数为 5；购买体力次数中位数为 9；Goal 分位数 q30 到 q100 均为 6。",
          "归因边界：这些数据可以证明成长系统被持续使用；最高 Goal 的统计母体确认前，不作为封面主数据。",
        ],
        diagramTitle: "资源-成长-技能-GOAL-反馈闭环",
        diagramItems: [
          { label: "资源获得", detail: "战斗与掠夺进入资源池" },
          { label: "成长强化", detail: "晶体强化、突破和技能学习" },
          { label: "奖励反馈", detail: "GOAL、成就与奖励栏状态推动再次行动" },
        ],
        evidenceGroups: [marsSkillCrystalEvidence, marsGoalEvidence, marsRewardBarEvidence],
      },
      {
        eyebrow: "System Support",
        title: "复杂战场不靠堆界面，而靠信息架构和状态规则支撑",
        body:
          "战场主界面同时承载时间压力、目标进度、行动消耗、资源收益、战场对象和操作入口。对象状态覆盖本人基地、敌方基地、资源地、怪物和浮层，支撑前面四条证据链。",
        bullets: [
          "状态规则降低复杂战场的理解成本，也减少误操作、重复操作和无效点击。",
          "每个对象状态都需要定义触发条件、展示变化、是否可点击、操作区和反馈跳转。",
        ],
        diagramTitle: "战场控制台信息层级",
        diagramItems: [
          { label: "时间 / 目标", detail: "倒计时、奖牌、GOAL、奖励红点" },
          { label: "消耗 / 收益", detail: "行动体力、选定玩家次数、资源上限" },
          { label: "对象 / 操作", detail: "本人基地、敌方基地、资源地、怪物和返航、培养、驻防、复仇入口" },
        ],
        evidenceGroups: [
          marsSelfBaseMatrix,
          marsEnemyBaseMatrix,
          marsFloatingLayerMatrix,
          marsResourceMatrix,
          marsMonsterMatrix,
        ],
      },
      {
        eyebrow: "Data Evidence",
        title: "用同类对比、行为漏斗、玩家分层和成长数据收束活动系统价值",
        body:
          "数据页不能替代设计分析，它的作用是收束前面的证据链：同类活动对比说明参与规模，行为漏斗说明进入战场后的行动转化，玩家分层说明两类人群都发生行为，成长过程说明玩家不是浅尝辄止。",
        bullets: [
          "同口径参与人数：火星纪元 2,736，同类 PVP 活动 502，约 5.5 倍。",
          "进入战场后进攻转化：5,781 / 6,426 = 89.96%。",
          "休闲-社交玩家进攻率：294 / 1,188 = 24.75%，高于休闲-单机 5.83%。",
        ],
      },
      {
        eyebrow: "Summary",
        title: "这不是一次 PVP 的视觉包装，而是系统性体验设计",
        body:
          "火星纪元之战的核心价值在于：把高成本 PVP 转译成轻量、可理解、可循环的活动体验，并以上线数据作为活动参与、战场行为转化和成长系统使用的结果证据。",
        bullets: [
          "从业务问题和玩家行为阻力出发定义活动策略。",
          "用强指引和低风险准备动作降低 PVP 首次进入门槛。",
          "把击败后再次掠夺才获得资源的规则转化为即时反馈和下一步行动引导。",
          "用复仇、锁定、进攻、掠夺和成长奖励承接高 PVP 热情玩家。",
          "处理大量对象状态、异常反馈、权限限制和跳转规则。",
        ],
      },
    ],
    placeholders: [],
    coverEvidence: marsCoverEvidence,
    dataVisuals: marsDataVisuals,
  },
  habitatProject,
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

