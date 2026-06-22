import { ArrowRight } from "lucide-react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../types";
import { publicPath } from "../utils/publicPath";

const projectCardAssets: Record<string, { image: string; label: string }> = {
  "ai-design-lab": {
    image: publicPath("/media/project-cards/ai-lab-card.png"),
    label: "AI CODING",
  },
  "habitat-ai-dialogue": {
    image: publicPath("/media/project-cards/ai-dialogue-card.png"),
    label: "AI CHAT",
  },
  "mars-era": {
    image: publicPath("/media/project-cards/mars-era-card.png"),
    label: "PVP EVENT",
  },
};

export const getProjectCardAsset = (slug: string) => projectCardAssets[slug];

interface ProjectCardProps {
  project: Project;
  index: number;
  variant?: "default" | "compact";
  isSelected?: boolean;
  isDimmed?: boolean;
  onSelect?: (project: Project, rect: DOMRect) => void;
}

export default function ProjectCard({
  project,
  index,
  variant = "default",
  isSelected = false,
  isDimmed = false,
  onSelect,
}: ProjectCardProps) {
  const paddedIndex = String(index + 1).padStart(2, "0");
  const cardAsset = getProjectCardAsset(project.slug);
  const className = [
    "project-card",
    variant === "compact" ? "project-card-compact" : "",
    isSelected ? "is-selected" : "",
    isDimmed ? "is-dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) {
      return;
    }

    event.preventDefault();
    onSelect(project, event.currentTarget.getBoundingClientRect());
  };

  return (
    <article className={className} data-accent={project.accent}>
      <Link to={`/projects/${project.slug}`} aria-label={`Open project ${project.title}`} onClick={handleClick}>
        <div className="project-card-media" aria-hidden="true">
          {variant === "compact" && cardAsset ? (
            <>
              <img className="project-card-image" src={cardAsset.image} alt="" draggable="false" />
              <span className="project-card-label">{cardAsset.label}</span>
            </>
          ) : (
            <>
              <div className="media-grid">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="media-node node-a" />
              <div className="media-node node-b" />
              <div className="media-line" />
              <strong>{project.cardStat}</strong>
            </>
          )}
        </div>
        {variant !== "compact" ? (
          <div className="project-card-copy">
            <span className="project-index">PROJECT {paddedIndex}</span>
            <h3>{project.shortTitle}</h3>
            <p>{project.positioning}</p>
            <div className="project-card-meta">
              <span>{project.category}</span>
              <span>{project.cardCaption}</span>
            </div>
            <span className="text-action">
              Open Case
              <ArrowRight aria-hidden="true" size={17} />
            </span>
          </div>
        ) : null}
      </Link>
    </article>
  );
}
