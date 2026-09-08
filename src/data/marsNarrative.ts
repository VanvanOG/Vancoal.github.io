// Content and data transcribed from the accepted 2026-09-05 narrative demo.
import { publicPath } from "../utils/publicPath";

export const marsAsset = (filename: string) => publicPath(`/media/mars-era/${encodeURIComponent(filename)}`);

export const marsZones = {
  battle: { number: "01", box: [1, 9, 88, 67], question: "我可以对谁行动？", copy: "本人飞船与周围敌方、资源地和怪物构成主要交互区域。选中、受击和损毁状态直接呈现在对应对象上，玩家可以结合场景位置判断当前战况。" },
  goal: { number: "02", box: [35, 83, 30, 16], question: "我在推进什么目标？", copy: "奖牌、下一目标进度与奖励入口集中在底部中央。玩家可在战斗过程中查看目标差距，并分别识别进度变化与可领取奖励。" },
  cost: { number: "03", box: [81, 71, 18, 11], question: "我的行动受什么限制？", copy: "考虑到资源与战斗操作的关联，关键资源从常见的顶部位置移至右下方，与操作区相邻，便于玩家查看库存、上限及行动消耗。" },
  actions: { number: "04", box: [71, 84, 28, 15], question: "行动之后可以去哪里？", copy: "培养、驻防、复仇与邮件集中在右下，与资源信息相邻，方便玩家在战斗前后配置部队、查看战报和处理后续行动。" },
  queue: { number: "05", box: [89.5, 17, 10, 34], question: "已发出的行动进行到哪？", copy: "右侧显示已派遣的行军队列，玩家可同时查看队列进度和战场对象。图中为早期队列样式，后续规则改为固定4条活动队列。" },
  secondary: { number: "06", box: [3, 82, 19, 17], question: "辅助功能如何避免分散注意？", copy: "返航与规则位于左下，与右侧常用战斗操作分开。辅助入口保留在主界面，主要视野优先用于战场和目标反馈。" },
  time: { number: "07", box: [21, 0.5, 59, 8], question: "这场活动还有多久？", copy: "顶部显示活动倒计时和场景状态；目标进度、成本与收益集中在战场和底部区域，分别对应全局信息与当前操作。" }
};

export interface MarsMetric { label: string; count: number; denominator: number; highlight?: boolean }
export const marsMetrics = {
  comparison: [
    { label: "火星纪元", count: 2736, denominator: 14822, highlight: true },
    { label: "同期参考活动 A", count: 502, denominator: 14822 },
    { label: "同期参考活动 B", count: 1028, denominator: 14822 },
    { label: "同期参考活动 C", count: 387, denominator: 14822 }
  ],
  behavior: [
    { label: "进入战场", count: 6426, denominator: 6426 },
    { label: "保存队伍", count: 6353, denominator: 6426 },
    { label: "锁定对手", count: 6040, denominator: 6426 },
    { label: "发起进攻", count: 5781, denominator: 6426, highlight: true }
  ],
  segments: [
    { label: "休闲-单机", count: 188, denominator: 3222 },
    { label: "休闲-社交", count: 294, denominator: 1188, highlight: true },
    { label: "硬核-单机", count: 602, denominator: 9800 },
    { label: "硬核-社交", count: 4697, denominator: 9659, highlight: true }
  ]
};

export const marsStrategies = [
  { id: "access", title: "链路简化", detail: "省去前置报名和排期，将主要决策集中到实战环节。", accent: "purple" },
  { id: "focus", title: "目标明确", detail: "依据目标锁定和战斗进展，同步场景表现、操作入口与限制说明。", accent: "orange" },
  { id: "feedback", title: "阶梯式反馈", detail: "区分胜负与目标反馈；复仇丰富进攻方式，局内成长提供低成本提升战力的途径。", accent: "cyan" },
];

