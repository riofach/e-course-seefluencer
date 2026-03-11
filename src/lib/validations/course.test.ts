import assert from "node:assert/strict";
import { test } from "vitest";

import {
  COURSE_THUMBNAIL_MAX_FILE_SIZE_BYTES,
  courseCreateSchema,
  courseUpdateSchema,
  type CourseUpdateInput,
  validateCourseThumbnailFile,
} from "./course.ts";

void test("courseCreateSchema requires a non-empty title", () => {
  const result = courseCreateSchema.safeParse({ title: "" });

  assert.equal(result.success, false);
});

void test("courseUpdateSchema accepts valid draft updates", () => {
  const result = courseUpdateSchema.safeParse({
    title: "Belajar Next.js",
    description: "Bangun App Router end-to-end",
    thumbnailUrl: "https://example.com/nextjs.png",
    isFree: false,
  });

  assert.equal(result.success, true);

  if (!result.success) {
    assert.fail("Expected valid course update payload");
  }

  assert.deepEqual(result.data, {
    title: "Belajar Next.js",
    description: "Bangun App Router end-to-end",
    thumbnailUrl: "https://example.com/nextjs.png",
    isFree: false,
  } satisfies CourseUpdateInput);
});

void test("courseUpdateSchema allows an empty thumbnail url", () => {
  const result = courseUpdateSchema.safeParse({
    title: "Draft Course",
    description: "",
    thumbnailUrl: "",
    isFree: true,
  });

  assert.equal(result.success, true);
});

void test("courseUpdateSchema accepts root-relative thumbnail paths for local transitional storage", () => {
  const result = courseUpdateSchema.safeParse({
    title: "Draft Course",
    description: "Desc",
    thumbnailUrl: "/uploads/course-thumbnails/course-1.webp",
    isFree: true,
  });

  assert.equal(result.success, true);
});

void test("courseUpdateSchema rejects invalid thumbnail urls", () => {
  const result = courseUpdateSchema.safeParse({
    title: "Draft Course",
    description: "Desc",
    thumbnailUrl: "not-a-url",
    isFree: true,
  });

  assert.equal(result.success, false);
});

void test("validateCourseThumbnailFile rejects unsupported formats", () => {
  const result = validateCourseThumbnailFile({
    name: "thumbnail.gif",
    size: 1024,
    type: "image/gif",
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unsupported thumbnail format. Upload JPG, PNG, or WebP.",
  });
});

void test("validateCourseThumbnailFile rejects oversized uploads", () => {
  const result = validateCourseThumbnailFile({
    name: "thumbnail.png",
    size: COURSE_THUMBNAIL_MAX_FILE_SIZE_BYTES + 1,
    type: "image/png",
  });

  assert.deepEqual(result, {
    success: false,
    error: "Thumbnail file is too large. Maximum size is 5 MB.",
  });
});

void test("validateCourseThumbnailFile accepts supported thumbnail uploads", () => {
  const result = validateCourseThumbnailFile({
    name: "thumbnail.webp",
    size: 2048,
    type: "image/webp",
  });

  assert.equal(result.success, true);
});
