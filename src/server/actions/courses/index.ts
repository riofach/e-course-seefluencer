"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";

import type { CourseUpdateInput } from "~/lib/validations/course";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { courses } from "~/server/db/schema";
import type { ActionResponse } from "~/types";
import type { CourseActionDependencies } from "./shared";

import {
  createCourseWithDependencies,
  deleteCourseWithDependencies,
  toggleCoursePublishStatusWithDependencies,
  uploadCourseThumbnailWithDependencies,
  updateCourseWithDependencies,
} from "./shared";
import {
  cleanupCourseThumbnailFile,
  processCourseThumbnailUpload,
  storeCourseThumbnailLocally,
} from "./thumbnail-storage";

const dependencies: CourseActionDependencies = {
  getSession: getServerAuthSession,
  createDraftSlug: () => `draft-${crypto.randomUUID()}`,
  insertCourse: async (values: {
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    isFree: boolean;
    isPublished: boolean;
  }) => {
    const result = await db.insert(courses).values(values).returning({ id: courses.id });
    return result[0]?.id;
  },
  updateCourse: async (
    courseId: number,
    data: {
      title: string;
      description: string | null;
      thumbnailUrl: string | null;
      isFree: boolean;
    },
  ) => {
    await db
      .update(courses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));
  },
  findCourseById: async (courseId: number) =>
    db.query.courses.findFirst({
      columns: {
        id: true,
        title: true,
        isPublished: true,
        slug: true,
        thumbnailUrl: true,
      },
      where: eq(courses.id, courseId),
    }),
  isCourseSlugTaken: async (slug: string, excludeCourseId: number) => {
    const existingCourse = await db.query.courses.findFirst({
      columns: { id: true },
      where: and(eq(courses.slug, slug), ne(courses.id, excludeCourseId)),
    });

    return existingCourse !== undefined;
  },
  updateCourseThumbnail: async (courseId: number, thumbnailUrl: string) => {
    await db
      .update(courses)
      .set({
        thumbnailUrl,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));
  },
  processThumbnailUpload: processCourseThumbnailUpload,
  storeThumbnail: async ({ courseId, content }: { courseId: number; content: Uint8Array }) =>
    storeCourseThumbnailLocally({ courseId, content }),
  cleanupThumbnail: async (thumbnailUrl: string) =>
    cleanupCourseThumbnailFile({ thumbnailUrl }),
  setCoursePublishState: async (
    courseId: number,
    isPublished: boolean,
    slug?: string,
  ) => {
    await db
      .update(courses)
      .set({
        isPublished,
        ...(slug ? { slug } : {}),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId));
  },
  deleteCourse: async (courseId: number) => {
    await db.delete(courses).where(eq(courses.id, courseId));
  },
  revalidatePaths: (paths: string[]) => {
    for (const path of paths) {
      revalidatePath(path);
    }
  },
};

export async function createCourse(): Promise<ActionResponse<{ courseId: string }>> {
  return createCourseWithDependencies(dependencies);
}

export async function updateCourse(
  courseId: string,
  data: CourseUpdateInput,
): Promise<ActionResponse<void>> {
  return updateCourseWithDependencies(courseId, data, dependencies);
}

export async function toggleCoursePublishStatus(
  courseId: string,
): Promise<ActionResponse<{ newStatus: string }>> {
  return toggleCoursePublishStatusWithDependencies(courseId, dependencies);
}

export async function uploadCourseThumbnail(
  courseId: string,
  formData: FormData,
): Promise<ActionResponse<{ thumbnailUrl: string }>> {
  return uploadCourseThumbnailWithDependencies(courseId, formData, dependencies);
}

export async function deleteCourse(
  courseId: string,
): Promise<ActionResponse<void>> {
  return deleteCourseWithDependencies(courseId, dependencies);
}
