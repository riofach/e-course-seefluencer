import "server-only";

import { and, eq, gt } from "drizzle-orm";

import { db } from "../db/index.ts";
import { chapters, courses, lessons, subscriptions } from "../db/schema.ts";
import {
  fetchHasActiveSubscription,
  fetchLessonById,
  mapLessonDetailRows,
  parseLessonId,
  type ActiveSubscriptionQuery,
  type LessonDetail,
  type LessonDetailJoinRow,
  type LessonDetailRowsLoader,
} from "./lesson-detail.shared.ts";

export {
  fetchHasActiveSubscription,
  fetchLessonById,
  mapLessonDetailRows,
  parseLessonId,
};
export type {
  ActiveSubscriptionQuery,
  LessonDetail,
  LessonDetailJoinRow,
  LessonDetailRowsLoader,
};

export async function getLessonById(
  lessonId: string,
  courseSlug: string,
): Promise<LessonDetail | null> {
  const loadRows: LessonDetailRowsLoader = async (parsedLessonId, slug) => {
    const rows = await db
      .select({
        lesson: {
          id: lessons.id,
          title: lessons.title,
          type: lessons.type,
          content: lessons.content,
          isFree: lessons.isFree,
          order: lessons.order,
        },
        chapter: {
          id: chapters.id,
          title: chapters.title,
          order: chapters.order,
        },
        course: {
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
          isFree: courses.isFree,
        },
      })
      .from(lessons)
      .innerJoin(chapters, eq(chapters.id, lessons.chapterId))
      .innerJoin(courses, eq(courses.id, chapters.courseId))
      .where(
        and(
          eq(lessons.id, parsedLessonId),
          eq(courses.slug, slug),
          eq(courses.isPublished, true),
        ),
      )
      .limit(1);

    return rows satisfies LessonDetailJoinRow[];
  };

  return fetchLessonById(loadRows, lessonId, courseSlug);
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const query: ActiveSubscriptionQuery = {
    findFirst: (args) =>
      db.query.subscriptions.findFirst({
        ...args,
        where: and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gt(subscriptions.endDate, new Date()),
        ),
      }),
  };

  return fetchHasActiveSubscription(query, userId);
}
