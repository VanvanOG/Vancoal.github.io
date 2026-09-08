import { introFrameAtProgress } from "./introTimeline.mjs";
import type { SequenceDirection } from "./sequenceResources";
/** Commit logical time only when the exact target can be drawn. */
export function createPlaybackClock(
  direction: SequenceDirection,
  durationMs: number,
  initialProgress = 0,
) {
  let elapsed = initialProgress * durationMs;
  let previous: number | null = null;
  let frame = introFrameAtProgress(initialProgress, direction);
  let pendingElapsed: number | null = null;
  return {
    tick(now: number, draw: (frame: number) => boolean, paused = false) {
      const delta = previous === null ? 0 : Math.max(0, now - previous);
      previous = now;
      if (paused) return { frame, done: false, progress: elapsed / durationMs };
      const candidate = pendingElapsed ?? Math.min(durationMs, elapsed + delta);
      const target = introFrameAtProgress(candidate / durationMs, direction);
      if (draw(target)) {
        elapsed = candidate;
        frame = target;
        pendingElapsed = null;
      } else pendingElapsed = candidate;
      return {
        frame,
        done: elapsed >= durationMs,
        progress: elapsed / durationMs,
      };
    },
  };
}
