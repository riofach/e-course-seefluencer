import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { chapters, lessons } from "~/server/db/schema";

import {
  getLessonsByChapterIdFromQuery,
  getLessonsByCourseIdFromQuery,
  type LessonRow,
} from "./lessons.shared";

export type { LessonRow } from "./lessons.shared";

export async function getLessonsByChapterId(
  chapterId: number,
): Promise<LessonRow[]> {
  return getLessonsByChapterIdFromQuery(chapterId, (parsedChapterId) =>
    db
      .select()
      .from(lessons)
      .where(eq(lessons.chapterId, parsedChapterId))
      .orderBy(asc(lessons.order)),
  );
}

export async function getLessonsByCourseId(
  courseId: number,
): Promise<Record<number, LessonRow[]>> {
  return getLessonsByCourseIdFromQuery(courseId, async (parsedCourseId) => {
    const rows = await db
      .select({ lesson: lessons })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(eq(chapters.courseId, parsedCourseId))
      .orderBy(asc(lessons.chapterId), asc(lessons.order));

    const map: Record<number, LessonRow[]> = {};

    for (const row of rows) {
      const chapterId = row.lesson.chapterId;

      map[chapterId] ??= [];

      map[chapterId]?.push(row.lesson);
    }

    return map;
  });
}
