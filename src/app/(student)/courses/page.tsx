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
    <div>
      <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:gap-10 lg:px-8 lg:pb-24">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_#151520_0%,_#12121A_45%,_#102228_100%)] px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div aria-hidden="true">
            <div className="pointer-events-none absolute left-1/2 top-4 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,107,107,0.22),_rgba(155,89,182,0.12)_42%,_transparent_72%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(26,188,156,0.24),_transparent_68%)] blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(155,89,182,0.16),_transparent_72%)] blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
                Public catalog with premium feel
              </span>
              <div className="space-y-4">
                <h1 className="font-[family-name:var(--font-playfair-display)] text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Browse courses with a premium first impression.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Explore published Seefluencer courses without signing in. Search what fits your momentum, preview the library, and only authenticate when protected lesson flow actually requires it.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                {[
                  "Published courses only",
                  "Free & Premium access badges",
                  "Guest-friendly discovery flow",
                ].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#2A2A3C] bg-[#1A1A24] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Catalog highlights
                </p>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-bold tracking-tight">
                  Browse courses
                </h2>
                <div className="space-y-3">
                  {[
                    "Dark premium catalog surface aligned with landing and pricing.",
                    "Search stays URL-driven for fast discovery and sharable states.",
                    "Free previews stay visible while protected lesson routes remain enforced server-side.",
                  ].map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-white/10 bg-[#14141C] px-4 py-3 text-sm leading-6 text-slate-300"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="min-h-[56px] w-full rounded-3xl border border-[#2A2A3C] bg-[#1A1A24]" />
          }
        >
          <CourseSearchInput defaultValue={query} />
        </Suspense>

        <CourseCatalog courses={courses} searchQuery={query} />
      </section>
    </div>
  );
}
