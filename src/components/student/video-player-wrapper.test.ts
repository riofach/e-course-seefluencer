import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "vitest";

import { normalizeYouTubeUrl } from "./video-player-wrapper.helpers.ts";

void test("normalizeYouTubeUrl converts standard watch URLs into embed URLs", () => {
  assert.equal(
    normalizeYouTubeUrl("https://www.youtube.com/watch?v=abc123xyz98"),
    "https://www.youtube.com/embed/abc123xyz98",
  );
});

void test("normalizeYouTubeUrl preserves existing embed URLs", () => {
  assert.equal(
    normalizeYouTubeUrl("https://www.youtube.com/embed/abc123xyz98"),
    "https://www.youtube.com/embed/abc123xyz98",
  );
});

void test("normalizeYouTubeUrl supports youtube-nocookie.com domains", () => {
  assert.equal(
    normalizeYouTubeUrl("https://www.youtube-nocookie.com/embed/abc123xyz98"),
    "https://www.youtube-nocookie.com/embed/abc123xyz98",
  );
  assert.equal(
    normalizeYouTubeUrl("https://www.youtube-nocookie.com/watch?v=abc123xyz98"),
    "https://www.youtube.com/embed/abc123xyz98",
  );
});

void test("video player wrapper renders a lazy iframe inside an aspect-video container", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/video-player-wrapper.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /loading="lazy"/);
  assert.match(contents, /allowFullScreen/);
  assert.match(contents, /aspect-video w-full/);
  assert.match(contents, /title=\{title\}/);
  assert.match(contents, /border-\[#2A2A3C\]/);
});
