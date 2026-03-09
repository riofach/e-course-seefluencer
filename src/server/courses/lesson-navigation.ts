import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "../db/index.ts";
import { chapters, courses, lessons, userProgress } from "../db/schema.ts";
import {
  getAdjacentLessonsFromSortedList,
  type AdjacentLessons,
  type CourseSidebarData,
  type SidebarChapter,
} from "./lesson-navigation.shared.ts";

type CourseLessonRow = {
  chapter: Pick<typeof chapters.$inferSelect, "id" | "title" | "order">;
  lesson: Pick<typeof lessons.$inferSelect, "id" | "title" | "type" | "order" | "isFree">;
};

async function loadCourseLessonRows(courseSlug: string): Promise<CourseLessonRow[]> {
  return db
    .select({
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
    .innerJoin(chapters, eq(chapters.courseId, courses.id))
    .innerJoin(lessons, eq(lessons.chapterId, chapters.id))
    .where(and(eq(courses.slug, courseSlug), eq(courses.isPublished, true)))
    .orderBy(asc(chapters.order), asc(lessons.order));
}

function groupRowsIntoSidebarChapters(rows: CourseLessonRow[]): SidebarChapter[] {
  const chapterMap = new Map<number, SidebarChapter>();

  for (const row of rows) {
    const existingChapter = chapterMap.get(row.chapter.id);

    if (existingChapter) {
      existingChapter.lessons.push(row.lesson);
      continue;
    }

    chapterMap.set(row.chapter.id, {
      ...row.chapter,
      lessons: [row.lesson],
    });
  }

  return [...chapterMap.values()];
}

export async function getCourseSidebarData(
  courseSlug: string,
  userId: string,
): Promise<CourseSidebarData | null> {
  const rows = await loadCourseLessonRows(courseSlug);

  if (rows.length === 0) {
    return null;
  }

  const allLessonIds = rows.map((row) => row.lesson.id);
  const progressRows =
    allLessonIds.length === 0
      ? []
      : await db
          .select({
            lessonId: userProgress.lessonId,
          })
          .from(userProgress)
          .where(
            and(
              eq(userProgress.userId, userId),
              inArray(userProgress.lessonId, allLessonIds),
            ),
          );

  return {
    chapters: groupRowsIntoSidebarChapters(rows),
    completedLessonIds: progressRows.map((row) => row.lessonId),
    totalLessons: allLessonIds.length,
    completedCount: progressRows.length,
  };
}

export async function getAdjacentLessons(
  lessonId: number,
  courseSlug: string,
): Promise<AdjacentLessons> {
  const rows = await loadCourseLessonRows(courseSlug);
  const lessonTitleById = new Map(
    rows.map((row) => [row.lesson.id, row.lesson.title] as const),
  );
  const sortedLessons = rows.map((row) => ({
    id: row.lesson.id,
    order: row.lesson.order,
  }));
  const adjacent = getAdjacentLessonsFromSortedList(sortedLessons, lessonId);

  return {
    prevLesson:
      adjacent.prevLesson === null
        ? null
        : {
            id: adjacent.prevLesson.id,
            title: lessonTitleById.get(adjacent.prevLesson.id) ?? "",
          },
    nextLesson:
      adjacent.nextLesson === null
        ? null
        : {
            id: adjacent.nextLesson.id,
            title: lessonTitleById.get(adjacent.nextLesson.id) ?? "",
          },
  };
}
