import { Navigate, Route, Routes } from "react-router-dom";
import { ProjectRouteTransitionProvider } from "./components/ProjectRouteTransition";
import ScrollToHash from "./components/ScrollToHash";
import HomePage from "./pages/HomePage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

export default function App() {
  return (
    <ProjectRouteTransitionProvider>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProjectRouteTransitionProvider>
  );
}
