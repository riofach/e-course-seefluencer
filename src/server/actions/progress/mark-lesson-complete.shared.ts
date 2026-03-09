import { z } from "zod";

import type { ActionResponse } from "~/types";

const MarkLessonCompleteSchema = z.object({
  lessonId: z.number().int().positive(),
  courseSlug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
});

type SessionLike = {
  user?: {
    id?: string;
  };
} | null;

export type MarkLessonCompleteDependencies = {
  getSession: () => Promise<SessionLike>;
  verifyAccess: (
    userId: string,
    lessonId: number,
    courseSlug: string,
  ) => Promise<boolean>;
  insertUserProgress: (userId: string, lessonId: number) => Promise<void>;
  revalidateLessonPath: (path: string) => void;
};

export async function markLessonCompleteWithDependencies(
  lessonId: number,
  courseSlug: string,
  dependencies: MarkLessonCompleteDependencies,
): Promise<ActionResponse<{ lessonId: number }>> {
  const session = await dependencies.getSession();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = MarkLessonCompleteSchema.safeParse({ lessonId, courseSlug });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
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

    await dependencies.insertUserProgress(
      session.user.id,
      parsed.data.lessonId,
    );
    dependencies.revalidateLessonPath(
      `/courses/${parsed.data.courseSlug}/lessons/${parsed.data.lessonId}`,
    );

    return {
      success: true,
      data: {
        lessonId: parsed.data.lessonId,
      },
    };
  } catch (error) {
    console.error("Failed to mark lesson as complete", error);
    return {
      success: false,
      error: "An unexpected error occurred while marking the lesson complete.",
    };
  }
}
