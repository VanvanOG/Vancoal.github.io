import type { ImagePlaceholderItem } from "../types";

interface ImagePlaceholderProps {
  item: ImagePlaceholderItem;
}

export default function ImagePlaceholder({ item }: ImagePlaceholderProps) {
  return (
    <figure className={`image-placeholder image-placeholder-${item.type}`}>
      <div className="placeholder-surface">
        <span className="placeholder-id">{item.id}</span>
        <span className="placeholder-type">
          {item.type === "full" ? "完整界面占位" : "小图占位"}
        </span>
      </div>
      <figcaption>{item.description}</figcaption>
    </figure>
  );
}
