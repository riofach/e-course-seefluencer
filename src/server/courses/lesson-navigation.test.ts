import assert from "node:assert/strict";
import { test } from "vitest";

import {
  calculateProgressPercent,
  getAdjacentLessonsFromSortedList,
  mapProgressToCompletedIds,
} from "./lesson-navigation.shared.ts";

void test("getAdjacentLessonsFromSortedList returns previous and next lessons for a middle lesson", () => {
  const result = getAdjacentLessonsFromSortedList(
    [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 },
    ],
    2,
  );

  assert.deepEqual(result, {
    prevLesson: { id: 1 },
    nextLesson: { id: 3 },
  });
});

void test("getAdjacentLessonsFromSortedList returns null prev for the first lesson", () => {
  const result = getAdjacentLessonsFromSortedList(
    [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 },
    ],
    1,
  );

  assert.deepEqual(result, {
    prevLesson: null,
    nextLesson: { id: 2 },
  });
});

void test("getAdjacentLessonsFromSortedList returns null next for the last lesson", () => {
  const result = getAdjacentLessonsFromSortedList(
    [
      { id: 1, order: 1 },
      { id: 2, order: 2 },
      { id: 3, order: 3 },
    ],
    3,
  );

  assert.deepEqual(result, {
    prevLesson: { id: 2 },
    nextLesson: null,
  });
});

void test("getAdjacentLessonsFromSortedList returns null on both sides for a single lesson", () => {
  const result = getAdjacentLessonsFromSortedList([{ id: 1, order: 1 }], 1);

  assert.deepEqual(result, {
    prevLesson: null,
    nextLesson: null,
  });
});

void test("getAdjacentLessonsFromSortedList returns null on both sides for an empty list", () => {
  const result = getAdjacentLessonsFromSortedList([], 1);

  assert.deepEqual(result, {
    prevLesson: null,
    nextLesson: null,
  });
});

void test("mapProgressToCompletedIds returns a set of completed lesson ids", () => {
  const result = mapProgressToCompletedIds([
    { lessonId: 3 },
    { lessonId: 7 },
    { lessonId: 9 },
  ]);

  assert.deepEqual([...result], [3, 7, 9]);
});

void test("mapProgressToCompletedIds returns an empty set for empty rows", () => {
  const result = mapProgressToCompletedIds([]);

  assert.equal(result.size, 0);
});

void test("calculateProgressPercent returns the expected rounded percentage", () => {
  assert.equal(calculateProgressPercent(0, 5), 0);
  assert.equal(calculateProgressPercent(5, 5), 100);
  assert.equal(calculateProgressPercent(3, 4), 75);
});

void test("calculateProgressPercent returns zero when total lessons is zero", () => {
  assert.equal(calculateProgressPercent(0, 0), 0);
});
