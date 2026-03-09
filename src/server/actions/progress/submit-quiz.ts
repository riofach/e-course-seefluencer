"use server";

import { getServerAuthSession } from "~/server/auth";
import {
  getLessonById,
  hasActiveSubscription,
} from "~/server/courses/lesson-detail";
import type { ActionResponse } from "~/types";
import { submitQuizWithDependencies } from "./submit-quiz.shared.ts";

export async function submitQuiz(
  lessonId: number,
  courseSlug: string,
  answers: Record<number, string>,
): Promise<
  ActionResponse<{ score: number; totalPoints: number; passed: boolean }>
> {
  return submitQuizWithDependencies(lessonId, courseSlug, answers, {
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
  });
}
