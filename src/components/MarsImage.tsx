import type { CSSProperties, ImgHTMLAttributes } from "react";
import { marsAsset } from "../data/marsNarrative";

// Intrinsic dimensions from the supplied assets, never inferred from the column.
const images = {
  "完整界面图.png": { width: 1048, height: 589, kind: "screen" },
  "基地浮层-默认状态.png": { width: 1334, height: 750, kind: "screen" },
  "基地状态-瞄准.png": { width: 204, height: 219, kind: "model" },
  "基地浮层-已被设为目标状态.png": { width: 487, height: 505, kind: "popup" },
  "基地状态-当前不可攻击.png": { width: 231, height: 220, kind: "model" },
  "基地浮层-当前不可攻击.png": { width: 487, height: 505, kind: "popup" },
  "基地状态-设为目标.png": { width: 178, height: 196, kind: "model" },
  "基地状态-受击.png": { width: 200, height: 208, kind: "model" },
  "基地状态-击倒.png": { width: 207, height: 200, kind: "model" },
  "基地浮层-一键掠夺状态.png": { width: 487, height: 505, kind: "popup" },
  "基地状态-默认.png": { width: 178, height: 183, kind: "model" },
  "战斗胜利-掠夺引导.png": { width: 1334, height: 750, kind: "screen" },
  "战斗失败-补偿奖励.png": { width: 1334, height: 750, kind: "screen" },
  "奖励栏默认状态.png": { width: 478, height: 95, kind: "reward" },
  "奖励栏-积分增加.png": { width: 478, height: 95, kind: "reward" },
  "奖励栏-当前目标完成.png": { width: 478, height: 95, kind: "reward" },
  "奖励栏-有可领取奖励.png": { width: 478, height: 100, kind: "reward" },
  "奖励栏-全部目标完成.png": { width: 478, height: 95, kind: "reward" },
  "复仇-指引1.png": { width: 1334, height: 750, kind: "screen" },
  "复仇-指引2.png": { width: 1334, height: 750, kind: "screen" },
  "复仇界面.png": { width: 1334, height: 750, kind: "screen" },
  "水晶养成-强化.png": { width: 1334, height: 750, kind: "screen" },
  "水晶养成-突破.png": { width: 1334, height: 750, kind: "screen" },
  "水晶养成-突破成功弹窗.png": { width: 1334, height: 750, kind: "screen" },
  "局内技能界面.png": { width: 1334, height: 750, kind: "screen" },
} as const;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & { name: keyof typeof images };
export default function MarsImage({ name, style, ...props }: Props) {
  const image = images[name];
  const widthLimit = image.kind === "model" ? 220 : image.kind === "popup" ? 360 : image.kind === "reward" ? 480 : 960;
  const heightLimit = image.kind === "model" ? 240 : image.kind === "popup" ? 400 : Infinity;
  const displayWidth = Math.min(image.width, widthLimit, heightLimit * image.width / image.height);
  return <img {...props} src={marsAsset(name)} width={image.width} height={image.height}
    data-image-kind={image.kind} style={{ "--image-width": `${displayWidth}px`, ...style } as CSSProperties} />;
}
