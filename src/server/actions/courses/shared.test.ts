import assert from "node:assert/strict";
import { test } from "vitest";

import {
  createCourseWithDependencies,
  deleteCourseWithDependencies,
  toggleCoursePublishStatusWithDependencies,
  uploadCourseThumbnailWithDependencies,
  updateCourseWithDependencies,
  type CourseActionDependencies,
} from "./shared.ts";

function createDependencies(
  overrides: Partial<CourseActionDependencies> = {},
): CourseActionDependencies {
  return {
    getSession: async () => ({ user: { id: "admin-1", role: "admin" } }),
    createDraftSlug: () => "draft-abc123",
    insertCourse: async () => 18,
    updateCourse: async () => undefined,
    findCourseById: async () => ({
      id: 5,
      isPublished: false,
      slug: "draft-course",
      thumbnailUrl: null,
    }),
    updateCourseThumbnail: async () => undefined,
    processThumbnailUpload: async () => new Uint8Array([1, 2, 3]),
    storeThumbnail: async () => ({
      thumbnailUrl: "/uploads/course-thumbnails/course-5.webp",
    }),
    cleanupThumbnail: async () => undefined,
    setCoursePublishState: async () => undefined,
    deleteCourse: async () => undefined,
    revalidatePaths: () => undefined,
    ...overrides,
  };
}

void test("createCourseWithDependencies rejects unauthorized requests", async () => {
  const result = await createCourseWithDependencies(
    createDependencies({ getSession: async () => null }),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Unauthorized.",
  });
});

void test("createCourseWithDependencies inserts a draft course and returns its id", async () => {
  let receivedValues: unknown;
  let revalidatedPaths: string[] = [];

  const result = await createCourseWithDependencies(
    createDependencies({
      insertCourse: async (values) => {
        receivedValues = values;
        return 18;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, {
    success: true,
    data: { courseId: "18" },
  });
  assert.deepEqual(receivedValues, {
    title: "Untitled Course",
    slug: "draft-abc123",
    description: null,
    thumbnailUrl: null,
    isFree: false,
    isPublished: false,
  });
  assert.deepEqual(revalidatedPaths, ["/admin/courses"]);
});

void test("updateCourseWithDependencies validates payloads before persisting", async () => {
  const result = await updateCourseWithDependencies(
    "12",
    {
      title: "",
      description: "",
      thumbnailUrl: "",
      isFree: true,
    },
    createDependencies(),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Title is required",
  });
});

void test("toggleCoursePublishStatusWithDependencies flips publish state and revalidates both routes", async () => {
  let receivedState: boolean | null = null;
  let revalidatedPaths: string[] = [];

  const result = await toggleCoursePublishStatusWithDependencies(
    "5",
    createDependencies({
      setCoursePublishState: async (_courseId, isPublished) => {
        receivedState = isPublished;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, {
    success: true,
    data: { newStatus: "published" },
  });
  assert.equal(receivedState, true);
  assert.deepEqual(revalidatedPaths, [
    "/courses",
    "/admin/courses",
    "/admin/courses/5",
  ]);
});

void test("deleteCourseWithDependencies removes the course and refreshes admin plus catalog routes", async () => {
  let receivedCourseId: number | null = null;
  let revalidatedPaths: string[] = [];

  const result = await deleteCourseWithDependencies(
    "5",
    createDependencies({
      deleteCourse: async (courseId) => {
        receivedCourseId = courseId;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, {
    success: true,
    data: undefined,
  });
  assert.equal(receivedCourseId, 5);
  assert.deepEqual(revalidatedPaths, ["/admin/courses", "/courses"]);
});

void test("uploadCourseThumbnailWithDependencies validates file formats before processing", async () => {
  const formData = new FormData();
  formData.append(
    "thumbnail",
    new File([new Uint8Array([1, 2, 3])], "thumbnail.gif", {
      type: "image/gif",
    }),
  );

  const result = await uploadCourseThumbnailWithDependencies(
    "5",
    formData,
    createDependencies(),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Unsupported thumbnail format. Upload JPG, PNG, or WebP.",
  });
});

void test("uploadCourseThumbnailWithDependencies stores the processed thumbnail and revalidates affected routes", async () => {
  let updatedThumbnail: string | null = null;
  let revalidatedPaths: string[] = [];

  const formData = new FormData();
  formData.append(
    "thumbnail",
    new File([new Uint8Array([1, 2, 3])], "thumbnail.png", {
      type: "image/png",
    }),
  );

  const result = await uploadCourseThumbnailWithDependencies(
    "5",
    formData,
    createDependencies({
      findCourseById: async () => ({
        id: 5,
        isPublished: false,
        slug: "draft-course",
        thumbnailUrl: "/uploads/course-thumbnails/old.webp",
      }),
      updateCourseThumbnail: async (_courseId, thumbnailUrl) => {
        updatedThumbnail = thumbnailUrl;
      },
      revalidatePaths: (paths) => {
        revalidatedPaths = paths;
      },
    }),
  );

  assert.deepEqual(result, {
    success: true,
    data: {
      thumbnailUrl: "/uploads/course-thumbnails/course-5.webp",
    },
  });
  assert.equal(updatedThumbnail, "/uploads/course-thumbnails/course-5.webp");
  assert.deepEqual(revalidatedPaths, [
    "/admin/courses",
    "/admin/courses/5",
    "/courses",
    "/courses/draft-course",
  ]);
});

void test("uploadCourseThumbnailWithDependencies returns a processing error without overwriting the current thumbnail", async () => {
  let updatedThumbnailCallCount = 0;
  const formData = new FormData();
  formData.append(
    "thumbnail",
    new File([new Uint8Array([1, 2, 3])], "thumbnail.png", {
      type: "image/png",
    }),
  );

  const result = await uploadCourseThumbnailWithDependencies(
    "5",
    formData,
    createDependencies({
      processThumbnailUpload: async () => {
        throw new Error("sharp failed");
      },
      updateCourseThumbnail: async () => {
        updatedThumbnailCallCount += 1;
      },
    }),
  );

  assert.deepEqual(result, {
    success: false,
    error: "Failed to process thumbnail. Please try another image.",
  });
  assert.equal(updatedThumbnailCallCount, 0);
});
