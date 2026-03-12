const DRAFT_SLUG_PREFIX = "draft-";

export function isDraftCourseSlug(slug: string): boolean {
  return slug.startsWith(DRAFT_SLUG_PREFIX);
}

export function slugifyCourseTitle(title: string): string {
  const normalizedTitle = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const slug = normalizedTitle
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug.length > 0 ? slug : "course";
}

export async function generateUniquePublishedCourseSlug(args: {
  courseId: number;
  title: string;
  isSlugTaken: (slug: string, excludeCourseId: number) => Promise<boolean>;
}): Promise<string> {
  const baseSlug = slugifyCourseTitle(args.title);

  for (let suffix = 0; ; suffix += 1) {
    const candidateSlug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const slugTaken = await args.isSlugTaken(candidateSlug, args.courseId);

    if (!slugTaken) {
      return candidateSlug;
    }
  }
}
