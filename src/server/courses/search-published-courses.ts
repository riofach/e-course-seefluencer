import { and, asc, desc, eq, ilike } from "drizzle-orm";

import { courses } from "../db/schema.ts";
import {
  toPublishedCourseCatalogItem,
  type PublishedCourseCatalogItem,
} from "./published-course-catalog.ts";

type SearchPublishedCoursesRow = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  thumbnailUrl: string | null;
  isFree: boolean;
};

export type SearchPublishedCoursesQuery = {
  findMany: (args: {
    where: ReturnType<typeof and>;
    columns: {
      id: true;
      title: true;
      description: true;
      slug: true;
      thumbnailUrl: true;
      isFree: true;
    };
    orderBy: [ReturnType<typeof desc>, ReturnType<typeof asc>];
    limit?: number;
    offset?: number;
  }) => Promise<SearchPublishedCoursesRow[]>;
};

export async function fetchSearchPublishedCourses(
  query: SearchPublishedCoursesQuery,
  searchTerm: string,
  limit = 20,
  offset = 0,
): Promise<PublishedCourseCatalogItem[]> {
  const normalizedSearchTerm = searchTerm.trim().slice(0, 100);
  const escapedSearchTerm = normalizedSearchTerm.replace(/([%_\\])/g, "\\$1");

  const publishedCourses = await query.findMany({
    where: and(
      eq(courses.isPublished, true),
      ilike(courses.title, `%${escapedSearchTerm}%`),
    ),
    columns: {
      id: true,
      title: true,
      description: true,
      slug: true,
      thumbnailUrl: true,
      isFree: true,
    },
    orderBy: [desc(courses.updatedAt), asc(courses.id)],
    limit,
    offset,
  });

  return publishedCourses.map(toPublishedCourseCatalogItem);
}

export async function searchPublishedCourses(
  searchTerm: string,
  limit = 20,
  offset = 0,
): Promise<PublishedCourseCatalogItem[]> {
  const { db } = await import("../db/index.ts");

  return fetchSearchPublishedCourses(
    db.query.courses,
    searchTerm,
    limit,
    offset,
  );
}
