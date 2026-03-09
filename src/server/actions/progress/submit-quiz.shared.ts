import { z } from "zod";

import type { ActionResponse } from "~/types";

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

    return {
      success: true,
      data: {
        score: 0,
        totalPoints: 0,
        passed: false,
      },
    };
  } catch (error) {
    console.error("Failed to submit quiz", error);
    return {
      success: false,
      error: "An unexpected error occurred while submitting the quiz.",
    };
  }
}
