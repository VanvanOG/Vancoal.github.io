const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

export const DEFAULT_WAVE_SETTINGS = {
  startLobes: 2,
  endLobes: 3,
  progress: 0.5,
  elapsedSeconds: 0,
  amplitude: 148,
  speed: 0.78,
  smoothness: 0.88,
  lobeHeights: [0.66, 1, 0.76],
};

function lobeHeightAt(position, lobeHeights) {
  const scaled = clamp(position, 0, 1) * (lobeHeights.length - 1);
  const before = Math.floor(scaled);
  const after = Math.min(lobeHeights.length - 1, before + 1);
  const mix = scaled - before;

  return lobeHeights[before] + (lobeHeights[after] - lobeHeights[before]) * mix;
}

/**
 * Generates a continuous vertical wave contour for the standalone preview.
 * The spatial frequency grows smoothly from the chosen start lobe count to
 * the chosen end lobe count.
 */
export function sampleWavePoints(settings) {
  const progress = clamp(settings.progress, 0, 1);
  const lobeCount = settings.startLobes + (settings.endLobes - settings.startLobes) * progress;
  const envelope = Math.sin(progress * Math.PI);
  const phase = settings.elapsedSeconds * Math.PI * 2 * settings.speed;
  const pointCount = 31;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const ratio = index / (pointCount - 1);
    const edgeWeight = 0.72 + Math.sin(ratio * Math.PI) * 0.28;
    const lobeHeight = lobeHeightAt(ratio, settings.lobeHeights);
    const offset = 56 + Math.sin(ratio * Math.PI * 2 * lobeCount + phase)
      * settings.amplitude * envelope * edgeWeight * lobeHeight;

    return {
      x: Math.round(offset * 100) / 100,
      y: Math.round(ratio * 1080 * 100) / 100,
    };
  });

  return { lobeCount, points };
}

export function createSmoothWavePath(baseX, points, smoothness) {
  const tension = clamp(smoothness, 0.35, 1) / 6;
  const segments = [`M ${baseX + points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const following = points[Math.min(points.length - 1, index + 2)];
    const controlOneX = baseX + current.x + (next.x - previous.x) * tension;
    const controlOneY = current.y + (next.y - previous.y) * tension;
    const controlTwoX = baseX + next.x - (following.x - current.x) * tension;
    const controlTwoY = next.y - (following.y - current.y) * tension;

    segments.push(`C ${controlOneX} ${controlOneY} ${controlTwoX} ${controlTwoY} ${baseX + next.x} ${next.y}`);
  }

  segments.push("H 1920 V 0 Z");
  return segments.join(" ");
}
