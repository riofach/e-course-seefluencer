import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { chapters } from "~/server/db/schema";

import { getChaptersByCourseIdFromQuery, type ChapterRow } from "./chapters.shared";

export type { ChapterRow } from "./chapters.shared";

export async function getChaptersByCourseId(courseId: number): Promise<ChapterRow[]> {
  return getChaptersByCourseIdFromQuery(courseId, (parsedCourseId) =>
    db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, parsedCourseId))
      .orderBy(asc(chapters.order)),
  );
}
