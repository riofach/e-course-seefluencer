"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { ChapterUpdateInput } from "~/lib/validations/chapter";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { chapters } from "~/server/db/schema";
import type { ActionResponse } from "~/types";

import {
  createChapterWithDependencies,
  deleteChapterWithDependencies,
  reorderChaptersWithDependencies,
  updateChapterWithDependencies,
} from "./shared";

const dependencies = {
  getSession: getServerAuthSession,
  insertChapter: async (values: {
    courseId: number;
    title: string;
    order: number;
  }) => {
    const result = await db
      .insert(chapters)
      .values(values)
      .returning({ id: chapters.id });
    return result[0]?.id;
  },
  updateChapter: async (chapterId: number, data: { title: string }) => {
    await db.update(chapters).set(data).where(eq(chapters.id, chapterId));
  },
  deleteChapter: async (chapterId: number) => {
    await db.delete(chapters).where(eq(chapters.id, chapterId));
  },
  getChapterCourseId: async (chapterId: number) => {
    const result = await db
      .select({ courseId: chapters.courseId })
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    return result[0]?.courseId ?? null;
  },
  getMaxOrder: async (courseId: number) => {
    const result = await db
      .select({ order: chapters.order })
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(desc(chapters.order))
      .limit(1);

    return result[0]?.order ?? null;
  },
  runTransaction: async (
    updates: Array<{ id: number; order: number }>,
    callback: (updates: Array<{ id: number; order: number }>) => Promise<void>,
  ) => {
    await db.transaction(async (tx) => {
      const updateInTransaction = async (chapterId: number, order: number) => {
        await tx.update(chapters).set({ order }).where(eq(chapters.id, chapterId));
      };

      const originalUpdateChapterOrder = dependencies.updateChapterOrder;
      dependencies.updateChapterOrder = updateInTransaction;

      try {
        await callback(updates);
      } finally {
        dependencies.updateChapterOrder = originalUpdateChapterOrder;
      }
    });
  },
  updateChapterOrder: async (chapterId: number, order: number) => {
    await db.update(chapters).set({ order }).where(eq(chapters.id, chapterId));
  },
  revalidatePaths: (paths: string[]) => {
    for (const path of paths) {
      revalidatePath(path);
    }
  },
};

export async function createChapter(
  courseId: string,
  title?: string,
): Promise<ActionResponse<{ chapterId: number }>> {
  return createChapterWithDependencies(courseId, dependencies, { title });
}

export async function updateChapter(
  chapterId: string,
  data: ChapterUpdateInput,
): Promise<ActionResponse<void>> {
  return updateChapterWithDependencies(chapterId, data, dependencies);
}

export async function deleteChapter(
  chapterId: string,
): Promise<ActionResponse<void>> {
  return deleteChapterWithDependencies(chapterId, dependencies);
}

export async function reorderChapters(
  courseId: string,
  orderedIds: number[],
): Promise<ActionResponse<void>> {
  return reorderChaptersWithDependencies(courseId, orderedIds, dependencies);
}
