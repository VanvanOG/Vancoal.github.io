export const INTRO_FRAME_COUNT: number;
export const INTRO_LAST_FRAME: number;
export const WAVE_START_FRAME: number;
export const PROJECT_REVEAL_FRAME: number;
export const PROJECT_WAVE_SETTINGS: {
  amplitude: number;
  lobeHeights: number[];
  smoothness: number;
  speed: number;
  startLobes: number;
  endLobes: number;
};

export function frameAtProgress(progress: number, direction?: "forward" | "reverse"): number;
export function introFrameAtProgress(progress: number, direction?: "forward" | "reverse"): number;
export function waveProgressAtFrame(frame: number): number;
export function waveShapeAt(progress: number, elapsedSeconds: number): {
  lobeCount: number;
  points: Array<{ x: number; y: number }>;
};
export function introUiState(frame: number): {
  projectInteractive: boolean;
  projectVisible: boolean;
};
export function shouldMountProjectLayer(
  activeIndex: number,
  phase: "hero" | "align" | "intro-forward" | "projects" | "intro-reverse" | "return-settling",
  projectPanelEntering: boolean,
): boolean;
export function panelTransitionMode(currentIndex: number, nextIndex: number): "intro-forward" | "page-scroll";
