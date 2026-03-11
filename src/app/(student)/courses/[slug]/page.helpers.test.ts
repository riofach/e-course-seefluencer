import assert from "node:assert/strict";
import { test } from "vitest";

import {
  resolveCoursePageData,
  resolveCourseStaticParams,
} from "./page.helpers.ts";

void test("resolveCoursePageData returns course detail when slug exists", async () => {
  const result = await resolveCoursePageData(
    "react-dasar",
    async () => ({
      id: 1,
      title: "React Dasar",
      description: "Belajar React dari nol.",
      thumbnailUrl: null,
      isFree: true,
      slug: "react-dasar",
      chapters: [],
    }),
    () => {
      throw new Error("notFound should not be called");
    },
  );

  assert.equal(result.slug, "react-dasar");
});

void test("resolveCoursePageData calls notFound when slug is missing", async () => {
  let called = false;

  await assert.rejects(
    async () =>
      resolveCoursePageData(
        "missing",
        async () => null,
        () => {
          called = true;
          throw new Error("NEXT_NOT_FOUND");
        },
      ),
    /NEXT_NOT_FOUND/,
  );

  assert.equal(called, true);
});

void test("resolveCourseStaticParams maps published slugs for ISR", async () => {
  const params = await resolveCourseStaticParams(async () => [
    { slug: "belajar-nextjs" },
    { slug: "react-dasar" },
  ]);

  assert.deepEqual(params, [
    { slug: "belajar-nextjs" },
    { slug: "react-dasar" },
  ]);
});
