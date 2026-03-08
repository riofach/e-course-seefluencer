import { asc, desc, eq } from "drizzle-orm";

import { courses } from "../db/schema.ts";

export type PublishedCourseCatalogItem = {
  id: number;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string | null;
  accessLabel: "Free" | "Premium";
};

type PublishedCourseCatalogRow = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  thumbnailUrl: string | null;
  isFree: boolean;
};

export type PublishedCourseCatalogQuery = {
  findMany: (args: {
    where: ReturnType<typeof eq>;
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
  }) => Promise<PublishedCourseCatalogRow[]>;
};

export function toPublishedCourseCatalogItem(
  course: PublishedCourseCatalogRow,
): PublishedCourseCatalogItem {
  const trimmedDescription = course.description?.trim();

  return {
    id: course.id,
    title: course.title,
    description:
      trimmedDescription && trimmedDescription.length > 0
        ? trimmedDescription
        : "Materi segera hadir. Lihat detail kursus untuk ringkasan lengkap.",
    slug: course.slug,
    thumbnailUrl: course.thumbnailUrl,
    accessLabel: course.isFree ? "Free" : "Premium",
  };
}

export async function fetchPublishedCourseCatalog(
  query: PublishedCourseCatalogQuery,
  limit = 20,
  offset = 0,
): Promise<PublishedCourseCatalogItem[]> {
  const publishedCourses = await query.findMany({
    where: eq(courses.isPublished, true),
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
