import { useEffect, useRef, useState } from "react";
import {
  introResources,
  type SequenceDirection,
} from "../utils/sequenceResources";
import { createPlaybackClock } from "../utils/sequencePlayback";
export type IntroPlaybackDirection = SequenceDirection;
interface ProjectIntroSequenceProps {
  direction: IntroPlaybackDirection | null;
  durationMs: number;
  onComplete: (direction: IntroPlaybackDirection) => void;
  onFrame: (frame: number) => void;
  visible: boolean;
}
export default function ProjectIntroSequence({
  direction,
  durationMs,
  onComplete,
  onFrame,
  visible,
}: ProjectIntroSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onComplete, onFrame });
  callbacks.current = { onComplete, onFrame };
  const lastFrame = useRef(-1);
  const previousDirection = useRef<SequenceDirection | null>(null);
  const isVisible = useRef(visible);
  isVisible.current = visible;
  const drawRef = useRef<
    (frame: number, direction: SequenceDirection) => boolean
  >(() => false);
  const [error, setError] = useState(false);
  const failure = useRef(false);
  const retrying = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current,
      context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let width = 1,
      height = 1,
      mounted = true;
    const draw = (
      frame: number,
      playbackDirection: SequenceDirection,
      force = false,
    ) => {
      if (!force && !failure.current)
        void introResources.prepare(frame, playbackDirection).catch(() => {
          if (mounted) {
            failure.current = true;
            setError(true);
          }
        });
      const bitmap = introResources.get(frame);
      if (!bitmap) return false;
      introResources.pin(frame);
      if (frame === lastFrame.current && !force) return true;
      const ratio = width / height;
      let sw = bitmap.width,
        sh = bitmap.height,
        sx = 0,
        sy = 0;
      if (sw / sh > ratio) {
        sw = sh * ratio;
        sx = (bitmap.width - sw) / 2;
      } else {
        sh = sw / ratio;
        sy = (bitmap.height - sh) / 2;
      }
      context.clearRect(0, 0, width, height);
      context.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
      lastFrame.current = frame;
      return true;
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect(),
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      // The currently displayed bitmap stays pinned during resize and decode-window changes.
      if (lastFrame.current >= 0) {
        const bitmap = introResources.get(lastFrame.current);
        if (bitmap) draw(lastFrame.current, "forward", true);
      }
    };
    drawRef.current = draw;
    resize();
    window.addEventListener("resize", resize);
    return () => {
      mounted = false;
      drawRef.current = () => false;
      window.removeEventListener("resize", resize);
      introResources.releaseDecoded();
      lastFrame.current = -1;
    };
  }, []);
  useEffect(() => {
    if (!direction) {
      previousDirection.current = null;
      return;
    }
    let id = 0;
    const continuing =
      previousDirection.current !== null &&
      previousDirection.current !== direction &&
      lastFrame.current >= 0;
    const target =
      direction === "forward" ? lastFrame.current : 300 - lastFrame.current;
    const progress = continuing
      ? target <= 150
        ? (target / 150) * 0.28
        : 0.28 + ((target - 150) / 150) * 0.72
      : 0;
    previousDirection.current = direction;
    const clock = createPlaybackClock(direction, durationMs, progress);
    let hidden = document.hidden;
    const visibility = () => {
      hidden = document.hidden;
      clock.tick(performance.now(), () => false, true);
    };
    document.addEventListener("visibilitychange", visibility);
    const animate = (now: number) => {
      const result = clock.tick(
        now,
        (frame) => {
          if (!drawRef.current(frame, direction)) return false;
          callbacks.current.onFrame(frame);
          return true;
        },
        hidden || !isVisible.current || failure.current,
      );
      if (result.done) {
        callbacks.current.onComplete(direction);
        return;
      }
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [direction, durationMs]);
  const retry = async () => {
    if (retrying.current) return;
    retrying.current = true;
    try {
      await introResources.preload();
      await introResources.prepare(
        lastFrame.current < 0
          ? direction === "reverse"
            ? 300
            : 0
          : lastFrame.current,
        direction || "forward",
      );
      failure.current = false;
      setError(false);
    } catch {
      setError(true);
    } finally {
      retrying.current = false;
    }
  };
  return (
    <>
      <canvas
        aria-hidden="true"
        className={`project-intro-canvas${visible ? " is-visible" : ""}`}
        ref={canvasRef}
      />
      {error && visible && (
        <div
          role="alert"
          style={{
            position: "fixed",
            zIndex: 10000,
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              void retry();
            }}
          >
            过渡画面加载失败，重试
          </button>
        </div>
      )}
    </>
  );
}
