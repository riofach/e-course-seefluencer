import type { SQL } from "drizzle-orm";

import type { chapters, courses, lessons } from "../db/schema.ts";

type LessonRecord = Pick<
  typeof lessons.$inferSelect,
  "id" | "title" | "type" | "content" | "isFree" | "order"
>;

type ChapterRecord = Pick<typeof chapters.$inferSelect, "id" | "title" | "order">;

type CourseRecord = Pick<
  typeof courses.$inferSelect,
  "id" | "title" | "slug" | "isFree"
>;

export type LessonDetail = LessonRecord & {
  videoUrl: string | null;
  chapter: ChapterRecord;
  course: CourseRecord;
};

export type LessonDetailJoinRow = {
  lesson: LessonRecord;
  chapter: ChapterRecord;
  course: CourseRecord;
};

export type LessonDetailRowsLoader = (
  lessonId: number,
  courseSlug: string,
) => Promise<LessonDetailJoinRow[]>;

export type ActiveSubscriptionQuery = {
  findFirst: (args: {
    columns: {
      id: true;
    };
    where: SQL<unknown> | undefined;
  }) => Promise<{ id: number } | undefined>;
};

export function parseLessonId(lessonId: string): number | null {
  const parsed = Number(lessonId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function mapLessonDetailRows(
  rows: LessonDetailJoinRow[],
): LessonDetail | null {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const content = firstRow.lesson.content;
  const normalizedType = firstRow.lesson.type.toLowerCase();

  return {
    ...firstRow.lesson,
    content,
    videoUrl: normalizedType === "video" ? content : null,
    chapter: firstRow.chapter,
    course: firstRow.course,
  };
}

export async function fetchLessonById(
  loadRows: LessonDetailRowsLoader,
  lessonId: string,
  courseSlug: string,
): Promise<LessonDetail | null> {
  const parsedLessonId = parseLessonId(lessonId);

  if (!parsedLessonId) {
    return null;
  }

  const rows = await loadRows(parsedLessonId, courseSlug);
  return mapLessonDetailRows(rows);
}

export async function fetchHasActiveSubscription(
  query: ActiveSubscriptionQuery,
  _userId: string,
) {
  const subscription = await query.findFirst({
    columns: {
      id: true,
    },
    where: undefined,
  });

  return Boolean(subscription?.id);
}
