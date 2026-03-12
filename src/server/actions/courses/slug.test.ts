import assert from "node:assert/strict";
import { test } from "vitest";

import {
  generateUniquePublishedCourseSlug,
  isDraftCourseSlug,
  slugifyCourseTitle,
} from "./slug.ts";

void test("slugifyCourseTitle normalizes a human-friendly course slug", () => {
  assert.equal(slugifyCourseTitle("  Belajar Néxt.js & AI dari Nol!  "), "belajar-next-js-ai-dari-nol");
});

void test("slugifyCourseTitle falls back when title has no slug characters", () => {
  assert.equal(slugifyCourseTitle("🔥🔥🔥"), "course");
});

void test("isDraftCourseSlug detects draft lifecycle slugs", () => {
  assert.equal(isDraftCourseSlug("draft-123"), true);
  assert.equal(isDraftCourseSlug("published-course"), false);
});

void test("generateUniquePublishedCourseSlug appends numeric suffixes for collisions", async () => {
  const slug = await generateUniquePublishedCourseSlug({
    courseId: 12,
    title: "Belajar Next JS",
    isSlugTaken: async (candidateSlug) =>
      candidateSlug === "belajar-next-js" || candidateSlug === "belajar-next-js-2",
  });

  assert.equal(slug, "belajar-next-js-3");
});
