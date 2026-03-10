import assert from "node:assert/strict";
import test from "node:test";

import {
  courseCreateSchema,
  courseUpdateSchema,
  type CourseUpdateInput,
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

void test("courseUpdateSchema rejects invalid thumbnail urls", () => {
  const result = courseUpdateSchema.safeParse({
    title: "Draft Course",
    description: "Desc",
    thumbnailUrl: "not-a-url",
    isFree: true,
  });

  assert.equal(result.success, false);
});
