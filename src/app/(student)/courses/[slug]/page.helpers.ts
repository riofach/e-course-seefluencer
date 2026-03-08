import type { CourseDetailItem } from "~/server/courses/course-detail";

export async function resolveCoursePageData(
  slug: string,
  getCourseDetail: (slug: string) => Promise<CourseDetailItem | null>,
  triggerNotFound: () => never,
) {
  const course = await getCourseDetail(slug);

  if (!course) {
    return triggerNotFound();
  }

  return course;
}

export async function resolveCourseStaticParams(
  getSlugs: () => Promise<Array<{ slug: string }>>,
) {
  const slugs = await getSlugs();
  return slugs.map((course) => ({ slug: course.slug }));
}
