import { useEffect, useState } from "react";
import { createSmoothWavePath, sampleWavePoints } from "../../tools/wave-playground/wave-playground-model.mjs";
import { PROJECT_WAVE_SETTINGS } from "../utils/introTimeline.mjs";

interface ProjectWaveWipeProps {
  progress: number;
  visible: boolean;
}

export default function ProjectWaveWipe({ progress, visible }: ProjectWaveWipeProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!visible) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      setElapsedSeconds((now - startedAt) / 1000);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [visible]);

  const normalizedProgress = Math.min(1, Math.max(0, progress * 1.36));
  const baseX = 2240 - normalizedProgress * 2480;
  const { points } = sampleWavePoints({
    ...PROJECT_WAVE_SETTINGS,
    progress: normalizedProgress,
    elapsedSeconds,
  });
  const path = createSmoothWavePath(baseX, points, PROJECT_WAVE_SETTINGS.smoothness);

  return (
    <svg
      aria-hidden="true"
      className={`project-wave-wipe${visible ? " is-visible" : ""}`}
      preserveAspectRatio="none"
      viewBox="0 0 1920 1080"
    >
      <path d={path} fill="#000000" />
    </svg>
  );
}
