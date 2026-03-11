import assert from "node:assert/strict";
import { test } from "vitest";

import { markLessonCompleteWithDependencies } from "./mark-lesson-complete.shared.ts";

void test("markLessonComplete returns unauthorized when no session exists", async () => {
  const result = await markLessonCompleteWithDependencies(
    12,
    "belajar-streaming",
    {
      getSession: async () => null,
      verifyAccess: async () => false,
      insertUserProgress: async () => undefined,
      revalidateLessonPath: () => undefined,
    },
  );

  assert.deepEqual(result, {
    success: false,
    error: "Unauthorized.",
  });
});

void test("markLessonComplete rejects non-positive lesson ids", async () => {
  let insertCalled = false;

  const result = await markLessonCompleteWithDependencies(
    0,
    "belajar-streaming",
    {
      getSession: async () => ({
        user: {
          id: "user-1",
          role: "student",
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      }),
      verifyAccess: async () => true,
      insertUserProgress: async () => {
        insertCalled = true;
      },
      revalidateLessonPath: () => undefined,
    },
  );

  assert.equal(result.success, false);
  if (result.success) {
    assert.fail("Expected validation failure for non-positive lesson id");
  }
  assert.equal(typeof result.error, "string"); // zod error
  assert.equal(insertCalled, false);
});

void test("markLessonComplete returns forbidden if access denied", async () => {
  const result = await markLessonCompleteWithDependencies(
    1,
    "belajar-streaming",
    {
      getSession: async () => ({
        user: {
          id: "user-1",
          role: "student",
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      }),
      verifyAccess: async () => false,
      insertUserProgress: async () => undefined,
      revalidateLessonPath: () => undefined,
    },
  );

  assert.deepEqual(result, {
    success: false,
    error: "Forbidden: You do not have access to this lesson.",
  });
});
