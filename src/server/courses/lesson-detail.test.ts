import assert from "node:assert/strict";
import { test } from "vitest";

import {
  fetchHasActiveSubscription,
  fetchLessonById,
  mapLessonDetailRows,
  parseLessonId,
  type LessonDetail,
} from "./lesson-detail.shared.ts";

void test("parseLessonId returns null for invalid lesson id values", () => {
  assert.equal(parseLessonId("abc"), null);
  assert.equal(parseLessonId("0"), null);
  assert.equal(parseLessonId("-1"), null);
});

void test("mapLessonDetailRows maps a video lesson into the shared LessonDetail contract", () => {
  const result = mapLessonDetailRows([
    {
      lesson: {
        id: 12,
        title: "Pengenalan Streaming",
        type: "video",
        content: "https://www.youtube.com/watch?v=abc123xyz98",
        isFree: false,
        order: 2,
      },
      chapter: {
        id: 3,
        title: "Dasar Multimedia",
        order: 1,
      },
      course: {
        id: 9,
        title: "Belajar Streaming",
        slug: "belajar-streaming",
        isFree: false,
      },
    },
  ]);

  assert.deepEqual(result, {
    id: 12,
    title: "Pengenalan Streaming",
    type: "video",
    content: "https://www.youtube.com/watch?v=abc123xyz98",
    videoUrl: "https://www.youtube.com/watch?v=abc123xyz98",
    isFree: false,
    order: 2,
    chapter: {
      id: 3,
      title: "Dasar Multimedia",
      order: 1,
    },
    course: {
      id: 9,
      title: "Belajar Streaming",
      slug: "belajar-streaming",
      isFree: false,
    },
  } satisfies LessonDetail);
});

void test("mapLessonDetailRows preserves null content when premium payload is gated", () => {
  const result = mapLessonDetailRows([
    {
      lesson: {
        id: 15,
        title: "Premium Video",
        type: "video",
        content: null,
        isFree: false,
        order: 4,
      },
      chapter: {
        id: 6,
        title: "Monetization",
        order: 2,
      },
      course: {
        id: 4,
        title: "Creator Economy",
        slug: "creator-economy",
        isFree: false,
      },
    },
  ]);

  assert.deepEqual(result, {
    id: 15,
    title: "Premium Video",
    type: "video",
    content: null,
    videoUrl: null,
    isFree: false,
    order: 4,
    chapter: {
      id: 6,
      title: "Monetization",
      order: 2,
    },
    course: {
      id: 4,
      title: "Creator Economy",
      slug: "creator-economy",
      isFree: false,
    },
  } satisfies LessonDetail);
});

void test("fetchLessonById returns null when lesson does not belong to the requested course slug", async () => {
  const lesson = await fetchLessonById(async () => [], "12", "slug-salah");
  assert.equal(lesson, null);
});

void test("fetchLessonById returns null for a non-existent lesson id", async () => {
  const lesson = await fetchLessonById(async () => [], "99999", "belajar-streaming");
  assert.equal(lesson, null);
});

void test("fetchLessonById returns null when the parent course is not published", async () => {
  const lesson = await fetchLessonById(async () => [], "12", "draft-course");
  assert.equal(lesson, null);
});

void test("fetchHasActiveSubscription returns true when an active subscription exists", async () => {
  const hasActiveSubscription = await fetchHasActiveSubscription(
    {
      findFirst: async () => ({ id: 99 }),
    },
    "user-1",
  );

  assert.equal(hasActiveSubscription, true);
});

void test("fetchHasActiveSubscription returns false when no active subscription exists", async () => {
  const hasActiveSubscription = await fetchHasActiveSubscription(
    {
      findFirst: async () => undefined,
    },
    "user-1",
  );

  assert.equal(hasActiveSubscription, false);
});
