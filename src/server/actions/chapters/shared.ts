import {
  chapterCreateSchema,
  chapterUpdateSchema,
  type ChapterUpdateInput,
} from "../../../lib/validations/chapter.ts";
import type { ActionResponse } from "../../../types/index.ts";

type AdminSession = {
  user?: {
    id?: string;
    role?: string;
  };
} | null;

export type ChapterActionDependencies = {
  getSession: () => Promise<AdminSession>;
  insertChapter: (values: {
    courseId: number;
    title: string;
    order: number;
  }) => Promise<number | undefined>;
  updateChapter: (chapterId: number, data: { title: string }) => Promise<void>;
  deleteChapter: (chapterId: number) => Promise<void>;
  getChapterCourseId: (chapterId: number) => Promise<number | null>;
  getMaxOrder: (courseId: number) => Promise<number | null>;
  runTransaction: (
    updates: Array<{ id: number; order: number }>,
    callback: (updates: Array<{ id: number; order: number }>) => Promise<void>,
  ) => Promise<void>;
  updateChapterOrder: (chapterId: number, order: number) => Promise<void>;
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
  getSession: ChapterActionDependencies["getSession"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { ok: false, error: "Unauthorized." };
  }

  return { ok: true };
}

export async function createChapterWithDependencies(
  courseId: string,
  dependencies: ChapterActionDependencies,
  input?: { title?: string },
): Promise<ActionResponse<{ chapterId: number }>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedCourseId = parseEntityId(courseId);

  if (parsedCourseId === null) {
    return { success: false, error: "Invalid course id." };
  }

  const parsed = chapterCreateSchema.safeParse({ courseId: parsedCourseId });

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(
        parsed.error,
        "Invalid chapter payload.",
      ),
    };
  }

  try {
    const maxOrder = await dependencies.getMaxOrder(parsed.data.courseId);
    const title = input?.title?.trim() ? input.title.trim() : "New Chapter";
    const chapterId = await dependencies.insertChapter({
      courseId: parsed.data.courseId,
      title,
      order: (maxOrder ?? 0) + 1,
    });

    if (chapterId === undefined) {
      return { success: false, error: "Failed to create chapter." };
    }

    dependencies.revalidatePaths([`/admin/courses/${parsed.data.courseId}`]);

    return {
      success: true,
      data: { chapterId },
    };
  } catch (error) {
    console.error("Failed to create chapter", error);
    return { success: false, error: "Failed to create chapter." };
  }
}

export async function updateChapterWithDependencies(
  chapterId: string,
  data: ChapterUpdateInput,
  dependencies: ChapterActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedChapterId = parseEntityId(chapterId);

  if (parsedChapterId === null) {
    return { success: false, error: "Invalid chapter id." };
  }

  const parsed = chapterUpdateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(
        parsed.error,
        "Invalid chapter payload.",
      ),
    };
  }

  try {
    const courseIdForRevalidation =
      await dependencies.getChapterCourseId(parsedChapterId);

    await dependencies.updateChapter(parsedChapterId, {
      title: parsed.data.title,
    });

    dependencies.revalidatePaths(
      courseIdForRevalidation === null
        ? ["/admin/courses"]
        : ["/admin/courses", `/admin/courses/${courseIdForRevalidation}`],
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update chapter", error);
    return { success: false, error: "Failed to update chapter." };
  }
}

export async function deleteChapterWithDependencies(
  chapterId: string,
  dependencies: ChapterActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedChapterId = parseEntityId(chapterId);

  if (parsedChapterId === null) {
    return { success: false, error: "Invalid chapter id." };
  }

  try {
    const courseIdForRevalidation =
      await dependencies.getChapterCourseId(parsedChapterId);

    await dependencies.deleteChapter(parsedChapterId);
    dependencies.revalidatePaths(
      courseIdForRevalidation === null
        ? ["/admin/courses"]
        : ["/admin/courses", `/admin/courses/${courseIdForRevalidation}`],
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete chapter", error);
    return { success: false, error: "Failed to delete chapter." };
  }
}

export async function reorderChaptersWithDependencies(
  courseId: string,
  orderedIds: number[],
  dependencies: ChapterActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedCourseId = parseEntityId(courseId);

  if (parsedCourseId === null) {
    return { success: false, error: "Invalid course id." };
  }

  if (orderedIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { success: false, error: "Invalid chapter order payload." };
  }

  const updates = orderedIds.map((id, index) => ({ id, order: index + 1 }));

  try {
    await dependencies.runTransaction(
      updates,
      async (transactionUpdates) => {
        for (const update of transactionUpdates) {
          await dependencies.updateChapterOrder(update.id, update.order);
        }
      },
    );

    dependencies.revalidatePaths([`/admin/courses/${parsedCourseId}`]);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to reorder chapters", error);
    return { success: false, error: "Failed to reorder chapters." };
  }
}
