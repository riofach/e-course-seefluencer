import { Suspense } from "react";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { CourseCatalog } from "~/components/student/course-catalog";
import { CourseSearchInput } from "~/components/student/course-search-input";
import { normalizeCourseSearchTerm } from "~/components/student/course-search-input.helpers";
import { getPublishedCourseCatalog } from "~/server/courses/published-course-catalog-cache";
import { searchPublishedCourses } from "~/server/courses/search-published-courses";

export const metadata: Metadata = {
  title: "Katalog Kursus",
  description: "Jelajahi kursus publik Seefluencer yang siap dipelajari.",
};

export const revalidate = 300;

type SearchParamProps = {
  searchParams: Promise<{ limit?: string; offset?: string; q?: string }>;
};

export default async function CoursesPage(props: SearchParamProps) {
  const searchParams = await props.searchParams;
  const limit = parseInt(searchParams.limit ?? "20");
  const offset = parseInt(searchParams.offset ?? "0");
  const query = normalizeCourseSearchTerm(searchParams.q);

  const courses = query
    ? await (async () => {
        noStore();
        return searchPublishedCourses(query, limit, offset);
      })()
    : await getPublishedCourseCatalog(limit, offset);

  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <div className="max-w-3xl space-y-4">
          <span className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
            Katalog kursus
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Temukan materi belajar yang sudah siap untuk dipelajari.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
              Halaman ini hanya menampilkan kursus yang telah dipublikasikan,
              cepat dimuat untuk pengunjung publik, dan siap dikembangkan untuk
              pencarian serta detail kursus berikutnya.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="bg-card/50 min-h-[56px] w-full rounded-2xl border" />
          }
        >
          <CourseSearchInput defaultValue={query} />
        </Suspense>

        <CourseCatalog courses={courses} searchQuery={query} />
      </div>
    </section>
  );
}
