import {
  lessonCreateSchema,
  lessonUpdateSchema,
  type LessonUpdateInput,
} from "../../../lib/validations/lesson.ts";
import type { ActionResponse } from "../../../types/index.ts";

type AdminSession = {
  user?: {
    id?: string;
    role?: string;
  };
} | null;

export type LessonActionDependencies = {
  getSession: () => Promise<AdminSession>;
  insertLesson: (values: {
    chapterId: number;
    title: string;
    type: string;
    content: string | null;
    order: number;
  }) => Promise<number | undefined>;
  updateLesson: (
    lessonId: number,
    data: Partial<{
      title: string;
      type: string;
      content: string | null;
      isFree: boolean;
    }>,
  ) => Promise<void>;
  deleteLesson: (lessonId: number) => Promise<void>;
  getMaxOrder: (chapterId: number) => Promise<number | null>;
  getLessonCourseId: (lessonId: number) => Promise<number | null>;
  getChapterCourseId: (chapterId: number) => Promise<number | null>;
  revalidatePaths: (paths: string[]) => void;
};

function getValidationErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const typedError = error as {
      errors?: Array<{ message?: string }>;
    };

    if (typeof typedError.errors?.[0]?.message === "string") {
      return typedError.errors[0].message;
    }
  }

  return fallback;
}

function parseEntityId(value: string): number | null {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

async function requireAdminSession(
  getSession: LessonActionDependencies["getSession"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { ok: false, error: "Unauthorized." };
  }

  return { ok: true };
}

export async function createLessonWithDependencies(
  chapterId: string,
  dependencies: LessonActionDependencies,
): Promise<ActionResponse<{ lessonId: number }>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedChapterId = parseEntityId(chapterId);

  if (parsedChapterId === null) {
    return { success: false, error: "Invalid chapter id." };
  }

  const parsed = lessonCreateSchema.safeParse({ chapterId: parsedChapterId });

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(parsed.error, "Invalid lesson payload."),
    };
  }

  try {
    const [maxOrder, courseId] = await Promise.all([
      dependencies.getMaxOrder(parsed.data.chapterId),
      dependencies.getChapterCourseId(parsed.data.chapterId),
    ]);

    const lessonId = await dependencies.insertLesson({
      chapterId: parsed.data.chapterId,
      title: "New Lesson",
      type: "video",
      content: null,
      order: (maxOrder ?? 0) + 1,
    });

    if (lessonId === undefined) {
      return { success: false, error: "Failed to create lesson." };
    }

    dependencies.revalidatePaths(
      courseId === null ? ["/admin/courses"] : [`/admin/courses/${courseId}`],
    );

    return {
      success: true,
      data: { lessonId },
    };
  } catch (error) {
    console.error("Failed to create lesson", error);
    return { success: false, error: "Failed to create lesson." };
  }
}

export async function updateLessonWithDependencies(
  lessonId: string,
  data: LessonUpdateInput,
  dependencies: LessonActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedLessonId = parseEntityId(lessonId);

  if (parsedLessonId === null) {
    return { success: false, error: "Invalid lesson id." };
  }

  const parsed = lessonUpdateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(parsed.error, "Invalid lesson payload."),
    };
  }

  try {
    const courseId = await dependencies.getLessonCourseId(parsedLessonId);

    await dependencies.updateLesson(parsedLessonId, {
      title: parsed.data.title,
      type: parsed.data.type,
      isFree: parsed.data.isFree,
      content:
        parsed.data.type === "video"
          ? parsed.data.videoUrl?.trim() ?? null
          : parsed.data.type === "text"
            ? parsed.data.content?.trim() ?? null
            : null,
    });

    dependencies.revalidatePaths(
      courseId === null ? ["/admin/courses"] : [`/admin/courses/${courseId}`],
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update lesson", error);
    return { success: false, error: "Failed to update lesson." };
  }
}

export async function deleteLessonWithDependencies(
  lessonId: string,
  dependencies: LessonActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedLessonId = parseEntityId(lessonId);

  if (parsedLessonId === null) {
    return { success: false, error: "Invalid lesson id." };
  }

  try {
    const courseId = await dependencies.getLessonCourseId(parsedLessonId);

    await dependencies.deleteLesson(parsedLessonId);

    dependencies.revalidatePaths(
      courseId === null ? ["/admin/courses"] : [`/admin/courses/${courseId}`],
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete lesson", error);
    return { success: false, error: "Failed to delete lesson." };
  }
}
