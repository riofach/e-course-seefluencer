import type { chapters, lessons } from "../db/schema.ts";

type SidebarLessonRecord = Pick<
  typeof lessons.$inferSelect,
  "id" | "title" | "type" | "order"
>;

type SidebarChapterRecord = Pick<
  typeof chapters.$inferSelect,
  "id" | "title" | "order"
>;

export type SidebarLesson = SidebarLessonRecord;

export type SidebarChapter = SidebarChapterRecord & {
  lessons: SidebarLesson[];
};

export type CourseSidebarData = {
  chapters: SidebarChapter[];
  completedLessonIds: number[];
  totalLessons: number;
  completedCount: number;
};

export type AdjacentLessonLink = {
  id: number;
  title: string;
};

export type AdjacentLessons = {
  prevLesson: AdjacentLessonLink | null;
  nextLesson: AdjacentLessonLink | null;
};

type SortedLessonRef = {
  id: number;
  order: number;
};

type ProgressRow = {
  lessonId: number;
};

export function toLessonTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case "video":
      return "Video";
    case "text":
      return "Text";
    case "quiz":
      return "Quiz";
    default:
      return type;
  }
}

export function getAdjacentLessonsFromSortedList(
  lessons: SortedLessonRef[],
  activeLessonId: number,
): { prevLesson: { id: number } | null; nextLesson: { id: number } | null } {
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLessonId);

  if (activeIndex === -1) {
    return {
      prevLesson: null,
      nextLesson: null,
    };
  }

  return {
    prevLesson:
      activeIndex > 0 ? { id: lessons[activeIndex - 1]!.id } : null,
    nextLesson:
      activeIndex < lessons.length - 1 ? { id: lessons[activeIndex + 1]!.id } : null,
  };
}

export function mapProgressToCompletedIds(progressRows: ProgressRow[]): Set<number> {
  return new Set(progressRows.map((row) => row.lessonId));
}

export function calculateProgressPercent(
  completedCount: number,
  totalLessons: number,
): number {
  if (totalLessons === 0) {
    return 0;
  }

  return Math.round((completedCount / totalLessons) * 100);
}
