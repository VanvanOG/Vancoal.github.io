import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WAVE_SETTINGS, sampleWavePoints } from "../tools/wave-playground/wave-playground-model.mjs";

test("creates an asymmetric smooth wave that grows from two lobes to three", () => {
  const initial = sampleWavePoints({ ...DEFAULT_WAVE_SETTINGS, progress: 0, elapsedSeconds: 0 });
  const final = sampleWavePoints({ ...DEFAULT_WAVE_SETTINGS, progress: 1, elapsedSeconds: 0 });
  const middle = sampleWavePoints({ ...DEFAULT_WAVE_SETTINGS, progress: 0.5, elapsedSeconds: 0.2 });

  assert.equal(initial.lobeCount, 2);
  assert.equal(final.lobeCount, 3);
  assert.equal(middle.points.length, 31);
  assert.equal(middle.points[0].y, 0);
  assert.equal(middle.points.at(-1)?.y, 1080);
  assert.notDeepEqual(DEFAULT_WAVE_SETTINGS.lobeHeights, [1, 1, 1]);
  assert.ok(DEFAULT_WAVE_SETTINGS.smoothness >= 0.7);
});
