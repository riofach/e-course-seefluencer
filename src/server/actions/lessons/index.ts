"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { LessonUpdateInput } from "~/lib/validations/lesson";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { chapters, lessons } from "~/server/db/schema";
import type { ActionResponse } from "~/types";

import {
  createLessonWithDependencies,
  deleteLessonWithDependencies,
  updateLessonWithDependencies,
} from "./shared";

const dependencies = {
  getSession: getServerAuthSession,
  insertLesson: async (values: {
    chapterId: number;
    title: string;
    type: string;
    content: string | null;
    order: number;
  }) => {
    const result = await db.insert(lessons).values(values).returning({ id: lessons.id });
    return result[0]?.id;
  },
  updateLesson: async (
    lessonId: number,
    data: Partial<{
      title: string;
      type: string;
      content: string | null;
      isFree: boolean;
    }>,
  ) => {
    await db.update(lessons).set(data).where(eq(lessons.id, lessonId));
  },
  deleteLesson: async (lessonId: number) => {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
  },
  getMaxOrder: async (chapterId: number) => {
    const result = await db
      .select({ order: lessons.order })
      .from(lessons)
      .where(eq(lessons.chapterId, chapterId))
      .orderBy(desc(lessons.order))
      .limit(1);

    return result[0]?.order ?? null;
  },
  getLessonCourseId: async (lessonId: number) => {
    const result = await db
      .select({ courseId: chapters.courseId })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);

    return result[0]?.courseId ?? null;
  },
  getChapterCourseId: async (chapterId: number) => {
    const result = await db
      .select({ courseId: chapters.courseId })
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    return result[0]?.courseId ?? null;
  },
  revalidatePaths: (paths: string[]) => {
    for (const path of paths) {
      revalidatePath(path);
    }
  },
};

export async function createLesson(
  chapterId: string,
): Promise<ActionResponse<{ lessonId: number }>> {
  return createLessonWithDependencies(chapterId, dependencies);
}

export async function updateLesson(
  lessonId: string,
  data: LessonUpdateInput,
): Promise<ActionResponse<void>> {
  return updateLessonWithDependencies(lessonId, data, dependencies);
}

export async function deleteLesson(
  lessonId: string,
): Promise<ActionResponse<void>> {
  return deleteLessonWithDependencies(lessonId, dependencies);
}
