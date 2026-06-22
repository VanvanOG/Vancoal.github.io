import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import ProjectPage from "../components/ProjectPage";
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
      <ProjectPage project={project} />
    </div>
  );
}
