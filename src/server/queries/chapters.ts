import "server-only";

import { asc, count, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { chapters, lessons } from "~/server/db/schema";

import { getChaptersByCourseIdFromQuery, type ChapterRow } from "./chapters.shared";

export type { ChapterRow } from "./chapters.shared";

export async function getChaptersByCourseId(courseId: number): Promise<ChapterRow[]> {
  return getChaptersByCourseIdFromQuery(courseId, async (parsedCourseId) => {
    const rows = await db
      .select({
        id: chapters.id,
        courseId: chapters.courseId,
        title: chapters.title,
        description: chapters.description,
        order: chapters.order,
        createdAt: chapters.createdAt,
        lessonCount: count(lessons.id),
      })
      .from(chapters)
      .leftJoin(lessons, eq(lessons.chapterId, chapters.id))
      .where(eq(chapters.courseId, parsedCourseId))
      .groupBy(
        chapters.id,
        chapters.courseId,
        chapters.title,
        chapters.description,
        chapters.order,
        chapters.createdAt,
      )
      .orderBy(asc(chapters.order));

    return rows.map((row) => ({
      ...row,
      lessonCount: Number(row.lessonCount),
    }));
  });
}
