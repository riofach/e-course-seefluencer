import type { quizzes } from "~/server/db/schema";

export type QuizQuestion = typeof quizzes.$inferSelect;

export type ClientQuizQuestion = {
  id: number;
  lessonId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

export function sanitizeQuizQuestions(
  questions: QuizQuestion[],
): ClientQuizQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    lessonId: q.lessonId,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
  }));
}
