import type { InferSelectModel } from "drizzle-orm";

import type { quizzes } from "~/server/db/schema";

export type QuizRow = InferSelectModel<typeof quizzes>;

export async function getQuizzesByLessonIdFromQuery(
  lessonId: number,
  query: (parsedLessonId: number) => Promise<QuizRow[]>,
): Promise<QuizRow[]> {
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return [];
  }

  return query(lessonId);
}
