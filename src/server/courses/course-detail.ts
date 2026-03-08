import "server-only";

import { and, asc, eq, getTableColumns } from "drizzle-orm";

import { chapters, courses, lessons } from "../db/schema.ts";
import {
  fetchCourseDetailBySlug,
  fetchPublishedCourseSlugs,
  mapCourseDetailRows,
  toCourseDetailItem,
  type CourseDetailItem,
  type CourseSlugQuery,
} from "./course-detail.shared.ts";

export {
  fetchCourseDetailBySlug,
  fetchPublishedCourseSlugs,
  mapCourseDetailRows,
  toCourseDetailItem,
};
export type {
  CourseDetailItem,
  CourseDetailQuery,
  CourseSlugQuery,
} from "./course-detail.shared.ts";

export async function getCourseDetailBySlug(
  slug: string,
): Promise<CourseDetailItem | null> {
  const { db } = await import("../db/index.ts");

  const rows = await db
    .select({
      course: getTableColumns(courses),
      chapter: {
        id: chapters.id,
        title: chapters.title,
        order: chapters.order,
      },
      lesson: {
        id: lessons.id,
        title: lessons.title,
        type: lessons.type,
        order: lessons.order,
        isFree: lessons.isFree,
      },
    })
    .from(courses)
    .leftJoin(chapters, eq(chapters.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.chapterId, chapters.id))
    .where(and(eq(courses.slug, slug), eq(courses.isPublished, true)))
    .orderBy(asc(chapters.order), asc(lessons.order));

  return mapCourseDetailRows(rows);
}

export async function getPublishedCourseSlugs(): Promise<
  Array<{ slug: string }>
> {
  const { db } = await import("../db/index.ts");

  return fetchPublishedCourseSlugs(
    db.query.courses as unknown as CourseSlugQuery,
  );
}
