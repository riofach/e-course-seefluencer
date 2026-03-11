import assert from "node:assert/strict";
import { test } from "vitest";

import {
  getAllCoursesFromQuery,
  getCourseByIdFromQuery,
  type CourseAdminListItem,
} from "./courses.shared.ts";

void test("getAllCoursesFromQuery returns every course ordered by creation date", async () => {
  const rows: CourseAdminListItem[] = [
    {
      id: 2,
      title: "Published Course",
      description: null,
      thumbnailUrl: null,
      slug: "published-course",
      isFree: false,
      isPublished: true,
      createdAt: new Date("2026-03-10T09:00:00.000Z"),
      updatedAt: new Date("2026-03-10T09:00:00.000Z"),
    },
  ];

  const result = await getAllCoursesFromQuery(async () => rows);

  assert.deepEqual(result, rows);
});

void test("getCourseByIdFromQuery returns undefined for invalid course ids", async () => {
  let called = false;

  const result = await getCourseByIdFromQuery("abc", async () => {
    called = true;
    return undefined;
  });

  assert.equal(result, undefined);
  assert.equal(called, false);
});

void test("getCourseByIdFromQuery forwards parsed numeric ids to the query", async () => {
  let receivedCourseId = 0;

  const result = await getCourseByIdFromQuery("42", async (courseId) => {
    receivedCourseId = courseId;

    return {
      id: 42,
      title: "Draft",
      description: "Desc",
      thumbnailUrl: null,
      slug: "draft-course",
      isFree: true,
      isPublished: false,
      createdAt: new Date("2026-03-10T09:00:00.000Z"),
      updatedAt: new Date("2026-03-10T09:00:00.000Z"),
    };
  });

  assert.equal(receivedCourseId, 42);
  assert.equal(result?.id, 42);
});
