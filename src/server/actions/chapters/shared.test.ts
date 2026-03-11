import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createChapterWithDependencies,
  deleteChapterWithDependencies,
  reorderChaptersWithDependencies,
  updateChapterWithDependencies,
  type ChapterActionDependencies,
} from "./shared.ts";

function createDependencies(
  overrides: Partial<ChapterActionDependencies> = {},
): ChapterActionDependencies {
  return {
    getSession: async () => ({ user: { id: "admin-1", role: "admin" } }),
    insertChapter: async () => 10,
    updateChapter: async () => undefined,
    deleteChapter: async () => undefined,
    getChapterCourseId: async () => 5,
    getMaxOrder: async () => 2,
    runTransaction: async (updates, callback) => {
      await callback(updates);
    },
    updateChapterOrder: async () => undefined,
    revalidatePaths: () => undefined,
    ...overrides,
  };
}

void test("chapter actions reject unauthorized requests", async () => {
  const dependencies = createDependencies({ getSession: async () => null });

  const [createResult, updateResult, deleteResult, reorderResult] = await Promise.all([
    createChapterWithDependencies("5", dependencies),
    updateChapterWithDependencies("5", { title: "Updated" }, dependencies),
    deleteChapterWithDependencies("5", dependencies),
    reorderChaptersWithDependencies("5", [1, 2], dependencies),
  ]);

  assert.deepEqual(createResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(updateResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(deleteResult, { success: false, error: "Unauthorized." });
  assert.deepEqual(reorderResult, { success: false, error: "Unauthorized." });
});

void test("createChapterWithDependencies inserts with correct order and returns chapterId", async () => {
  let receivedValues: unknown;
  let revalidatedPaths: string[] = [];

  const result = await createChapterWithDependencies(
    "5",
    createDependencies({
      getMaxOrder: async () => 3,
      insertChapter: async (values) => {
        receivedValues = values;
        return 10;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: { chapterId: 10 } });
  assert.deepEqual(receivedValues, { courseId: 5, title: "New Chapter", order: 4 });
  assert.deepEqual(revalidatedPaths, ["/admin/courses/5"]);
});

void test("createChapterWithDependencies persists a custom title when provided", async () => {
  let receivedValues: unknown;

  const result = await createChapterWithDependencies(
    "5",
    createDependencies({
      insertChapter: async (values) => {
        receivedValues = values;
        return 22;
      },
    }),
    { title: "Bab Baru" },
  );

  assert.deepEqual(result, { success: true, data: { chapterId: 22 } });
  assert.deepEqual(receivedValues, { courseId: 5, title: "Bab Baru", order: 3 });
});

void test("updateChapterWithDependencies validates empty title and rejects", async () => {
  const result = await updateChapterWithDependencies(
    "5",
    { title: "" },
    createDependencies(),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Title is required",
  });
});

void test("deleteChapterWithDependencies calls delete and revalidates paths", async () => {
  let deletedChapterId: number | null = null;
  let revalidatedPaths: string[] = [];

  const result = await deleteChapterWithDependencies(
    "7",
    createDependencies({
      deleteChapter: async (chapterId) => {
        deletedChapterId = chapterId;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: undefined });
  assert.equal(deletedChapterId, 7);
  assert.deepEqual(revalidatedPaths, ["/admin/courses", "/admin/courses/5"]);
});

void test("reorderChaptersWithDependencies calls update for each id in correct order", async () => {
  const receivedUpdates: Array<{ chapterId: number; order: number }> = [];
  let transactionPayload: Array<{ id: number; order: number }> = [];

  const result = await reorderChaptersWithDependencies(
    "5",
    [9, 3, 7],
    createDependencies({
      runTransaction: async (updates, callback) => {
        transactionPayload = updates;
        await callback(updates);
      },
      updateChapterOrder: async (chapterId, order) => {
        receivedUpdates.push({ chapterId, order });
      },
    }),
  );

  assert.deepEqual(result, { success: true, data: undefined });
  assert.deepEqual(transactionPayload, [
    { id: 9, order: 1 },
    { id: 3, order: 2 },
    { id: 7, order: 3 },
  ]);
  assert.deepEqual(receivedUpdates, [
    { chapterId: 9, order: 1 },
    { chapterId: 3, order: 2 },
    { chapterId: 7, order: 3 },
  ]);
});
