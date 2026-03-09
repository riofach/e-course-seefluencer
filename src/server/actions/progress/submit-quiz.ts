"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getServerAuthSession } from "~/server/auth";
import {
  getLessonById,
  hasActiveSubscription,
} from "~/server/courses/lesson-detail";
import { db } from "~/server/db";
import { quizAttempts, quizzes, userProgress } from "~/server/db/schema";
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
    verifyAccess: async (
      userId: string,
      parsedLessonId: number,
      parsedCourseSlug: string,
    ) => {
      const lesson = await getLessonById(
        parsedLessonId.toString(),
        parsedCourseSlug,
      );
      if (!lesson) return false;
      if (lesson.isFree) return true;
      return hasActiveSubscription(userId);
    },
    getQuizData: async (parsedLessonId: number) => {
      const results = await db
        .select({
          id: quizzes.id,
          correctAnswer: quizzes.correctAnswer,
          points: quizzes.points,
        })
        .from(quizzes)
        .where(eq(quizzes.lessonId, parsedLessonId));

      return results.map((r) => ({
        ...r,
        correctAnswer: r.correctAnswer, // Already mapped by schema, satisfying Type
      }));
    },
    insertQuizAttempt: async (attempt: {
      userId: string;
      lessonId: number;
      score: number;
      totalPoints: number;
      passed: boolean;
    }) => {
      await db.insert(quizAttempts).values(attempt);
    },
    hasCompletedLesson: async (userId: string, parsedLessonId: number) => {
      const existingProgress = await db
        .select({ id: userProgress.id })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.lessonId, parsedLessonId),
          ),
        )
        .limit(1);

      return existingProgress.length > 0;
    },
    insertUserProgress: async (userId: string, parsedLessonId: number) => {
      await db
        .insert(userProgress)
        .values({ userId, lessonId: parsedLessonId })
        .onConflictDoNothing();
    },
    revalidateLessonPath: revalidatePath,
  });
}
