import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateScore,
  PASS_THRESHOLD,
  submitQuizWithDependencies,
  type SubmitQuizDependencies,
} from "./submit-quiz.shared.ts";

function createDependencies(
  overrides: Partial<SubmitQuizDependencies> = {},
): SubmitQuizDependencies {
  return {
    getSession: async () => ({ user: { id: "user-1" } }),
    verifyAccess: async () => true,
    getQuizData: async () => [],
    insertQuizAttempt: async () => undefined,
    hasCompletedLesson: async () => false,
    insertUserProgress: async () => undefined,
    revalidateLessonPath: (_path) => void _path,
    ...overrides,
  };
}

void test("submitQuiz rejects unauthenticated users", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A" },
    createDependencies({ getSession: async () => null }),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error, "Unauthorized.");
  }
});

void test("submitQuiz rejects invalid answers payload", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "E" },
    createDependencies(),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error, "Invalid answers format.");
  }
});

void test("submitQuiz rejects unauthorized lesson access", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A" },
    createDependencies({ verifyAccess: async () => false }),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Forbidden/);
  }
});

void test("calculateScore returns full score for all correct answers", () => {
  const result = calculateScore(
    [
      { id: 1, correctAnswer: "A", points: 4 },
      { id: 2, correctAnswer: "B", points: 6 },
    ],
    { 1: "A", 2: "B" },
  );

  assert.deepEqual(result, { score: 10, totalPoints: 10 });
});

void test("calculateScore returns zero score when all answers are wrong", () => {
  const result = calculateScore(
    [
      { id: 1, correctAnswer: "A", points: 4 },
      { id: 2, correctAnswer: "B", points: 6 },
    ],
    { 1: "C", 2: "D" },
  );

  assert.deepEqual(result, { score: 0, totalPoints: 10 });
});

void test("submitQuiz passes at the exact 70% threshold", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A", 2: "B", 3: "C" },
    createDependencies({
      getQuizData: async () => [
        { id: 1, correctAnswer: "A", points: 4 },
        { id: 2, correctAnswer: "B", points: 3 },
        { id: 3, correctAnswer: "D", points: 3 },
      ],
    }),
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.score, 7);
    assert.equal(result.data.totalPoints, 10);
    assert.equal(result.data.passed, true);
    assert.equal(result.data.score / result.data.totalPoints >= PASS_THRESHOLD, true);
  }
});

void test("submitQuiz fails below the 70% threshold", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A", 2: "C", 3: "C" },
    createDependencies({
      getQuizData: async () => [
        { id: 1, correctAnswer: "A", points: 3 },
        { id: 2, correctAnswer: "B", points: 4 },
        { id: 3, correctAnswer: "D", points: 3 },
      ],
    }),
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.score, 3);
    assert.equal(result.data.totalPoints, 10);
    assert.equal(result.data.passed, false);
  }
});

void test("calculateScore returns zero totals for empty quiz data", () => {
  assert.deepEqual(calculateScore([], {}), { score: 0, totalPoints: 0 });
});

void test("submitQuiz records attempts and inserts progress only on first pass", async () => {
  const insertedAttempts: Array<{
    userId: string;
    lessonId: number;
    score: number;
    totalPoints: number;
    passed: boolean;
  }> = [];
  const insertedProgress: Array<{ userId: string; lessonId: number }> = [];
  let revalidatedPath = "";

  const result = await submitQuizWithDependencies(
    9,
    "course-slug",
    { 1: "A", 2: "B" },
    createDependencies({
      getQuizData: async () => [
        { id: 1, correctAnswer: "A", points: 5 },
        { id: 2, correctAnswer: "B", points: 5 },
      ],
      insertQuizAttempt: async (attempt) => {
        insertedAttempts.push(attempt);
      },
      hasCompletedLesson: async () => false,
      insertUserProgress: async (userId, lessonId) => {
        insertedProgress.push({ userId, lessonId });
      },
      revalidateLessonPath: (path) => {
        revalidatedPath = path;
      },
    }),
  );

  assert.equal(result.success, true);
  assert.deepEqual(insertedAttempts, [
    {
      userId: "user-1",
      lessonId: 9,
      score: 10,
      totalPoints: 10,
      passed: true,
    },
  ]);
  assert.deepEqual(insertedProgress, [{ userId: "user-1", lessonId: 9 }]);
  assert.equal(revalidatedPath, "/courses/course-slug/lessons/9");
});

void test("submitQuiz records retake attempts without duplicating progress", async () => {
  const insertedAttempts: Array<{ passed: boolean }> = [];
  let insertUserProgressCalled = false;

  const result = await submitQuizWithDependencies(
    3,
    "course-slug",
    { 1: "A" },
    createDependencies({
      getQuizData: async () => [{ id: 1, correctAnswer: "A", points: 10 }],
      insertQuizAttempt: async (attempt) => {
        insertedAttempts.push({ passed: attempt.passed });
      },
      hasCompletedLesson: async () => true,
      insertUserProgress: async () => {
        insertUserProgressCalled = true;
      },
    }),
  );

  assert.equal(result.success, true);
  assert.deepEqual(insertedAttempts, [{ passed: true }]);
  assert.equal(insertUserProgressCalled, false);
});

void test("submitQuiz does not insert progress for failed attempts", async () => {
  let insertUserProgressCalled = false;

  const result = await submitQuizWithDependencies(
    5,
    "course-slug",
    { 1: "B" },
    createDependencies({
      getQuizData: async () => [{ id: 1, correctAnswer: "A", points: 10 }],
      insertUserProgress: async () => {
        insertUserProgressCalled = true;
      },
    }),
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.passed, false);
  }
  assert.equal(insertUserProgressCalled, false);
});

void test("submitQuiz returns grading error when dependencies fail", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A" },
    createDependencies({
      getQuizData: async () => {
        throw new Error("db down");
      },
    }),
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error, "Failed to grade quiz.");
  }
});
