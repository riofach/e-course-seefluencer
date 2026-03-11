import { test } from "vitest";
import assert from "node:assert/strict";

import {
  fetchPublishedCourseCatalog,
  toPublishedCourseCatalogItem,
  type PublishedCourseCatalogItem,
  type PublishedCourseCatalogQuery,
} from "./published-course-catalog.ts";

void test("toPublishedCourseCatalogItem normalizes free published courses", () => {
  const course = toPublishedCourseCatalogItem({
    id: 1,
    title: "React Dasar",
    description: "Belajar pondasi React.",
    slug: "react-dasar",
    thumbnailUrl: null,
    isFree: true,
  });

  assert.deepEqual(course, {
    id: 1,
    title: "React Dasar",
    description: "Belajar pondasi React.",
    slug: "react-dasar",
    thumbnailUrl: null,
    accessLabel: "Free",
  } satisfies PublishedCourseCatalogItem);
});

void test("toPublishedCourseCatalogItem adds fallback description for blank values", () => {
  const course = toPublishedCourseCatalogItem({
    id: 2,
    title: "TypeScript Lanjut",
    description: "   ",
    slug: "typescript-lanjut",
    thumbnailUrl: "https://example.com/ts.png",
    isFree: false,
  });

  assert.equal(
    course.description,
    "Materi segera hadir. Lihat detail kursus untuk ringkasan lengkap.",
  );
  assert.equal(course.accessLabel, "Premium");
});

void test("fetchPublishedCourseCatalog requests only the published catalog fields", async () => {
  let receivedArgs: unknown;

  const mockQuery: PublishedCourseCatalogQuery = {
    findMany: async (args) => {
      receivedArgs = args;

      return [
        {
          id: 3,
          title: "Next.js untuk Pemula",
          description: null,
          slug: "nextjs-pemula",
          thumbnailUrl: null,
          isFree: true,
        },
      ];
    },
  };

  const catalog = await fetchPublishedCourseCatalog(mockQuery, 20, 0);

  assert.deepEqual(catalog, [
    {
      id: 3,
      title: "Next.js untuk Pemula",
      description:
        "Materi segera hadir. Lihat detail kursus untuk ringkasan lengkap.",
      slug: "nextjs-pemula",
      thumbnailUrl: null,
      accessLabel: "Free",
    },
  ]);

  assert.ok(receivedArgs && typeof receivedArgs === "object");

  if (!receivedArgs || typeof receivedArgs !== "object") {
    throw new Error("Expected query args to be captured.");
  }

  const typedArgs = receivedArgs as Parameters<
    PublishedCourseCatalogQuery["findMany"]
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
  assert.equal(typedArgs.limit, 20);
  assert.equal(typedArgs.offset, 0);
});
