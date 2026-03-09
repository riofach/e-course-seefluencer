"use server";

import { revalidatePath } from "next/cache";

import { getServerAuthSession } from "~/server/auth";
import {
  getLessonById,
  hasActiveSubscription,
} from "~/server/courses/lesson-detail";
import { db } from "~/server/db";
import { userProgress } from "~/server/db/schema";
import type { ActionResponse } from "~/types";
import { markLessonCompleteWithDependencies } from "./mark-lesson-complete.shared";

export async function markLessonComplete(
  lessonId: number,
  courseSlug: string,
): Promise<ActionResponse<{ lessonId: number }>> {
  return markLessonCompleteWithDependencies(lessonId, courseSlug, {
    getSession: getServerAuthSession,
    verifyAccess: async (userId, parsedLessonId, parsedCourseSlug) => {
      const lesson = await getLessonById(
        parsedLessonId.toString(),
        parsedCourseSlug,
      );
      if (!lesson) return false;
      if (lesson.isFree) return true;
      return hasActiveSubscription(userId);
    },
    insertUserProgress: async (userId, parsedLessonId) => {
      await db
        .insert(userProgress)
        .values({
          userId,
          lessonId: parsedLessonId,
        })
        .onConflictDoNothing();
    },
    revalidateLessonPath: revalidatePath,
  });
}
