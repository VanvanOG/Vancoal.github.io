import { useEffect, useRef } from "react";
import { introFrameAtProgress, INTRO_FRAME_COUNT } from "../utils/introTimeline.mjs";
import { publicPath } from "../utils/publicPath";

export type IntroPlaybackDirection = "forward" | "reverse";

interface ProjectIntroSequenceProps {
  direction: IntroPlaybackDirection | null;
  durationMs: number;
  onComplete: (direction: IntroPlaybackDirection) => void;
  onFrame: (frame: number) => void;
  visible: boolean;
}

const INTRO_FRAME_SOURCES = Array.from(
  { length: INTRO_FRAME_COUNT },
  (_, index) => publicPath(`/media/project-intro-frames/project-intro-${String(index).padStart(3, "0")}.webp`),
);
const INTRO_MANIFEST_SOURCE = publicPath("/media/project-intro-frames/manifest.json");

const DPR_CAP = 1.5;

export default function ProjectIntroSequence({ direction, durationMs, onComplete, onFrame, visible }: ProjectIntroSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawFrameRef = useRef<(frame: number, playbackDirection: IntroPlaybackDirection) => void>(() => undefined);
  const onCompleteRef = useRef(onComplete);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    const frames: Array<HTMLImageElement | null> = new Array(INTRO_FRAME_COUNT).fill(null);
    const loading = new Set<number>();
    const loaded = new Set<number>();
    let cssWidth = 1;
    let cssHeight = 1;
    let lastDrawnFrame = -1;
    let mounted = true;

    void fetch(INTRO_MANIFEST_SOURCE)
      .then((response) => response.json() as Promise<{ frameCount?: number; width?: number; height?: number }>)
      .then((manifest) => {
        if (!mounted) return;

        if (manifest.frameCount !== INTRO_FRAME_COUNT || manifest.width !== 1600 || manifest.height !== 900) {
          console.warn("Project intro frame manifest does not match the player configuration.");
        }
      })
      .catch(() => {
        console.warn("Project intro frame manifest could not be read.");
      });

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

    const loadFrame = (frame: number) => {
      if (frame < 0 || frame >= INTRO_FRAME_COUNT || loading.has(frame) || loaded.has(frame)) {
        return;
      }

      loading.add(frame);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (!mounted) {
          return;
        }

        frames[frame] = image;
        loaded.add(frame);
        loading.delete(frame);
      };
      image.onerror = () => {
        loading.delete(frame);
      };
      image.src = INTRO_FRAME_SOURCES[frame];
    };

    const findNearestLoaded = (frame: number, playbackDirection: IntroPlaybackDirection) => {
      const target = Math.max(0, Math.min(INTRO_FRAME_COUNT - 1, frame));

      if (loaded.has(target)) {
        return target;
      }

      for (let offset = 1; offset < INTRO_FRAME_COUNT; offset += 1) {
        const preferred = playbackDirection === "forward" ? target - offset : target + offset;
        const fallback = playbackDirection === "forward" ? target + offset : target - offset;

        if (preferred >= 0 && preferred < INTRO_FRAME_COUNT && loaded.has(preferred)) {
          return preferred;
        }

        if (fallback >= 0 && fallback < INTRO_FRAME_COUNT && loaded.has(fallback)) {
          return fallback;
        }
      }

      return null;
    };

    const drawFrame = (frame: number, playbackDirection: IntroPlaybackDirection) => {
      const nearest = findNearestLoaded(frame, playbackDirection);

      if (nearest === null || nearest === lastDrawnFrame) {
        return;
      }

      const image = frames[nearest];

      if (!image) {
        return;
      }

      drawCover(image);
      lastDrawnFrame = nearest;
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
      drawFrame(0, "forward");
    };

    const priorityFrames = [0, 1, 2, 150, 260, INTRO_FRAME_COUNT - 1];
    priorityFrames.forEach(loadFrame);

    let preloadCursor = 0;
    let preloadActive = 0;
    const maxConcurrentPreloads = 5;

    const pumpPreload = () => {
      while (mounted && preloadActive < maxConcurrentPreloads && preloadCursor < INTRO_FRAME_COUNT) {
        const frame = preloadCursor;
        preloadCursor += 1;

        if (loading.has(frame) || loaded.has(frame)) {
          continue;
        }

        preloadActive += 1;
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          if (mounted) {
            frames[frame] = image;
            loaded.add(frame);
          }

          loading.delete(frame);
          preloadActive -= 1;
          pumpPreload();
        };
        image.onerror = () => {
          loading.delete(frame);
          preloadActive -= 1;
          pumpPreload();
        };
        loading.add(frame);
        image.src = INTRO_FRAME_SOURCES[frame];
      }
    };

    drawFrameRef.current = drawFrame;
    resize();
    pumpPreload();
    window.addEventListener("resize", resize);

    return () => {
      mounted = false;
      drawFrameRef.current = () => undefined;
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (!direction) {
      return undefined;
    }

    let frameId = 0;
    let finished = false;
    const startedAt = performance.now();
    const initialFrame = direction === "forward" ? 0 : INTRO_FRAME_COUNT - 1;

    drawFrameRef.current(initialFrame, direction);
    onFrameRef.current(initialFrame);

    const animate = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - startedAt) / durationMs));
      const frame = introFrameAtProgress(progress, direction);
      drawFrameRef.current(frame, direction);
      onFrameRef.current(frame);

      if (progress >= 1) {
        if (!finished) {
          finished = true;
          onCompleteRef.current(direction);
        }

        return;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [direction, durationMs]);

  return <canvas aria-hidden="true" className={`project-intro-canvas${visible ? " is-visible" : ""}`} ref={canvasRef} />;
}
