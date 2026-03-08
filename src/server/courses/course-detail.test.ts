import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchCourseDetailBySlug,
  fetchPublishedCourseSlugs,
  mapCourseDetailRows,
  toCourseDetailItem,
  type CourseDetailItem,
  type CourseDetailQuery,
  type CourseSlugQuery,
} from "./course-detail.shared.ts";

void test("toCourseDetailItem applies fallback description for blank values", () => {
  const course = toCourseDetailItem({
    id: 11,
    title: "React Lanjut",
    description: "   ",
    thumbnailUrl: null,
    isFree: false,
    slug: "react-lanjut",
    chapters: [],
  });

  assert.deepEqual(course, {
    id: 11,
    title: "React Lanjut",
    description: "Ringkasan kursus akan segera tersedia.",
    thumbnailUrl: null,
    isFree: false,
    slug: "react-lanjut",
    chapters: [],
  } satisfies CourseDetailItem);
});

void test("mapCourseDetailRows properly maps flat join rows into structured nested course data", () => {
  const result = mapCourseDetailRows([
    {
      course: {
        id: 1,
        title: "Course A",
        description: "Desc",
        thumbnailUrl: null,
        isFree: true,
        slug: "course-a",
      },
      chapter: {
        id: 10,
        title: "Chapter 1",
        order: 1,
      },
      lesson: {
        id: 100,
        title: "Lesson 1",
        type: "video",
        order: 1,
        isFree: true,
      },
    },
    {
      course: {
        id: 1,
        title: "Course A",
        description: "Desc",
        thumbnailUrl: null,
        isFree: true,
        slug: "course-a",
      },
      chapter: {
        id: 10,
        title: "Chapter 1",
        order: 1,
      },
      lesson: {
        id: 101,
        title: "Lesson 2",
        type: "text",
        order: 2,
        isFree: false,
      },
    },
    {
      course: {
        id: 1,
        title: "Course A",
        description: "Desc",
        thumbnailUrl: null,
        isFree: true,
        slug: "course-a",
      },
      chapter: {
        id: 20,
        title: "Chapter 2",
        order: 2,
      },
      lesson: null,
    },
  ]);

  assert.deepEqual(result, {
    id: 1,
    title: "Course A",
    description: "Desc",
    thumbnailUrl: null,
    isFree: true,
    slug: "course-a",
    chapters: [
      {
        id: 10,
        title: "Chapter 1",
        order: 1,
        lessons: [
          {
            id: 100,
            title: "Lesson 1",
            type: "video",
            order: 1,
            isFree: true,
          },
          {
            id: 101,
            title: "Lesson 2",
            type: "text",
            order: 2,
            isFree: false,
          },
        ],
      },
      {
        id: 20,
        title: "Chapter 2",
        order: 2,
        lessons: [],
      },
    ],
  });
});

void test("mapCourseDetailRows returns null when rows are empty", () => {
  assert.equal(mapCourseDetailRows([]), null);
});

void test("fetchCourseDetailBySlug returns published ordered course detail", async () => {
  let receivedArgs: unknown;

  const mockQuery: CourseDetailQuery = {
    findMany: async (args) => {
      receivedArgs = args;

      return [
        {
          id: 1,
          title: "Belajar Next.js",
          description: "Panduan lengkap App Router.",
          thumbnailUrl: "https://example.com/next.png",
          isFree: false,
          slug: "belajar-nextjs",
          chapters: [
            {
              id: 101,
              title: "Dasar",
              order: 1,
              lessons: [
                {
                  id: 1001,
                  title: "Pengenalan",
                  type: "video",
                  order: 1,
                  isFree: true,
                },
                {
                  id: 1002,
                  title: "Routing",
                  type: "text",
                  order: 2,
                  isFree: false,
                },
              ],
            },
          ],
        },
      ];
    },
  };

  const result = await fetchCourseDetailBySlug(mockQuery, "belajar-nextjs");

  assert.deepEqual(result, {
    id: 1,
    title: "Belajar Next.js",
    description: "Panduan lengkap App Router.",
    thumbnailUrl: "https://example.com/next.png",
    isFree: false,
    slug: "belajar-nextjs",
    chapters: [
      {
        id: 101,
        title: "Dasar",
        order: 1,
        lessons: [
          {
            id: 1001,
            title: "Pengenalan",
            type: "video",
            order: 1,
            isFree: true,
          },
          {
            id: 1002,
            title: "Routing",
            type: "text",
            order: 2,
            isFree: false,
          },
        ],
      },
    ],
  } satisfies CourseDetailItem);

  assert.ok(receivedArgs && typeof receivedArgs === "object");

  if (!receivedArgs || typeof receivedArgs !== "object") {
    throw new Error("Expected query args to be captured.");
  }

  const typedArgs = receivedArgs as Parameters<
    CourseDetailQuery["findMany"]
  >[0];

  assert.deepEqual(typedArgs.columns, {
    id: true,
    title: true,
    description: true,
    thumbnailUrl: true,
    isFree: true,
    slug: true,
  });
  assert.deepEqual(typedArgs.with.chapters.columns, {
    id: true,
    title: true,
    order: true,
  });
  assert.deepEqual(typedArgs.with.chapters.with.lessons.columns, {
    id: true,
    title: true,
    type: true,
    order: true,
    isFree: true,
  });
  assert.equal(typedArgs.with.chapters.orderBy.length, 1);
  assert.equal(typedArgs.with.chapters.with.lessons.orderBy.length, 1);
  assert.equal(typedArgs.limit, 1);
});

void test("fetchCourseDetailBySlug returns null for missing course", async () => {
  const mockQuery: CourseDetailQuery = {
    findMany: async () => [],
  };

  const result = await fetchCourseDetailBySlug(mockQuery, "missing-course");

  assert.equal(result, null);
});

void test("fetchPublishedCourseSlugs returns only published slugs", async () => {
  let receivedArgs: unknown;

  const result = await fetchPublishedCourseSlugs({
    findMany: async (args) => {
      receivedArgs = args;
      return [{ slug: "belajar-nextjs" }, { slug: "react-dasar" }];
    },
  } satisfies CourseSlugQuery);

  assert.deepEqual(result, [
    { slug: "belajar-nextjs" },
    { slug: "react-dasar" },
  ]);

  assert.ok(receivedArgs && typeof receivedArgs === "object");

  if (!receivedArgs || typeof receivedArgs !== "object") {
    throw new Error("Expected query args to be captured.");
  }

  const typedArgs = receivedArgs as Parameters<CourseSlugQuery["findMany"]>[0];

  assert.deepEqual(typedArgs.columns, {
    slug: true,
  });
  assert.equal(typedArgs.orderBy.length, 1);
});
