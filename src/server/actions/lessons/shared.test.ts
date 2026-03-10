import assert from "node:assert/strict";
import test from "node:test";

import {
  createLessonWithDependencies,
  deleteLessonWithDependencies,
  updateLessonWithDependencies,
  type LessonActionDependencies,
} from "./shared.ts";

function createDependencies(
  overrides: Partial<LessonActionDependencies> = {},
): LessonActionDependencies {
  return {
    getSession: async () => ({ user: { id: "admin-1", role: "admin" } }),
    insertLesson: async () => 20,
    updateLesson: async () => undefined,
    deleteLesson: async () => undefined,
    getMaxOrder: async () => 1,
    getLessonCourseId: async () => 5,
    getChapterCourseId: async () => 5,
    revalidatePaths: () => undefined,
    ...overrides,
  };
}

void test("lesson actions reject unauthorized requests", async () => {
  const dependencies = createDependencies({ getSession: async () => null });

  const [createResult, updateResult, deleteResult] = await Promise.all([
    createLessonWithDependencies("5", dependencies),
    updateLessonWithDependencies(
      "5",
      { title: "Updated", type: "video", videoUrl: "", content: "", isFree: false },
      dependencies,
    ),
    deleteLessonWithDependencies("5", dependencies),
  ]);

  assert.deepEqual(createResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(updateResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(deleteResult, { success: false, error: "Unauthorized." });
});

void test("createLessonWithDependencies inserts with correct order and returns lessonId", async () => {
  let receivedValues: unknown;
  let revalidatedPaths: string[] = [];

  const result = await createLessonWithDependencies(
    "5",
    createDependencies({
      getMaxOrder: async () => 3,
      insertLesson: async (values) => {
        receivedValues = values;
        return 20;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: { lessonId: 20 } });
  assert.deepEqual(receivedValues, {
    chapterId: 5,
    title: "New Lesson",
    type: "video",
    content: null,
    order: 4,
  });
  assert.deepEqual(revalidatedPaths, ["/admin/courses/5"]);
});

void test("updateLessonWithDependencies validates empty title and rejects", async () => {
  const result = await updateLessonWithDependencies(
    "5",
    { title: "", type: "video", videoUrl: "", content: "", isFree: false },
    createDependencies(),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Title is required",
  });
});

void test("updateLessonWithDependencies persists isFree state", async () => {
  let updatedLessonId: number | null = null;
  let updatedPayload: unknown;

  const result = await updateLessonWithDependencies(
    "9",
    {
      title: "Premium Lesson",
      type: "video",
      videoUrl: "https://example.com/video",
      content: "",
      isFree: true,
    },
    createDependencies({
      updateLesson: async (lessonId, data) => {
        updatedLessonId = lessonId;
        updatedPayload = data;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: undefined });
  assert.equal(updatedLessonId, 9);
  assert.deepEqual(updatedPayload, {
    title: "Premium Lesson",
    type: "video",
    content: "https://example.com/video",
    isFree: true,
  });
});

void test("deleteLessonWithDependencies calls delete and revalidates path", async () => {
  let deletedLessonId: number | null = null;
  let revalidatedPaths: string[] = [];

  const result = await deleteLessonWithDependencies(
    "7",
    createDependencies({
      deleteLesson: async (lessonId) => {
        deletedLessonId = lessonId;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: undefined });
  assert.equal(deletedLessonId, 7);
  assert.deepEqual(revalidatedPaths, ["/admin/courses/5"]);
});
