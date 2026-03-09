import { z } from "zod";

import type { ActionResponse } from "~/types";

export const PASS_THRESHOLD = 0.7;

export type QuizGradeInput = {
  id: number;
  correctAnswer: string;
  points: number;
};

export type AnswerMap = Record<number, string>;

export function calculateScore(
  quizData: QuizGradeInput[],
  answers: AnswerMap,
): { score: number; totalPoints: number } {
  let score = 0;
  let totalPoints = 0;

  for (const quiz of quizData) {
    totalPoints += quiz.points;

    if (answers[quiz.id] === quiz.correctAnswer) {
      score += quiz.points;
    }
  }

  return { score, totalPoints };
}

const answersSchema = z.record(
  z.coerce.number().int().positive(),
  z.enum(["A", "B", "C", "D"]),
);

export const submitQuizSchema = z.object({
  lessonId: z.number().int().positive(),
  courseSlug: z.string().min(1),
  answers: answersSchema,
});

type SessionLike = {
  user?: {
    id?: string;
  };
} | null;

export type SubmitQuizDependencies = {
  getSession: () => Promise<SessionLike>;
  verifyAccess: (
    userId: string,
    lessonId: number,
    courseSlug: string,
  ) => Promise<boolean>;
  getQuizData: (lessonId: number) => Promise<QuizGradeInput[]>;
  insertQuizAttempt: (attempt: {
    userId: string;
    lessonId: number;
    score: number;
    totalPoints: number;
    passed: boolean;
  }) => Promise<void>;
  hasCompletedLesson: (userId: string, lessonId: number) => Promise<boolean>;
  insertUserProgress: (userId: string, lessonId: number) => Promise<void>;
  revalidateLessonPath: (path: string) => void;
};

export async function submitQuizWithDependencies(
  lessonId: number,
  courseSlug: string,
  answers: Record<number, string>,
  dependencies: SubmitQuizDependencies,
): Promise<
  ActionResponse<{ score: number; totalPoints: number; passed: boolean }>
> {
  const session = await dependencies.getSession();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = submitQuizSchema.safeParse({ lessonId, courseSlug, answers });

  if (!parsed.success) {
    return { success: false, error: "Invalid answers format." };
  }

  try {
    const hasAccess = await dependencies.verifyAccess(
      session.user.id,
      parsed.data.lessonId,
      parsed.data.courseSlug,
    );

    if (!hasAccess) {
      return {
        success: false,
        error: "Forbidden: You do not have access to this lesson.",
      };
    }

    const quizData = await dependencies.getQuizData(parsed.data.lessonId);
    const { score, totalPoints } = calculateScore(quizData, parsed.data.answers);
    const passed =
      totalPoints > 0 && score / totalPoints >= PASS_THRESHOLD;

    await dependencies.insertQuizAttempt({
      userId: session.user.id,
      lessonId: parsed.data.lessonId,
      score,
      totalPoints,
      passed,
    });

    if (passed) {
      const hasCompletedLesson = await dependencies.hasCompletedLesson(
        session.user.id,
        parsed.data.lessonId,
      );

      if (!hasCompletedLesson) {
        await dependencies.insertUserProgress(
          session.user.id,
          parsed.data.lessonId,
        );
      }
    }

    dependencies.revalidateLessonPath(
      `/courses/${parsed.data.courseSlug}/lessons/${parsed.data.lessonId}`,
    );

    return {
      success: true,
      data: {
        score,
        totalPoints,
        passed,
      },
    };
  } catch (error) {
    console.error("Failed to submit quiz", error);
    return {
      success: false,
      error: "Failed to grade quiz.",
    };
  }
}
