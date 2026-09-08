import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("hands the fully covered wave off to an opaque project layer without a background fade", async () => {
  const stylesheet = await readFile(new URL("../src/styles/components.css", import.meta.url), "utf8");
  const projectLayerRule = stylesheet.match(/\.project-intro-project-layer \{([\s\S]*?)\n\}/)?.[1] ?? "";

  assert.doesNotMatch(projectLayerRule, /transition:\s*background-color/i);
  assert.match(stylesheet, /\.project-intro-project-layer\.is-interactive \{[\s\S]*?background:\s*#000000;/);
});
