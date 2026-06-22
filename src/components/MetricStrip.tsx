import type { ProjectMetric } from "../types";

interface MetricStripProps {
  metrics: ProjectMetric[];
}

export default function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <div className="metric-strip">
      {metrics.map((metric) => (
        <article className="metric-item" data-accent={metric.accent} key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
          <p>{metric.detail}</p>
        </article>
      ))}
    </div>
  );
}
