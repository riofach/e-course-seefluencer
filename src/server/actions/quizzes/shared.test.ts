import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createQuizQuestionWithDependencies,
  deleteQuizQuestionWithDependencies,
  updateQuizQuestionWithDependencies,
  type QuizActionDependencies,
} from "./shared.ts";

function createDependencies(
  overrides: Partial<QuizActionDependencies> = {},
): QuizActionDependencies {
  return {
    getSession: async () => ({ user: { id: "admin-1", role: "admin" } }),
    insertQuiz: async () => 42,
    updateQuiz: async () => undefined,
    deleteQuiz: async () => undefined,
    getLessonCourseId: async () => ({ courseId: 1, lessonId: 5 }),
    getQuizLessonId: async () => 5,
    revalidatePaths: () => undefined,
    ...overrides,
  };
}

void test("quiz actions reject unauthorized requests", async () => {
  const dependencies = createDependencies({ getSession: async () => null });

  const [createResult, updateResult, deleteResult] = await Promise.all([
    createQuizQuestionWithDependencies("5", dependencies),
    updateQuizQuestionWithDependencies(
      "5",
      {
        question: "Question",
        optionA: "A",
        optionB: "B",
        optionC: "C",
        optionD: "D",
        correctAnswer: "A",
        points: 10,
      },
      dependencies,
    ),
    deleteQuizQuestionWithDependencies("5", dependencies),
  ]);

  assert.deepEqual(createResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(updateResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(deleteResult, { success: false, error: "Unauthorized." });
});

void test("createQuizQuestionWithDependencies inserts with correct defaults and returns quizId", async () => {
  let receivedValues: unknown;
  let revalidatedPaths: string[] = [];

  const result = await createQuizQuestionWithDependencies(
    "5",
    createDependencies({
      insertQuiz: async (values) => {
        receivedValues = values;
        return 42;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: { quizId: 42 } });
  assert.deepEqual(receivedValues, {
    lessonId: 5,
    question: "New Question",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    points: 10,
  });
  assert.deepEqual(revalidatedPaths, ["/admin/courses/1/lessons/5/quiz"]);
});

void test("updateQuizQuestionWithDependencies rejects invalid correctAnswer", async () => {
  const result = await updateQuizQuestionWithDependencies(
    "12",
    {
      question: "Question",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctAnswer: "E" as "A",
      points: 10,
    },
    createDependencies(),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Invalid enum value. Expected 'A' | 'B' | 'C' | 'D', received 'E'",
  });
});

void test("updateQuizQuestionWithDependencies rejects empty question text", async () => {
  const result = await updateQuizQuestionWithDependencies(
    "12",
    {
      question: "",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctAnswer: "A",
      points: 10,
    },
    createDependencies(),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Question is required",
  });
});

void test("deleteQuizQuestionWithDependencies calls delete and revalidates path", async () => {
  let deletedQuizId: number | null = null;
  let revalidatedPaths: string[] = [];

  const result = await deleteQuizQuestionWithDependencies(
    "9",
    createDependencies({
      deleteQuiz: async (quizId) => {
        deletedQuizId = quizId;
      },
      getQuizLessonId: async () => 7,
      getLessonCourseId: async () => ({ courseId: 3, lessonId: 7 }),
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: undefined });
  assert.equal(deletedQuizId, 9);
  assert.deepEqual(revalidatedPaths, ["/admin/courses/3/lessons/7/quiz"]);
});
