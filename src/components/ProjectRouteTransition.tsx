import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Accent } from "../types";

interface ProjectRouteTransitionInput {
  accent: Accent;
  label: string;
  rect: DOMRect;
  slug: string;
  videoSrc: string;
}

interface ProjectRouteTransitionState extends ProjectRouteTransitionInput {
  phase: "expanding" | "revealing";
}

interface ProjectRouteTransitionContextValue {
  isProjectRouteTransitioning: boolean;
  startProjectRouteTransition: (input: ProjectRouteTransitionInput) => void;
}

const ROUTE_NAVIGATION_MS = 560;
const REVEAL_START_MS = 820;
const CLEANUP_MS = 1160;
const REDUCED_ROUTE_NAVIGATION_MS = 80;
const REDUCED_REVEAL_START_MS = 120;
const REDUCED_CLEANUP_MS = 320;

const ProjectRouteTransitionContext = createContext<ProjectRouteTransitionContextValue | null>(null);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ProjectRouteTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [transition, setTransition] = useState<ProjectRouteTransitionState | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const finishTransition = useCallback(() => {
    clearTimers();
    document.documentElement.classList.remove("is-project-route-entering");
    setTransition(null);
  }, [clearTimers]);

  const startProjectRouteTransition = useCallback(
    (input: ProjectRouteTransitionInput) => {
      clearTimers();
      document.documentElement.classList.add("is-project-route-entering");
      setTransition({ ...input, phase: "expanding" });

      const reduceMotion = prefersReducedMotion();
      const routeDelay = reduceMotion ? REDUCED_ROUTE_NAVIGATION_MS : ROUTE_NAVIGATION_MS;
      const revealDelay = reduceMotion ? REDUCED_REVEAL_START_MS : REVEAL_START_MS;
      const cleanupDelay = reduceMotion ? REDUCED_CLEANUP_MS : CLEANUP_MS;

      timersRef.current = [
        window.setTimeout(() => {
          navigate(`/projects/${input.slug}`);
        }, routeDelay),
        window.setTimeout(() => {
          setTransition((current) => (current ? { ...current, phase: "revealing" } : current));
        }, revealDelay),
        window.setTimeout(() => {
          finishTransition();
        }, cleanupDelay),
      ];
    },
    [clearTimers, finishTransition, navigate],
  );

  useEffect(
    () => () => {
      finishTransition();
    },
    [finishTransition],
  );

  return (
    <ProjectRouteTransitionContext.Provider
      value={{
        isProjectRouteTransitioning: transition !== null,
        startProjectRouteTransition,
      }}
    >
      {children}
      {transition ? (
        <div
          aria-hidden="true"
          className={`project-open-overlay is-${transition.phase}`}
          data-accent={transition.accent}
          style={
            {
              "--overlay-h": `${transition.rect.height}px`,
              "--overlay-w": `${transition.rect.width}px`,
              "--overlay-x": `${transition.rect.left}px`,
              "--overlay-y": `${transition.rect.top}px`,
            } as CSSProperties
          }
        >
          <div className="project-open-overlay-media">
            <video className="project-open-overlay-video" autoPlay loop muted playsInline src={transition.videoSrc} />
            <span className="project-open-overlay-scrim" />
            <span className="project-open-overlay-label">{transition.label}</span>
          </div>
        </div>
      ) : null}
    </ProjectRouteTransitionContext.Provider>
  );
}

export function useProjectRouteTransition() {
  const context = useContext(ProjectRouteTransitionContext);

  if (!context) {
    throw new Error("useProjectRouteTransition must be used inside ProjectRouteTransitionProvider");
  }

  return context;
}
