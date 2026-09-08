import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import ProjectPage from "../components/ProjectPage";
import MarsCasePage from "../components/MarsCasePage";
import AiDialogueCasePage from "../components/AiDialogueCasePage";
import CommissionCasePage from "../components/CommissionCasePage";
import AvaCasePage from "../components/AvaCasePage";
import { getProjectBySlug } from "../data/projects";

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return (
      <div className="project-detail-route">
        <NavBar />
        <main className="not-found page-shell">
          <h1>Project not found</h1>
          <p>Project route does not exist. Return home and choose a project.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="project-detail-route">
      <NavBar />
      {project.slug === "mars-era" ? <MarsCasePage /> : project.slug === "habitat-ai-dialogue" ? <AiDialogueCasePage /> : project.slug === "ai-commission" ? <CommissionCasePage /> : project.slug === "ava-league" ? <AvaCasePage /> : <ProjectPage project={project} />}
    </div>
  );
}
