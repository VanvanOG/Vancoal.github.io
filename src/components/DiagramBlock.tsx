import type { DiagramItem } from "../types";

interface DiagramBlockProps {
  title: string;
  items: DiagramItem[];
}

export default function DiagramBlock({ title, items }: DiagramBlockProps) {
  return (
    <div className="diagram-block">
      <p className="diagram-title">{title}</p>
      <div className="diagram-flow">
        {items.map((item, index) => (
          <div className="diagram-node" key={`${item.label}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
