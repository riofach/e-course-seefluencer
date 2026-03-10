import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { courses } from "~/server/db/schema";
import {
  getAllCoursesFromQuery,
  getCourseByIdFromQuery,
  type CourseAdminListItem,
} from "./courses.shared";

export type { CourseAdminListItem } from "./courses.shared";

export async function getAllCourses(): Promise<CourseAdminListItem[]> {
  return getAllCoursesFromQuery(() =>
    db.select().from(courses).orderBy(desc(courses.createdAt)),
  );
}

export async function getCourseById(
  courseId: string,
): Promise<CourseAdminListItem | undefined> {
  return getCourseByIdFromQuery(courseId, async (parsedCourseId) => {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, parsedCourseId))
      .limit(1);

    return result[0];
  });
}
