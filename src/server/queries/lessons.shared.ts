import type { InferSelectModel } from "drizzle-orm";

import type { lessons } from "~/server/db/schema";

export type LessonRow = InferSelectModel<typeof lessons>;

export async function getLessonsByChapterIdFromQuery(
  chapterId: number,
  query: (parsedChapterId: number) => Promise<LessonRow[]>,
): Promise<LessonRow[]> {
  if (!Number.isInteger(chapterId) || chapterId <= 0) {
    return [];
  }

  return query(chapterId);
}

export async function getLessonsByCourseIdFromQuery(
  courseId: number,
  query: (parsedCourseId: number) => Promise<Record<number, LessonRow[]>>,
): Promise<Record<number, LessonRow[]>> {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return {};
  }

  return query(courseId);
}
