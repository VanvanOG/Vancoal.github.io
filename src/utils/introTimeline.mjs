export const INTRO_FRAME_COUNT = 301;
export const INTRO_LAST_FRAME = INTRO_FRAME_COUNT - 1;
export const WAVE_START_FRAME = 150;
export const PROJECT_REVEAL_FRAME = 260;
export const PROJECT_WAVE_SETTINGS = {
  amplitude: 120,
  lobeHeights: [0.87, 0.42, 1.14],
  smoothness: 0.75,
  speed: 1.05,
  startLobes: 1.47,
  endLobes: 3,
};

/**
 * @param {number} progress
 * @param {"forward" | "reverse"} [direction]
 */
export function frameAtProgress(progress, direction = "forward") {
  const normalized = Math.min(Math.max(progress, 0), 1);
  const frame = Math.round(normalized * INTRO_LAST_FRAME);

  return direction === "reverse" ? INTRO_LAST_FRAME - frame : frame;
}

/**
 * Four-second project introduction pacing: the first visual beat reaches
 * frame 150 in the first 28% of elapsed time, then lets the wipe finish.
 *
 * @param {number} progress
 * @param {"forward" | "reverse"} [direction]
 */
export function introFrameAtProgress(progress, direction = "forward") {
  const normalized = Math.min(Math.max(progress, 0), 1);
  const firstBeatDuration = 0.28;
  const firstBeatFrame = 150;
  const forwardFrame = normalized <= firstBeatDuration
    ? Math.round((normalized / firstBeatDuration) * firstBeatFrame)
    : Math.round(firstBeatFrame + ((normalized - firstBeatDuration) / (1 - firstBeatDuration)) * (INTRO_LAST_FRAME - firstBeatFrame));

  return direction === "reverse" ? INTRO_LAST_FRAME - forwardFrame : forwardFrame;
}

/** @param {number} frame */
export function waveProgressAtFrame(frame) {
  const normalizedFrame = Math.min(Math.max(frame, WAVE_START_FRAME), INTRO_LAST_FRAME);
  return (normalizedFrame - WAVE_START_FRAME) / (INTRO_LAST_FRAME - WAVE_START_FRAME);
}

/**
 * Samples one continuous wave edge. Its spatial frequency expands from two
 * broad lobes to three narrower lobes as the black panel takes over.
 *
 * @param {number} progress
 * @param {number} elapsedSeconds
 */
export function waveShapeAt(progress, elapsedSeconds) {
  return sampleWavePoints({
    ...PROJECT_WAVE_SETTINGS,
    progress,
    elapsedSeconds,
  });
}

/** @param {number} frame */
export function introUiState(frame) {
  const normalizedFrame = Math.min(Math.max(frame, 0), INTRO_LAST_FRAME);
  const projectVisible = normalizedFrame >= PROJECT_REVEAL_FRAME;

  return {
    projectInteractive: normalizedFrame === INTRO_LAST_FRAME,
    projectVisible,
  };
}

/**
 * The project presentation is fixed-position. Keep it out of the way until
 * the full-page track has completed a contact-to-project return scroll.
 *
 * @param {number} activeIndex
 * @param {"hero" | "align" | "intro-forward" | "projects" | "intro-reverse" | "return-settling"} phase
 * @param {boolean} projectPanelEntering
 */
export function shouldMountProjectLayer(activeIndex, phase, projectPanelEntering) {
  return activeIndex === 1
    && !projectPanelEntering
    && (phase === "intro-forward" || phase === "projects");
}

/** @param {number} currentIndex @param {number} nextIndex */
export function panelTransitionMode(currentIndex, nextIndex) {
  return currentIndex === 0 && nextIndex === 1 ? "intro-forward" : "page-scroll";
}
import { sampleWavePoints } from "../../tools/wave-playground/wave-playground-model.mjs";
