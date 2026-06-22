import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ContactSection from "../components/ContactSection";
import Hero from "../components/Hero";
import NavBar from "../components/NavBar";
import ProjectVideoShowcase, { getProjectVideoLabel, getProjectVideoSrc } from "../components/ProjectVideoShowcase";
import { useProjectRouteTransition } from "../components/ProjectRouteTransition";
import { projects } from "../data/projects";

const TRANSITION_LOCK_MS = 980;

interface HomeLocationState {
  targetPanel?: string;
}

export default function HomePage() {
  const location = useLocation();
  const { startProjectRouteTransition } = useProjectRouteTransition();
  const panelIds = useMemo(() => ["top", "projects", "contact"], []);
  const getIndexFromHash = useCallback(
    (hash: string) => {
      const id = hash.replace("#", "");
      const index = panelIds.indexOf(id);
      return index >= 0 ? index : 0;
    },
    [panelIds],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(activeIndex);
  const lockRef = useRef(false);
  const unlockTimerRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);

  const updateUrl = useCallback(
    (index: number) => {
      const id = panelIds[index];
      const nextUrl = id === "top" ? window.location.pathname : `${window.location.pathname}#${id}`;
      window.history.replaceState(null, "", nextUrl);
    },
    [panelIds],
  );

  const goToPanel = useCallback(
    (index: number, syncUrl = true) => {
      const nextIndex = Math.max(0, Math.min(panelIds.length - 1, index));

      if (nextIndex === activeIndexRef.current) {
        return;
      }

      window.clearTimeout(unlockTimerRef.current);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      lockRef.current = true;

      if (syncUrl) {
        updateUrl(nextIndex);
      }

      unlockTimerRef.current = window.setTimeout(() => {
        lockRef.current = false;
      }, TRANSITION_LOCK_MS);
    },
    [panelIds.length, updateUrl],
  );

  useEffect(() => {
    document.documentElement.classList.add("is-home-fullpage");

    return () => {
      document.documentElement.classList.remove("is-home-fullpage");
      document.documentElement.classList.remove("is-home-project-panel");
      window.clearTimeout(unlockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-home-project-panel", activeIndex === 1);
  }, [activeIndex]);

  useEffect(() => {
    const targetPanel = (location.state as HomeLocationState | null)?.targetPanel;

    if (targetPanel) {
      goToPanel(getIndexFromHash(`#${targetPanel}`), false);
      return;
    }

    if (location.hash) {
      window.history.replaceState(null, "", location.pathname);
    }

    goToPanel(0, false);
  }, [getIndexFromHash, goToPanel, location.hash, location.pathname, location.state]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (lockRef.current || Math.abs(event.deltaY) < 18) {
        return;
      }

      goToPanel(activeIndexRef.current + (event.deltaY > 0 ? 1 : -1));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest("input, textarea, select, button, a")) {
        return;
      }

      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goToPanel(activeIndexRef.current + 1);
      }

      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goToPanel(activeIndexRef.current - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToPanel(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goToPanel(panelIds.length - 1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
      const deltaY = touchStartYRef.current - endY;

      if (lockRef.current || Math.abs(deltaY) < 46) {
        return;
      }

      goToPanel(activeIndexRef.current + (deltaY > 0 ? 1 : -1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goToPanel, panelIds.length]);

  const panelClass = (index: number, extra = "") => {
    const stateClass = index === activeIndex ? "is-active" : index < activeIndex ? "is-before" : "is-after";
    return `home-page-panel ${stateClass}${extra ? ` ${extra}` : ""}`;
  };

  const handleProjectSelect = (project: (typeof projects)[number], rect: DOMRect) => {
    if (selectedProjectSlug) {
      return;
    }

    setSelectedProjectSlug(project.slug);
    lockRef.current = true;
    startProjectRouteTransition({
      accent: project.accent,
      label: getProjectVideoLabel(project.slug),
      rect,
      slug: project.slug,
      videoSrc: getProjectVideoSrc(project.slug),
    });
  };

  return (
    <>
      <NavBar />
      <main className="home-fullpage" aria-label="Homepage">
        <div className="home-fullpage-track" style={{ transform: `translate3d(0, -${activeIndex * 100}dvh, 0)` }}>
          <div className={panelClass(0, "hero-fullpage-panel")}>
            <Hero />
          </div>

          <section
            className={panelClass(
              1,
              `project-fullpage-panel projects-section${selectedProjectSlug ? " is-project-selecting" : ""}`,
            )}
            id="projects"
            aria-labelledby="projects-title"
          >
            <div className="page-shell project-panel-shell">
              <div className="section-heading project-panel-heading">
                <span className="section-kicker">
                  <span className="kicker-line" />
                  SELECTED PROJECTS / 01
                </span>
                <h2 id="projects-title">交互项目</h2>
              </div>
              <ProjectVideoShowcase isOpening={selectedProjectSlug !== null} onOpen={handleProjectSelect} projects={projects} />
            </div>
          </section>

          <div className={panelClass(2, "contact-fullpage-panel")}>
            <ContactSection />
          </div>
        </div>
      </main>
    </>
  );
}
