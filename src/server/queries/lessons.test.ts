import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getLessonByIdFromQuery,
  getLessonsByChapterIdFromQuery,
  getLessonsByCourseIdFromQuery,
  type LessonRow,
} from "./lessons.shared.ts";

function createLessonRow(id: number, chapterId = 5): LessonRow {
  return {
    id,
    chapterId,
    title: `Lesson ${id}`,
    type: "video",
    content: null,
    isFree: false,
    order: id,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
  };
}

void test("invalid chapterId returns empty array", async () => {
  let called = false;

  const result = await getLessonsByChapterIdFromQuery(NaN, async () => {
    called = true;
    return [createLessonRow(1)];
  });

  assert.deepEqual(result, []);
  assert.equal(called, false);
});

void test("valid chapterId calls query with parsed integer", async () => {
  let receivedChapterId = 0;

  const result = await getLessonsByChapterIdFromQuery(5, async (chapterId) => {
    receivedChapterId = chapterId;
    return [createLessonRow(1)];
  });

  assert.equal(receivedChapterId, 5);
  assert.deepEqual(result, [createLessonRow(1)]);
});

void test("invalid courseId returns empty lesson map", async () => {
  let called = false;

  const result = await getLessonsByCourseIdFromQuery(0, async () => {
    called = true;
    return { 5: [createLessonRow(1)] };
  });

  assert.deepEqual(result, {});
  assert.equal(called, false);
});

void test("valid courseId returns grouped lesson map", async () => {
  let receivedCourseId = 0;

  const result = await getLessonsByCourseIdFromQuery(8, async (courseId) => {
    receivedCourseId = courseId;
    return {
      5: [createLessonRow(1, 5), createLessonRow(2, 5)],
      9: [createLessonRow(3, 9)],
    };
  });

  assert.equal(receivedCourseId, 8);
  assert.deepEqual(result, {
    5: [createLessonRow(1, 5), createLessonRow(2, 5)],
    9: [createLessonRow(3, 9)],
  });
});

void test("invalid lessonId returns null", async () => {
  let called = false;

  const result = await getLessonByIdFromQuery(0, async () => {
    called = true;
    return createLessonRow(1);
  });

  assert.equal(result, null);
  assert.equal(called, false);
});

void test("valid lessonId returns lesson row", async () => {
  let receivedLessonId = 0;

  const result = await getLessonByIdFromQuery(6, async (lessonId) => {
    receivedLessonId = lessonId;
    return createLessonRow(6, 2);
  });

  assert.equal(receivedLessonId, 6);
  assert.deepEqual(result, createLessonRow(6, 2));
});
