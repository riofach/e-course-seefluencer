import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { quizzes } from "~/server/db/schema";

import {
  sanitizeQuizQuestions,
  type ClientQuizQuestion,
  type QuizQuestion,
} from "./quiz-questions.shared.ts";

export type { ClientQuizQuestion, QuizQuestion };

export async function getQuizQuestions(
  lessonId: number,
): Promise<ClientQuizQuestion[]> {
  const questions = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.lessonId, lessonId))
    .orderBy(asc(quizzes.id));

  return sanitizeQuizQuestions(questions);
}
