import type { ProfileGroup, ProfileItem } from "../types";

export const profile = {
  name: "钟成龙",
  mark: "CHENGLONG ZHONG / VANCOAL",
  role: "AI + Game Interaction Designer",
  email: "vancoal@163.com",
  headline:
    "擅长 AI 与游戏产品体验设计，能从玩家心理、复杂系统、商业化活动和数据验证角度推动 0 到 1 产品体验落地。",
  intro:
    "我关注的不是把界面做得更满，而是把玩家的行动阻力、系统状态和反馈闭环组织成可理解、可验证、可交付的体验系统。",
  quickFacts: [
    { label: "Current Focus", value: "AI-UCG / 游戏交互 / 复杂系统体验" },
    { label: "Portfolio Direction", value: "AI + 游戏交互设计师" },
    { label: "Core Evidence", value: "商业化活动数据、AI 任务流、AI Coding 实验" },
  ] satisfies ProfileItem[],
  groups: [
    {
      title: "Education",
      items: [
        "加泰罗尼亚理工大学 - 创新、技术和设计硕士",
        "上海大学 - 建筑学本科",
      ],
    },
    {
      title: "Strengths",
      items: [
        "玩家心理洞察与认知模型",
        "跨领域竞品分析与产品判断",
        "数据驱动设计与埋点验证",
        "游戏复杂系统与 AI 交互链路",
      ],
    },
    {
      title: "Recent Experience",
      items: [
        "生境科技：资深 UX 设计师，负责 AI-UCG 与模拟经营核心交互",
        "乐易网络：高级 UX 设计师，主导火星纪元商业化活动体验",
        "NINE 你呢：社交产品与线上配对活动体验优化",
      ],
    },
  ] satisfies ProfileGroup[],
};
