import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { Project } from "../types";
import { publicPath } from "../utils/publicPath";
import MagneticButton from "./MagneticButton";

type SwitchDirection = -1 | 1;

const DRAG_PROGRESS_THRESHOLD = 0.22;
const DRAG_VELOCITY_THRESHOLD = 0.65;
const PLAY_HIDE_DURATION = 0.16;
const PLAY_SHOW_DURATION = 0.14;

const projectVideoSources: Record<string, string> = {
  "ai-design-lab": publicPath("/media/project-videos/ai-lab.mp4"),
  "habitat-ai-dialogue": publicPath("/media/project-videos/ai-dialogue-2.mp4"),
  "mars-era": publicPath("/media/project-videos/mars-era.mp4"),
};

const projectVideoLabels: Record<string, string> = {
  "ai-design-lab": "AI CODING",
  "habitat-ai-dialogue": "AI CHAT",
  "mars-era": "PVP EVENT",
};

export const getProjectVideoLabel = (slug: string) => projectVideoLabels[slug] ?? "PROJECT";

export const getProjectVideoSrc = (slug: string) => projectVideoSources[slug] ?? projectVideoSources["mars-era"];

interface ProjectVideoShowcaseProps {
  projects: Project[];
  isOpening: boolean;
  onOpen: (project: Project, rect: DOMRect) => void;
}

interface DragState {
  dragged: boolean;
  isActive: boolean;
  lastTime: number;
  lastX: number;
  pointerId: number;
  startX: number;
  step: number;
  velocity: number;
}

const getProjectNumber = (index: number) => String(index + 1).padStart(2, "0");

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wrapIndex = (index: number, total: number) => ((index % total) + total) % total;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getRelativeOffset = (index: number, centerIndex: number, total: number) => {
  let offset = index - centerIndex;
  const half = total / 2;

  if (offset > half) {
    offset -= total;
  }

  if (offset < -half) {
    offset += total;
  }

  return offset;
};

export default function ProjectVideoShowcase({ projects, isOpening, onOpen }: ProjectVideoShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<SwitchDirection>(1);
  const [readyVideoIndexes, setReadyVideoIndexes] = useState<Record<number, boolean>>({});
  const [videoPosters, setVideoPosters] = useState<Record<number, string>>({});

  const activeIndexRef = useRef(0);
  const dragProgressRef = useRef(0);
  const dragStateRef = useRef<DragState>({
    dragged: false,
    isActive: false,
    lastTime: 0,
    lastX: 0,
    pointerId: -1,
    startX: 0,
    step: 1,
    velocity: 0,
  });
  const isSwitchingRef = useRef(false);
  const lastDragEndRef = useRef(0);
  const primedVideoIndexesRef = useRef<Set<number>>(new Set());
  const targetIndexRef = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const videoPosterRefs = useRef<Record<number, string>>({});
  const readyVideoIndexesRef = useRef<Set<number>>(new Set());

  const currentCountRef = useRef<HTMLSpanElement | null>(null);
  const incomingCountRef = useRef<HTMLSpanElement | null>(null);
  const currentMetaRef = useRef<HTMLElement | null>(null);
  const incomingMetaRef = useRef<HTMLElement | null>(null);
  const playZoneRef = useRef<HTMLSpanElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const total = projects.length;
  const activeProject = projects[activeIndex];
  const targetProject = targetIndex === null ? null : projects[targetIndex];
  const activeNumber = getProjectNumber(activeIndex);
  const targetNumber = targetIndex === null ? "" : getProjectNumber(targetIndex);
  const totalNumber = String(total).padStart(2, "0");

  const hidePlayButton = (duration = PLAY_HIDE_DURATION) => {
    const playZone = playZoneRef.current;

    if (!playZone) {
      return;
    }

    gsap.to(playZone, {
      autoAlpha: 0,
      duration,
      ease: "power2.out",
      onStart: () => {
        gsap.set(playZone, { pointerEvents: "none" });
      },
      overwrite: true,
      scale: 0.82,
    });
  };

  const showPlayButton = (duration = PLAY_SHOW_DURATION) => {
    const playZone = playZoneRef.current;

    if (!playZone) {
      return;
    }

    gsap.set(playZone, { scale: 0.9 });
    gsap.to(playZone, {
      autoAlpha: 1,
      duration,
      ease: "back.out(1.25)",
      onStart: () => {
        gsap.set(playZone, { pointerEvents: "auto" });
      },
      overwrite: true,
      scale: 1,
    });
  };

  const configureVideo = (video: HTMLVideoElement) => {
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    if (video.readyState < 2) {
      video.load();
    }
  };

  const capturePosterFrame = (video: HTMLVideoElement, index: number) => {
    if (videoPosterRefs.current[index] || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const maxWidth = 960;
      const scale = Math.min(1, maxWidth / video.videoWidth);

      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      videoPosterRefs.current[index] = canvas.toDataURL("image/jpeg", 0.82);
      setVideoPosters({ ...videoPosterRefs.current });
    } catch {
      // If canvas extraction fails, the resident video element still keeps its own decoded frame.
    }
  };

  const markVideoReady = (video: HTMLVideoElement, index: number) => {
    primedVideoIndexesRef.current.add(index);
    capturePosterFrame(video, index);

    if (readyVideoIndexesRef.current.has(index)) {
      return;
    }

    readyVideoIndexesRef.current.add(index);
    setReadyVideoIndexes({ ...Object.fromEntries([...readyVideoIndexesRef.current].map((readyIndex) => [readyIndex, true])) });
  };

  const shouldVideoKeepPlaying = (index: number) => index === activeIndexRef.current || index === targetIndexRef.current;

  const pauseVideoAsStill = (video: HTMLVideoElement, index: number) => {
    requestAnimationFrame(() => {
      if (!shouldVideoKeepPlaying(index)) {
        video.pause();
      }
    });
  };

  const primeVideoFrame = (index: number) => {
    const video = videoRefs.current[index];

    if (!video) {
      return;
    }

    configureVideo(video);

    const markReady = () => {
      markVideoReady(video, index);
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      pauseVideoAsStill(video, index);
    };

    if (video.readyState >= 2) {
      markReady();
    } else {
      video.addEventListener("loadeddata", markReady, { once: true });
      video.addEventListener("canplay", markReady, { once: true });
    }

    video.play().catch(() => {
      // Muted autoplay can still be delayed; loadeddata/canplay will still expose the first decoded frame.
    });
  };

  const primeAllVideoFrames = () => {
    projects.forEach((_, index) => primeVideoFrame(index));
  };

  const syncVideoPlayback = (primaryIndex: number, secondaryIndex: number | null = null) => {
    targetIndexRef.current = secondaryIndex;

    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      configureVideo(video);

      if (video.readyState >= 2) {
        markVideoReady(video, index);
      }

      if (index === primaryIndex || index === secondaryIndex) {
        video.play().catch(() => {
          // Muted autoplay can still be delayed by the browser; resident slides keep the current frame.
        });
        return;
      }

      if (!primedVideoIndexesRef.current.has(index)) {
        primeVideoFrame(index);
        return;
      }

      pauseVideoAsStill(video, index);
    });
  };

  const updateCarouselMetrics = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const width = viewport.clientWidth;
    const slideRatio = width >= 960 ? 0.72 : width >= 720 ? 0.8 : 0.88;
    const slideWidth = Math.round(width * slideRatio);
    const gap = Math.round(clamp(width * 0.035, 28, 42));

    viewport.style.setProperty("--project-video-slide-width", `${slideWidth}px`);
    viewport.style.setProperty("--project-video-slide-gap", `${gap}px`);
  };

  const getSlideStep = () => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return 1;
    }

    updateCarouselMetrics();

    const slide = slideRefs.current[activeIndexRef.current] ?? slideRefs.current.find(Boolean);
    const gap = Number.parseFloat(getComputedStyle(viewport).getPropertyValue("--project-video-slide-gap")) || 36;

    return (slide?.offsetWidth ?? viewport.clientWidth * 0.72) + gap;
  };

  const setSlidePresentation = (progress: number, centerIndex = activeIndexRef.current) => {
    const step = getSlideStep();
    const direction: SwitchDirection = progress >= 0 ? 1 : -1;
    const amount = clamp(Math.abs(progress), 0, 1);
    const wrappingIndex = total > 2 && amount > 0.001 ? wrapIndex(centerIndex - direction, total) : -1;

    projects.forEach((_, index) => {
      const slide = slideRefs.current[index];

      if (!slide) {
        return;
      }

      let offset = getRelativeOffset(index, centerIndex, total) - progress;
      let wrapOpacity = 1;

      if (index === wrappingIndex) {
        if (amount < 0.5) {
          offset = -direction * (1 + amount * 0.7);
          wrapOpacity = clamp(1 - amount / 0.42, 0, 1);
        } else {
          offset = direction * (1 + (1 - amount) * 0.22);
          wrapOpacity = clamp((amount - 0.52) / 0.38, 0, 1);
        }
      }

      const activeAmount = clamp(1 - Math.abs(offset), 0, 1);
      const sidePresence = Math.abs(offset) <= 1.42 ? 1 : 0;
      const opacity = (0.68 + activeAmount * 0.32) * sidePresence * wrapOpacity;
      const scale = 0.92 + activeAmount * 0.08;
      const brightness = 0.8 + activeAmount * 0.2;

      gsap.set(slide, {
        filter: `brightness(${brightness})`,
        opacity,
        scale,
        x: offset * step,
        xPercent: -50,
        zIndex: Math.round(1 + activeAmount * 3),
      });
    });
  };

  const centerSlides = (centerIndex = activeIndexRef.current) => {
    updateCarouselMetrics();
    dragProgressRef.current = 0;
    setSlidePresentation(0, centerIndex);
  };

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      primeAllVideoFrames();
      centerSlides();
    });
  }, [projects]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
    syncVideoPlayback(activeIndex);
  }, [activeIndex]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
    },
    [],
  );

  useLayoutEffect(() => {
    if (targetIndex !== null) {
      return;
    }

    centerSlides(activeIndex);

    const handleResize = () => centerSlides(activeIndexRef.current);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, targetIndex, total]);

  useLayoutEffect(() => {
    if (targetIndex === null || !targetProject) {
      return;
    }

    const currentCount = currentCountRef.current;
    const incomingCount = incomingCountRef.current;
    const currentMeta = currentMetaRef.current;
    const incomingMeta = incomingMetaRef.current;
    const playZone = playZoneRef.current;
    const incomingVideo = videoRefs.current[targetIndex];

    if (!currentCount || !incomingCount || !currentMeta || !incomingMeta || !playZone) {
      return;
    }

    updateCarouselMetrics();
    timelineRef.current?.kill();
    syncVideoPlayback(activeIndexRef.current, targetIndex);

    let cancelled = false;
    let hasStarted = false;

    const reduceMotion = prefersReducedMotion();
    const dir = transitionDirection;
    const currentTextY = dir > 0 ? -108 : 108;
    const incomingTextY = dir > 0 ? 108 : -108;
    const currentSoftY = dir > 0 ? -18 : 18;
    const incomingSoftY = dir > 0 ? 18 : -18;

    gsap.set(currentCount, { autoAlpha: 1, yPercent: 0 });
    gsap.set(incomingCount, { autoAlpha: 0, yPercent: incomingTextY });
    gsap.set(currentMeta, { autoAlpha: 1, y: 0 });
    gsap.set(incomingMeta, { autoAlpha: 0, y: incomingSoftY });
    gsap.set(playZone, { autoAlpha: 0, pointerEvents: "none", scale: 0.82 });

    const startTransition = () => {
      if (cancelled) {
        return;
      }

      incomingVideo?.play().catch(() => {
        // The target video is resident; if play is delayed, its current decoded frame remains visible.
      });

      const progressState = { value: dragProgressRef.current };
      const duration = reduceMotion ? 0.18 : 0.72;

      const tl = gsap.timeline({
        defaults: { overwrite: true },
        onComplete: () => {
          activeIndexRef.current = targetIndex;
          setActiveIndex(targetIndex);
          setTargetIndex(null);
          setIsSwitching(false);
          isSwitchingRef.current = false;
          dragProgressRef.current = 0;
          requestAnimationFrame(() => {
            centerSlides(targetIndex);
            syncVideoPlayback(targetIndex);
          });
        },
      });

      tl.to(
        progressState,
        {
          duration,
          ease: reduceMotion ? "power2.out" : "power3.out",
          onUpdate: () => {
            dragProgressRef.current = progressState.value;
            setSlidePresentation(progressState.value, activeIndexRef.current);
          },
          value: dir,
        },
        0,
      )
        .to(currentCount, { autoAlpha: 0, duration: 0.22, ease: "power2.in", yPercent: currentTextY }, 0.04)
        .to(incomingCount, { autoAlpha: 1, duration: 0.34, ease: "power3.out", yPercent: 0 }, 0.22)
        .to([currentMeta], { autoAlpha: 0, duration: 0.18, ease: "power2.in", y: currentSoftY }, 0.05)
        .to([incomingMeta], { autoAlpha: 1, duration: 0.32, ease: "power3.out", y: 0 }, 0.24)
        .fromTo(
          playZone,
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            duration: PLAY_SHOW_DURATION,
            ease: "back.out(1.25)",
            onStart: () => {
              gsap.set(playZone, { pointerEvents: "auto" });
            },
            scale: 1,
          },
          Math.max(0, duration - 0.16),
        );

      timelineRef.current = tl;
    };

    const startAfterReady = () => {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      incomingVideo?.removeEventListener("loadeddata", startAfterReady);
      incomingVideo?.removeEventListener("canplay", startAfterReady);
      requestAnimationFrame(startTransition);
    };

    if (incomingVideo && incomingVideo.readyState < 2) {
      incomingVideo.load();
      incomingVideo.addEventListener("loadeddata", startAfterReady, { once: true });
      incomingVideo.addEventListener("canplay", startAfterReady, { once: true });
    } else {
      requestAnimationFrame(startTransition);
    }

    return () => {
      cancelled = true;
      incomingVideo?.removeEventListener("loadeddata", startAfterReady);
      incomingVideo?.removeEventListener("canplay", startAfterReady);
      timelineRef.current?.kill();
    };
  }, [targetIndex, targetProject, transitionDirection]);

  const startSwitch = (direction: SwitchDirection) => {
    if (isOpening || isSwitchingRef.current || total < 2) {
      return;
    }

    const nextIndex = wrapIndex(activeIndexRef.current + direction, total);

    if (nextIndex === activeIndexRef.current) {
      return;
    }

    timelineRef.current?.kill();
    gsap.killTweensOf(slideRefs.current.filter(Boolean));
    hidePlayButton();
    syncVideoPlayback(activeIndexRef.current, nextIndex);
    isSwitchingRef.current = true;
    setIsSwitching(true);
    setTransitionDirection(direction);
    setTargetIndex(nextIndex);
  };

  const snapBack = () => {
    const progressState = { value: dragProgressRef.current };

    timelineRef.current?.kill();

    const tl = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => showPlayButton(),
    });

    tl.to(
      progressState,
      {
        duration: 0.42,
        ease: "power3.out",
        onUpdate: () => {
          dragProgressRef.current = progressState.value;
          setSlidePresentation(progressState.value, activeIndexRef.current);
        },
        value: 0,
      },
      0,
    );

    timelineRef.current = tl;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isOpening || isSwitchingRef.current || total < 2) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest(".project-video-play-zone")) {
      return;
    }

    timelineRef.current?.kill();
    gsap.killTweensOf(slideRefs.current.filter(Boolean));
    const now = performance.now();

    dragStateRef.current = {
      dragged: false,
      isActive: true,
      lastTime: now,
      lastX: event.clientX,
      pointerId: event.pointerId,
      startX: event.clientX,
      step: getSlideStep(),
      velocity: 0,
    };
    dragProgressRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState.isActive || dragState.pointerId !== event.pointerId) {
      return;
    }

    const now = performance.now();
    const elapsed = Math.max(now - dragState.lastTime, 1);
    const dx = event.clientX - dragState.startX;
    const clampedDx = clamp(dx, -dragState.step * 0.95, dragState.step * 0.95);
    const progress = clamp(-clampedDx / dragState.step, -1, 1);

    dragState.velocity = (event.clientX - dragState.lastX) / elapsed;
    dragState.lastTime = now;
    dragState.lastX = event.clientX;
    const wasDragged = dragState.dragged;
    dragState.dragged = dragState.dragged || Math.abs(dx) > 4;

    if (!wasDragged && dragState.dragged) {
      setIsDragging(true);
      hidePlayButton();
    }

    dragProgressRef.current = progress;
    setSlidePresentation(progress, activeIndexRef.current);
    event.preventDefault();
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState.isActive || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragState.isActive = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!dragState.dragged) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);
    lastDragEndRef.current = Date.now();

    const progress = dragProgressRef.current;
    const shouldSwitch = Math.abs(progress) > DRAG_PROGRESS_THRESHOLD || Math.abs(dragState.velocity) > DRAG_VELOCITY_THRESHOLD;

    if (shouldSwitch) {
      const velocityDirection = dragState.velocity < 0 ? 1 : -1;
      const progressDirection = progress > 0 ? 1 : -1;
      startSwitch(Math.abs(dragState.velocity) > DRAG_VELOCITY_THRESHOLD ? velocityDirection : progressDirection);
      return;
    }

    snapBack();
  };

  const handleSlideClick = (projectIndex: number) => {
    if (Date.now() - lastDragEndRef.current < 120 || isOpening || isSwitchingRef.current) {
      return;
    }

    const offset = getRelativeOffset(projectIndex, activeIndexRef.current, total);

    if (offset < 0) {
      startSwitch(-1);
    }

    if (offset > 0) {
      startSwitch(1);
    }
  };

  const handleSlideKeyDown = (event: KeyboardEvent<HTMLDivElement>, projectIndex: number) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleSlideClick(projectIndex);
  };

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (isOpening || isSwitchingRef.current) {
      return;
    }

    const activeSlide = slideRefs.current[activeIndexRef.current];
    const stage = event.currentTarget.closest(".project-video-stage");

    if (!activeSlide && !stage) {
      return;
    }

    onOpen(activeProject, (activeSlide ?? stage)?.getBoundingClientRect() as DOMRect);
  };

  if (!activeProject) {
    return null;
  }

  return (
    <div
      className={`project-video-showcase${isSwitching ? " is-switching" : ""}${isDragging ? " is-dragging" : ""}`}
      data-active-project={activeProject.slug}
      data-switch-direction={transitionDirection}
    >
      <aside className="project-video-rail" aria-label="Project navigation">
        <div className="project-video-count" aria-label={`Project ${activeNumber} of ${totalNumber}`}>
          <span className="project-video-count-window">
            <span className="project-video-count-value" key={`count-current-${activeProject.slug}`} ref={currentCountRef}>
              {activeNumber}
            </span>
            {targetProject ? (
              <span className="project-video-count-value is-incoming" ref={incomingCountRef}>
                {targetNumber}
              </span>
            ) : null}
          </span>
          <i aria-hidden="true" />
          <span>{totalNumber}</span>
        </div>
        <div className="project-video-meta">
          <span>ACTIVE PROJECT</span>
          <div className="project-video-meta-window">
            <strong key={`meta-current-${activeProject.slug}`} ref={currentMetaRef}>
              {getProjectVideoLabel(activeProject.slug)}
            </strong>
            {targetProject ? (
              <strong className="is-incoming" ref={incomingMetaRef}>
                {getProjectVideoLabel(targetProject.slug)}
              </strong>
            ) : null}
          </div>
        </div>
        <div className="project-video-nav">
          <MagneticButton
            aria-label="Previous project"
            className="project-video-nav-button"
            disabled={isOpening || isSwitching}
            onClick={() => startSwitch(-1)}
            strength={0.34}
          >
            <ChevronLeft aria-hidden="true" size={22} />
          </MagneticButton>
          <MagneticButton
            aria-label="Next project"
            className="project-video-nav-button"
            disabled={isOpening || isSwitching}
            onClick={() => startSwitch(1)}
            strength={0.34}
          >
            <ChevronRight aria-hidden="true" size={22} />
          </MagneticButton>
        </div>
      </aside>

      <div className="project-video-stage" data-accent={activeProject.accent}>
        <div
          className="project-video-slider-viewport"
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          ref={viewportRef}
        >
          <div className="project-video-track">
            {projects.map((project, index) => {
              const isActiveSlide = index === activeIndex;
              const poster = videoPosters[index];
              const isVideoReady = readyVideoIndexes[index];

              return (
                <div
                  aria-label={
                    isActiveSlide
                      ? `Current project ${getProjectVideoLabel(project.slug)}`
                      : `Preview ${getProjectVideoLabel(project.slug)}`
                  }
                  aria-current={isActiveSlide ? "true" : undefined}
                  className={`project-video-slide${isActiveSlide ? " is-active-slot" : " is-side-slot"}`}
                  key={project.slug}
                  onClick={() => handleSlideClick(index)}
                  onKeyDown={(event) => handleSlideKeyDown(event, index)}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  role={isActiveSlide ? "img" : "button"}
                  tabIndex={isActiveSlide ? -1 : 0}
                >
                  {poster ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className="project-video-slide-poster"
                      draggable={false}
                      src={poster}
                    />
                  ) : null}
                  <video
                    autoPlay={isActiveSlide}
                    className={!isVideoReady && poster ? "is-video-waiting" : undefined}
                    loop
                    muted
                    onCanPlay={(event) => markVideoReady(event.currentTarget, index)}
                    onLoadedData={(event) => markVideoReady(event.currentTarget, index)}
                    playsInline
                    preload="metadata"
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    src={getProjectVideoSrc(project.slug)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <MagneticButton
          aria-label={`Open ${activeProject.title}`}
          className="project-video-play"
          disabled={isOpening || isSwitching || isDragging}
          onClick={handleOpen}
          ref={playZoneRef}
          strength={0.18}
          zoneClassName="project-video-play-zone"
        >
          <Play aria-hidden="true" fill="currentColor" size={28} />
        </MagneticButton>
      </div>
    </div>
  );
}
