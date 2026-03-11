import assert from "node:assert/strict";
import { test } from "vitest";

import { getChaptersByCourseIdFromQuery, type ChapterRow } from "./chapters.shared.ts";

function createChapterRow(id: number): ChapterRow {
  return {
    id,
    courseId: 5,
    title: `Chapter ${id}`,
    description: null,
    order: id,
    lessonCount: id + 1,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
  };
}

void test("invalid courseId returns empty array", async () => {
  let called = false;

  const result = await getChaptersByCourseIdFromQuery(NaN, async () => {
    called = true;
    return [createChapterRow(1)];
  });

  assert.deepEqual(result, []);
  assert.equal(called, false);
});

void test("valid courseId calls query with parsed integer", async () => {
  let receivedCourseId = 0;

  const result = await getChaptersByCourseIdFromQuery(5, async (courseId) => {
    receivedCourseId = courseId;
    return [createChapterRow(1)];
  });

  assert.equal(receivedCourseId, 5);
  assert.deepEqual(result, [createChapterRow(1)]);
});

void test("chapter rows carry lessonCount metadata from the query", async () => {
  const result = await getChaptersByCourseIdFromQuery(5, async () => [
    createChapterRow(2),
  ]);

  assert.equal(result[0]?.lessonCount, 3);
});
