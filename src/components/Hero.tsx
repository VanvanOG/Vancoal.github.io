import { useEffect, useRef } from "react";
import { profile } from "../data/profile";
import { publicPath } from "../utils/publicPath";
import ControllerHints from "./ControllerHints";

const HERO_FRAME_COUNT = 98;
const HERO_FRAME_SOURCES = Array.from(
  { length: HERO_FRAME_COUNT },
  (_, index) => publicPath(`/media/hero-frames/hero-frame-${String(index + 1).padStart(3, "0")}.jpg`),
);
const FRAME_SCRUB_EASE = 0.18;
const DPR_CAP = 1.5;

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetFrameRef = useRef((HERO_FRAME_COUNT - 1) / 2);
  const currentFrameRef = useRef((HERO_FRAME_COUNT - 1) / 2);
  const hasPointerRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    const images: Array<HTMLImageElement | null> = new Array(HERO_FRAME_COUNT).fill(null);
    const loading = new Set<number>();
    const loaded = new Set<number>();
    let frameId = 0;
    let mounted = true;
    let cssWidth = 1;
    let cssHeight = 1;
    let lastDrawnFrame = -1;
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const drawCover = (image: HTMLImageElement) => {
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const canvasRatio = cssWidth / cssHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (imageRatio > canvasRatio) {
        sourceWidth = image.naturalHeight * canvasRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / canvasRatio;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      context.clearRect(0, 0, cssWidth, cssHeight);
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cssWidth, cssHeight);
    };

    const findNearestLoadedFrame = (frame: number) => {
      const clampedFrame = Math.max(0, Math.min(HERO_FRAME_COUNT - 1, frame));

      if (loaded.has(clampedFrame)) {
        return clampedFrame;
      }

      for (let offset = 1; offset < HERO_FRAME_COUNT; offset += 1) {
        const left = clampedFrame - offset;
        const right = clampedFrame + offset;

        if (left >= 0 && loaded.has(left)) {
          return left;
        }

        if (right < HERO_FRAME_COUNT && loaded.has(right)) {
          return right;
        }
      }

      return null;
    };

    const drawNearestFrame = (frame: number) => {
      const nearestFrame = findNearestLoadedFrame(Math.round(frame));

      if (nearestFrame === null || nearestFrame === lastDrawnFrame) {
        return;
      }

      const image = images[nearestFrame];

      if (!image) {
        return;
      }

      drawCover(image);
      lastDrawnFrame = nearestFrame;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      lastDrawnFrame = -1;
      drawNearestFrame(currentFrameRef.current);
    };

    const loadFrame = (frame: number) => {
      if (frame < 0 || frame >= HERO_FRAME_COUNT || loaded.has(frame) || loading.has(frame)) {
        return;
      }

      loading.add(frame);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!mounted) {
          return;
        }

        images[frame] = image;
        loaded.add(frame);
        loading.delete(frame);
        drawNearestFrame(currentFrameRef.current);
      };
      image.onerror = () => {
        loading.delete(frame);
      };
      image.src = HERO_FRAME_SOURCES[frame];
    };

    const loadNearbyFrames = (frame: number) => {
      for (let offset = 0; offset <= 3; offset += 1) {
        loadFrame(Math.round(frame) - offset);
        loadFrame(Math.round(frame) + offset);
      }
    };

    const preloadFrames = () => {
      const middleFrame = Math.round((HERO_FRAME_COUNT - 1) / 2);
      const priorityFrames = [middleFrame, 0, HERO_FRAME_COUNT - 1];
      priorityFrames.forEach(loadFrame);

      const remainingFrames = Array.from({ length: HERO_FRAME_COUNT }, (_, index) => index)
        .filter((frame) => !priorityFrames.includes(frame))
        .sort((a, b) => Math.abs(a - middleFrame) - Math.abs(b - middleFrame));

      let cursor = 0;
      let active = 0;
      const maxConcurrentLoads = 4;

      const pump = () => {
        if (!mounted) {
          return;
        }

        while (active < maxConcurrentLoads && cursor < remainingFrames.length) {
          const frame = remainingFrames[cursor];
          cursor += 1;

          if (loaded.has(frame) || loading.has(frame)) {
            continue;
          }

          active += 1;
          loading.add(frame);
          const image = new Image();
          image.decoding = "async";
          image.onload = () => {
            if (mounted) {
              images[frame] = image;
              loaded.add(frame);
              drawNearestFrame(currentFrameRef.current);
            }

            loading.delete(frame);
            active -= 1;
            pump();
          };
          image.onerror = () => {
            loading.delete(frame);
            active -= 1;
            pump();
          };
          image.src = HERO_FRAME_SOURCES[frame];
        }
      };

      pump();
    };

    const syncTargetFromX = (x: number) => {
      const progress = Math.max(0, Math.min(1, x / window.innerWidth));
      targetFrameRef.current = progress * (HERO_FRAME_COUNT - 1);
      hasPointerRef.current = true;
      loadNearbyFrames(targetFrameRef.current);
    };

    const onPointerMove = (event: PointerEvent) => {
      syncTargetFromX(event.clientX);
    };

    const animate = (time: number) => {
      if (!mounted) {
        return;
      }

      if (coarsePointer.matches && !hasPointerRef.current) {
        const centerFrame = (HERO_FRAME_COUNT - 1) / 2;
        targetFrameRef.current = centerFrame + Math.sin(time * 0.00045) * 3;
      }

      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * FRAME_SCRUB_EASE;
      drawNearestFrame(currentFrameRef.current);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    preloadFrames();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize);

    frameId = window.requestAnimationFrame(animate);

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-video-layer" aria-hidden="true">
        <canvas ref={canvasRef} className="hero-frame-canvas" />
      </div>

      <div className="hero-inner page-shell">
        <div className="hero-copy">
          <span className="section-kicker hero-reveal hero-reveal-1">
            <span className="kicker-line" />
            Portfolio System
          </span>
          <h1 id="hero-title" className="hero-reveal hero-reveal-2">VANCOAL</h1>
          <p className="hero-role hero-reveal hero-reveal-3">{profile.role}</p>
          <p className="hero-lead hero-reveal hero-reveal-4">{profile.headline}</p>
        </div>

        <aside className="hero-status" aria-label="Portfolio status">
          <dl>
            <div className="hero-reveal hero-reveal-5">
              <dt>ROLE</dt>
              <dd>AI + GAME UX</dd>
            </div>
            <div className="hero-reveal hero-reveal-6">
              <dt>FOCUS</dt>
              <dd>SYSTEM / AI / DATA</dd>
            </div>
            <div className="hero-reveal hero-reveal-7">
              <dt>MODE</dt>
              <dd>PORTFOLIO BASE</dd>
            </div>
          </dl>
        </aside>
      </div>

      <ControllerHints left="SCROLL TO PROJECTS" right="CONTACT BY MAIL" />
    </section>
  );
}
