import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getQuizzesByLessonIdFromQuery,
  type QuizRow,
} from "./quizzes.shared.ts";

function createQuizRow(id: number, lessonId = 5): QuizRow {
  return {
    id,
    lessonId,
    question: `Question ${id}`,
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correctAnswer: "A",
    points: 10,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
  };
}

void test("invalid lessonId values return empty array", async () => {
  let called = false;

  const invalidValues = [-1, 0, 1.5];

  for (const lessonId of invalidValues) {
    const result = await getQuizzesByLessonIdFromQuery(lessonId, async () => {
      called = true;
      return [createQuizRow(1)];
    });

    assert.deepEqual(result, []);
  }

  assert.equal(called, false);
});

void test("valid lessonId calls query with correct argument", async () => {
  let receivedLessonId = 0;

  const result = await getQuizzesByLessonIdFromQuery(7, async (lessonId) => {
    receivedLessonId = lessonId;
    return [createQuizRow(1, lessonId)];
  });

  assert.equal(receivedLessonId, 7);
  assert.deepEqual(result, [createQuizRow(1, 7)]);
});
