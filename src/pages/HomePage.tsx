import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ContactSection from "../components/ContactSection";
import Hero from "../components/Hero";
import NavBar from "../components/NavBar";
import ProjectIntroSequence, { type IntroPlaybackDirection } from "../components/ProjectIntroSequence";
import ProjectVideoShowcase, { getProjectVideoLabel, getProjectVideoSrc } from "../components/ProjectVideoShowcase";
import ProjectWaveWipe from "../components/ProjectWaveWipe";
import { useProjectRouteTransition } from "../components/ProjectRouteTransition";
import { projects } from "../data/projects";
import { introUiState, panelTransitionMode, shouldMountProjectLayer, waveProgressAtFrame } from "../utils/introTimeline.mjs";

const TRANSITION_LOCK_MS = 980;
const HERO_ALIGNMENT_MS = 280;
const INTRO_DURATION_MS = 4000;

type IntroPhase = "hero" | "align" | "intro-forward" | "projects" | "intro-reverse" | "return-settling";

interface HomeLocationState {
  targetPanel?: string;
}

export default function HomePage() {
  const location = useLocation();
  const { startProjectRouteTransition } = useProjectRouteTransition();
  const panelIds = useMemo(() => ["top", "projects", "contact"], []);
  // A case return restores its destination immediately. It must not start an
  // intro timer during mount (StrictMode cleanup would cancel that timer).
  const initialPanelIndex = Math.max(0, panelIds.indexOf((location.state as HomeLocationState | null)?.targetPanel ?? "top"));
  const [activeIndex, setActiveIndex] = useState(initialPanelIndex);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(initialPanelIndex === 0 ? "hero" : "projects");
  const [introFrame, setIntroFrame] = useState(initialPanelIndex === 0 ? 0 : 300);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [projectPanelEntering, setProjectPanelEntering] = useState(false);
  const [homePanelReturning, setHomePanelReturning] = useState(false);
  const activeIndexRef = useRef(activeIndex);
  const introPhaseRef = useRef(introPhase);
  const lockRef = useRef(false);
  const unlockTimerRef = useRef(0);
  const introTimerRef = useRef(0);
  const touchStartYRef = useRef(0);

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isIntroPlaying = introPhase === "intro-forward" || introPhase === "intro-reverse";
  const isProjectInteractive = introPhase === "projects" && activeIndex === 1;
  const projectUi = introPhase === "intro-forward" ? introUiState(introFrame) : { projectVisible: isProjectInteractive };
  const isProjectLayerMounted = shouldMountProjectLayer(activeIndex, introPhase, projectPanelEntering);
  const introDirection: IntroPlaybackDirection | null = introPhase === "intro-forward"
    ? "forward"
    : introPhase === "intro-reverse"
      ? "reverse"
      : null;

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    introPhaseRef.current = introPhase;
  }, [introPhase]);

  const finishStandardPanelTransition = useCallback((onComplete?: () => void) => {
    window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false;
      onComplete?.();
    }, TRANSITION_LOCK_MS);
  }, []);

  const startProjectIntro = useCallback(() => {
    if (lockRef.current || introPhaseRef.current !== "hero" || activeIndexRef.current !== 0) return;

    lockRef.current = true;
    window.clearTimeout(introTimerRef.current);

    if (prefersReducedMotion()) {
      activeIndexRef.current = 1;
      setActiveIndex(1);
      setIntroFrame(300);
      setIntroPhase("projects");
      lockRef.current = false;
      return;
    }

    setIntroPhase("align");
    introTimerRef.current = window.setTimeout(() => {
      activeIndexRef.current = 1;
      setActiveIndex(1);
      setIntroFrame(0);
      setIntroPhase("intro-forward");
    }, HERO_ALIGNMENT_MS);
  }, []);

  const onIntroComplete = useCallback((direction: IntroPlaybackDirection) => {
    if (direction === "forward") {
      setIntroFrame(300);
      setIntroPhase("projects");
      lockRef.current = false;
      return;
    }

    setIntroFrame(0);
    activeIndexRef.current = 0;
    setActiveIndex(0);
    setIntroPhase("return-settling");
    window.clearTimeout(introTimerRef.current);
    introTimerRef.current = window.setTimeout(() => {
      setIntroPhase("hero");
      lockRef.current = false;
    }, TRANSITION_LOCK_MS);
  }, []);

  const goToPanel = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(panelIds.length - 1, index));
    const currentIndex = activeIndexRef.current;

    if (lockRef.current || nextIndex === currentIndex) return;
    if (introPhaseRef.current !== "hero" && introPhaseRef.current !== "projects") return;

    if (panelTransitionMode(currentIndex, nextIndex) === "intro-forward") {
      startProjectIntro();
      return;
    }

    const isReturningFromContact = currentIndex === 2 && nextIndex === 1;
    const isReturningToHome = currentIndex !== 0 && nextIndex === 0;
    lockRef.current = true;
    if (isReturningFromContact) setProjectPanelEntering(true);
    if (isReturningToHome) setHomePanelReturning(true);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);

    if (nextIndex === 1) setIntroPhase("projects");
    finishStandardPanelTransition(() => {
      if (isReturningFromContact) setProjectPanelEntering(false);
      if (isReturningToHome) {
        setIntroPhase("hero");
        setHomePanelReturning(false);
      }
    });
  }, [finishStandardPanelTransition, panelIds.length, startProjectIntro]);

  useEffect(() => {
    document.documentElement.classList.add("is-home-fullpage");

    return () => {
      document.documentElement.classList.remove("is-home-fullpage");
      document.documentElement.classList.remove("is-home-project-panel");
      window.clearTimeout(unlockTimerRef.current);
      window.clearTimeout(introTimerRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-home-project-panel", activeIndex === 1);
  }, [activeIndex]);

  useEffect(() => {
    const isTransitioning = introPhase !== "hero" && introPhase !== "projects";
    document.documentElement.classList.toggle("is-project-intro-transitioning", isTransitioning);

    return () => document.documentElement.classList.remove("is-project-intro-transitioning");
  }, [introPhase]);

  useEffect(() => {
    const targetPanel = (location.state as HomeLocationState | null)?.targetPanel;
    if (!targetPanel) return;

    const index = panelIds.indexOf(targetPanel);
    goToPanel(index >= 0 ? index : 0);
  }, [goToPanel, location.state, panelIds]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (lockRef.current || Math.abs(event.deltaY) < 18) return;
      goToPanel(activeIndexRef.current + (event.deltaY > 0 ? 1 : -1));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.isComposing || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || lockRef.current) return;
      if (target?.isContentEditable || target?.closest("input, textarea, select, [role='textbox']")) return;

      const key = event.key.toLowerCase();
      const panel = activeIndexRef.current;
      const destination = panel === 0 && key === "c" ? 2
        : panel === 2 && key === "h" ? 0
        : (panel === 0 || panel === 2) && key === "p" ? 1 : null;
      if (destination !== null) {
        event.preventDefault();
        const hint = document.querySelector(`#${panel === 0 ? 'top' : 'contact'} [data-shortcut="${key}"]`);
        if (hint && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          hint.animate([{backgroundColor:'#e8893a',color:'#151413'},{}],{duration:160});
        }
        goToPanel(destination);
        return;
      }
      if (target?.closest("input, textarea, select, button, a")) return;

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

    const onTouchMove = (event: TouchEvent) => event.preventDefault();

    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
      const deltaY = touchStartYRef.current - endY;
      if (lockRef.current || Math.abs(deltaY) < 46) return;
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
    if (!isProjectInteractive || selectedProjectSlug) return;

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
            <Hero
              forceFinalFrame={introPhase !== "hero" || homePanelReturning}
              interactionLocked={introPhase !== "hero" || homePanelReturning || lockRef.current}
              onViewProjects={startProjectIntro}
            />
          </div>

          <section className={panelClass(1, "project-fullpage-panel projects-section")} id="projects" aria-label="交互项目" />

          <div className={panelClass(2, "contact-fullpage-panel")}>
            <ContactSection />
          </div>
        </div>
      </main>

      <ProjectIntroSequence
        direction={introDirection}
        durationMs={INTRO_DURATION_MS}
        onComplete={onIntroComplete}
        onFrame={setIntroFrame}
        visible={isIntroPlaying || introPhase === "return-settling"}
      />
      <ProjectWaveWipe progress={waveProgressAtFrame(introFrame)} visible={isIntroPlaying} />

      {isProjectLayerMounted ? (
        <section
          className={`project-intro-project-layer${isIntroPlaying ? " is-transitioning" : ""}${projectUi.projectVisible ? " is-content-visible" : ""}${isProjectInteractive ? " is-interactive" : ""}${selectedProjectSlug ? " is-project-selecting" : ""}`}
          aria-label="交互项目"
        >
          <div className="page-shell project-panel-shell">
            <div className="section-heading project-panel-heading">
              <span className="section-kicker">
                <span className="kicker-line" />
                SELECTED PROJECTS / 01
              </span>
              <h2>交互项目</h2>
            </div>
            <ProjectVideoShowcase
              isOpening={!isProjectInteractive || selectedProjectSlug !== null}
              onOpen={handleProjectSelect}
              projects={projects}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
