import type { InferSelectModel } from "drizzle-orm";

import type { chapters } from "~/server/db/schema";

export type ChapterRow = InferSelectModel<typeof chapters> & {
  lessonCount: number;
};

export async function getChaptersByCourseIdFromQuery(
  courseId: number,
  query: (parsedCourseId: number) => Promise<ChapterRow[]>,
): Promise<ChapterRow[]> {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return [];
  }

  return query(courseId);
}
