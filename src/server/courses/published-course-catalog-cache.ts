import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import { db } from "../db";
import { fetchPublishedCourseCatalog } from "./published-course-catalog";

export const COURSE_CATALOG_REVALIDATE_SECONDS = 300;
export const COURSE_CATALOG_CACHE_TAG = "course-catalog";

export const getPublishedCourseCatalog = unstable_cache(
  async (limit = 20, offset = 0) =>
    fetchPublishedCourseCatalog(
      db.query.courses,
      Number(limit),
      Number(offset),
    ),
  ["published-course-catalog"],
  {
    revalidate: COURSE_CATALOG_REVALIDATE_SECONDS,
    tags: [COURSE_CATALOG_CACHE_TAG],
  },
);

export function revalidatePublishedCourseCatalog(): void {
  revalidateTag(COURSE_CATALOG_CACHE_TAG);
}
