import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { quizzes } from "~/server/db/schema";

import { getQuizzesByLessonIdFromQuery, type QuizRow } from "./quizzes.shared";

export type { QuizRow } from "./quizzes.shared";

export async function getQuizzesByLessonId(lessonId: number): Promise<QuizRow[]> {
  return getQuizzesByLessonIdFromQuery(lessonId, (parsedLessonId) =>
    db
      .select()
      .from(quizzes)
      .where(eq(quizzes.lessonId, parsedLessonId))
      .orderBy(asc(quizzes.id)),
  );
}
