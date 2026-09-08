export interface WaveSettings {
  startLobes: number;
  endLobes: number;
  progress: number;
  elapsedSeconds: number;
  amplitude: number;
  speed: number;
  smoothness: number;
  lobeHeights: number[];
}

export interface WavePoint {
  x: number;
  y: number;
}

export const DEFAULT_WAVE_SETTINGS: WaveSettings;

export function sampleWavePoints(settings: WaveSettings): {
  lobeCount: number;
  points: WavePoint[];
};

export function createSmoothWavePath(
  baseX: number,
  points: WavePoint[],
  smoothness: number,
): string;
