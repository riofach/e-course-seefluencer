import assert from "node:assert/strict";
import test from "node:test";
import { submitQuizWithDependencies } from "./submit-quiz.shared.ts";

void test("submitQuiz rejects unauthenticated users", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A" },
    {
      getSession: async () => null,
      verifyAccess: async () => true,
    },
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
    {
      getSession: async () => ({ user: { id: "user-1" } }),
      verifyAccess: async () => true,
    },
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
    {
      getSession: async () => ({ user: { id: "user-1" } }),
      verifyAccess: async () => false,
    },
  );

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Forbidden/);
  }
});

void test("submitQuiz returns the Story 3.4 placeholder result without grading", async () => {
  const result = await submitQuizWithDependencies(
    1,
    "course-slug",
    { 1: "A" },
    {
      getSession: async () => ({ user: { id: "user-1" } }),
      verifyAccess: async () => true,
    },
  );

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.score, 0);
    assert.equal(result.data.totalPoints, 0);
    assert.equal(result.data.passed, false);
  }
});
