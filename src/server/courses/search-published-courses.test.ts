import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchSearchPublishedCourses,
  type SearchPublishedCoursesQuery,
} from "./search-published-courses.ts";

void test("fetchSearchPublishedCourses requests published title matches only", async () => {
  let receivedArgs: unknown;

  const mockQuery: SearchPublishedCoursesQuery = {
    findMany: async (args) => {
      receivedArgs = args;

      return [
        {
          id: 7,
          title: "Belajar React",
          description: "Kursus React untuk pemula.",
          slug: "belajar-react",
          thumbnailUrl: null,
          isFree: true,
        },
      ];
    },
  };

  const courses = await fetchSearchPublishedCourses(
    mockQuery,
    "  100% react_js  ",
    12,
    4,
  );

  assert.deepEqual(courses, [
    {
      id: 7,
      title: "Belajar React",
      description: "Kursus React untuk pemula.",
      slug: "belajar-react",
      thumbnailUrl: null,
      accessLabel: "Free",
    },
  ]);

  assert.ok(receivedArgs && typeof receivedArgs === "object");

  if (!receivedArgs || typeof receivedArgs !== "object") {
    throw new Error("Expected query args to be captured.");
  }

  const typedArgs = receivedArgs as Parameters<
    SearchPublishedCoursesQuery["findMany"]
  >[0];

  assert.deepEqual(typedArgs.columns, {
    id: true,
    title: true,
    description: true,
    slug: true,
    thumbnailUrl: true,
    isFree: true,
  });
  assert.ok("where" in typedArgs);
  assert.ok("orderBy" in typedArgs);
  assert.equal(typedArgs.limit, 12);
  assert.equal(typedArgs.offset, 4);
});

void test("fetchSearchPublishedCourses preserves mapper fallback description", async () => {
  const mockQuery: SearchPublishedCoursesQuery = {
    findMany: async () => [
      {
        id: 9,
        title: "Next.js Search",
        description: "   ",
        slug: "nextjs-search",
        thumbnailUrl: null,
        isFree: false,
      },
    ],
  };

  const courses = await fetchSearchPublishedCourses(mockQuery, "next", 20, 0);

  assert.equal(
    courses[0]?.description,
    "Materi segera hadir. Lihat detail kursus untuk ringkasan lengkap.",
  );
  assert.equal(courses[0]?.accessLabel, "Premium");
});
