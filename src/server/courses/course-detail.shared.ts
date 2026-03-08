import { and, asc, eq } from "drizzle-orm";

import { chapters, courses, lessons } from "../db/schema.ts";

type CourseDetailCourseRow = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  isFree: boolean;
  slug: string;
};

type CourseDetailLessonRow = {
  id: number;
  title: string;
  type: string;
  order: number;
  isFree: boolean;
};

type CourseDetailChapterRow = {
  id: number;
  title: string;
  order: number;
  lessons: CourseDetailLessonRow[];
};

export type CourseDetailItem = {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isFree: boolean;
  slug: string;
  chapters: Array<{
    id: number;
    title: string;
    order: number;
    lessons: Array<{
      id: number;
      title: string;
      type: string;
      order: number;
      isFree: boolean;
    }>;
  }>;
};

export type CourseDetailQuery = {
  findMany: (args: {
    where: ReturnType<typeof and>;
    columns: {
      id: true;
      title: true;
      description: true;
      thumbnailUrl: true;
      isFree: true;
      slug: true;
    };
    with: {
      chapters: {
        columns: {
          id: true;
          title: true;
          order: true;
        };
        orderBy: [ReturnType<typeof asc>];
        with: {
          lessons: {
            columns: {
              id: true;
              title: true;
              type: true;
              order: true;
              isFree: true;
            };
            orderBy: [ReturnType<typeof asc>];
          };
        };
      };
    };
    limit: number;
  }) => Promise<
    Array<
      CourseDetailCourseRow & {
        chapters: CourseDetailChapterRow[];
      }
    >
  >;
};

export type CourseSlugQuery = {
  findMany: (args: {
    where: ReturnType<typeof eq>;
    columns: {
      slug: true;
    };
    orderBy: [ReturnType<typeof asc>];
  }) => Promise<Array<{ slug: string }>>;
};

export function toCourseDetailItem(
  course:
    | (CourseDetailCourseRow & {
        chapters: CourseDetailChapterRow[];
      })
    | null
    | undefined,
): CourseDetailItem | null {
  if (!course) {
    return null;
  }

  const trimmedDescription = course.description?.trim();

  return {
    id: course.id,
    title: course.title,
    description:
      trimmedDescription && trimmedDescription.length > 0
        ? trimmedDescription
        : "Ringkasan kursus akan segera tersedia.",
    thumbnailUrl: course.thumbnailUrl,
    isFree: course.isFree,
    slug: course.slug,
    chapters: course.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        isFree: lesson.isFree,
      })),
    })),
  };
}

export type CourseDetailJoinRow = {
  course: {
    id: number;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    isFree: boolean;
    slug: string;
  };
  chapter: {
    id: number;
    title: string;
    order: number;
  } | null;
  lesson: {
    id: number;
    title: string;
    type: string;
    order: number;
    isFree: boolean;
  } | null;
};

export function mapCourseDetailRows(
  rows: CourseDetailJoinRow[],
): CourseDetailItem | null {
  if (rows.length === 0) {
    return null;
  }

  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const chapterMap = new Map<number, CourseDetailItem["chapters"][number]>();

  for (const row of rows) {
    const chapter = row.chapter;
    const lesson = row.lesson;

    if (!chapter) {
      continue;
    }

    const existingChapter = chapterMap.get(chapter.id);

    if (existingChapter) {
      if (lesson) {
        existingChapter.lessons.push({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          order: lesson.order,
          isFree: lesson.isFree,
        });
      }

      continue;
    }

    chapterMap.set(chapter.id, {
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      lessons: lesson
        ? [
            {
              id: lesson.id,
              title: lesson.title,
              type: lesson.type,
              order: lesson.order,
              isFree: lesson.isFree,
            },
          ]
        : [],
    });
  }

  return toCourseDetailItem({
    id: firstRow.course.id,
    title: firstRow.course.title,
    description: firstRow.course.description,
    thumbnailUrl: firstRow.course.thumbnailUrl,
    isFree: firstRow.course.isFree,
    slug: firstRow.course.slug,
    chapters: Array.from(chapterMap.values()),
  });
}

export async function fetchCourseDetailBySlug(
  query: CourseDetailQuery,
  slug: string,
): Promise<CourseDetailItem | null> {
  const [course] = await query.findMany({
    where: and(eq(courses.slug, slug), eq(courses.isPublished, true)),
    columns: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      isFree: true,
      slug: true,
    },
    with: {
      chapters: {
        columns: {
          id: true,
          title: true,
          order: true,
        },
        orderBy: [asc(chapters.order)],
        with: {
          lessons: {
            columns: {
              id: true,
              title: true,
              type: true,
              order: true,
              isFree: true,
            },
            orderBy: [asc(lessons.order)],
          },
        },
      },
    },
    limit: 1,
  });

  return toCourseDetailItem(course);
}

export async function fetchPublishedCourseSlugs(
  query: CourseSlugQuery,
): Promise<Array<{ slug: string }>> {
  return query.findMany({
    where: eq(courses.isPublished, true),
    columns: {
      slug: true,
    },
    orderBy: [asc(courses.slug)],
  });
}
