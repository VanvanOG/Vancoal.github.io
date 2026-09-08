import assert from "node:assert/strict";
import test from "node:test";
import { sampleWavePoints } from "../tools/wave-playground/wave-playground-model.mjs";
import { frameAtProgress, introFrameAtProgress, introUiState, panelTransitionMode, PROJECT_WAVE_SETTINGS, shouldMountProjectLayer, waveProgressAtFrame, waveShapeAt } from "../src/utils/introTimeline.mjs";

test("maps the 301-frame forward sequence across its inclusive endpoints", () => {
  assert.equal(frameAtProgress(0), 0);
  assert.equal(frameAtProgress(0.5), 150);
  assert.equal(frameAtProgress(1), 300);
});

test("maps reverse playback back to the matching forward frames", () => {
  assert.equal(frameAtProgress(0, "reverse"), 300);
  assert.equal(frameAtProgress(0.5, "reverse"), 150);
  assert.equal(frameAtProgress(1, "reverse"), 0);
});

test("reaches the surprise frame early during the four-second intro", () => {
  assert.equal(introFrameAtProgress(0), 0);
  assert.equal(introFrameAtProgress(0.28), 150);
  assert.ok(introFrameAtProgress(0.5) > 150);
  assert.equal(introFrameAtProgress(1), 300);
});

test("starts the wave at frame 150 and reveals project controls at frame 260", () => {
  assert.equal(waveProgressAtFrame(149), 0);
  assert.equal(waveProgressAtFrame(150), 0);
  assert.equal(waveProgressAtFrame(225), 0.5);
  assert.equal(waveProgressAtFrame(300), 1);

  assert.deepEqual(introUiState(259), { projectInteractive: false, projectVisible: false });
  assert.deepEqual(introUiState(260), { projectInteractive: false, projectVisible: true });
  assert.deepEqual(introUiState(300), { projectInteractive: true, projectVisible: true });
});

test("uses the approved asymmetric wave profile at the same progress as the playground", () => {
  const early = waveShapeAt(0, 0.25);
  const previewAtPointTwentyTwo = waveShapeAt(0.22, 0.25);

  assert.equal(early.lobeCount, 1.47);
  assert.equal(previewAtPointTwentyTwo.lobeCount, 1.8066);
  assert.equal(early.points.length, 31);
  assert.equal(early.points[0].y, 0);
  assert.equal(early.points.at(-1)?.y, 1080);
  assert.notDeepEqual(waveShapeAt(0.5, 0), waveShapeAt(0.5, 0.3));
  assert.deepEqual(PROJECT_WAVE_SETTINGS.lobeHeights, [0.87, 0.42, 1.14]);
});

test("uses the exact same wave samples as the playground", () => {
  const progress = 0.22;
  const elapsedSeconds = 0.3;
  const expected = sampleWavePoints({
    ...PROJECT_WAVE_SETTINGS,
    progress,
    elapsedSeconds,
  });

  assert.deepEqual(waveShapeAt(progress, elapsedSeconds), expected);
});

test("keeps the fixed project layer hidden while returning from contact to projects", () => {
  assert.equal(shouldMountProjectLayer(1, "projects", true), false);
  assert.equal(shouldMountProjectLayer(1, "projects", false), true);
  assert.equal(shouldMountProjectLayer(2, "projects", false), false);
});

test("uses the frame intro only when entering projects from the homepage", () => {
  assert.equal(panelTransitionMode(0, 1), "intro-forward");
  assert.equal(panelTransitionMode(1, 0), "page-scroll");
  assert.equal(panelTransitionMode(2, 1), "page-scroll");
});
