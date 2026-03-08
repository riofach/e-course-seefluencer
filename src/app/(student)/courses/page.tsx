import type { Metadata } from "next";

import { CourseCatalog } from "~/components/student/course-catalog";
import { getPublishedCourseCatalog } from "~/server/courses/published-course-catalog-cache";

export const metadata: Metadata = {
  title: "Katalog Kursus",
  description: "Jelajahi kursus publik Seefluencer yang siap dipelajari.",
};

export const revalidate = 300;

type SearchParamProps = {
  searchParams: Promise<{ limit?: string; offset?: string }>;
};

export default async function CoursesPage(props: SearchParamProps) {
  const searchParams = await props.searchParams;
  const limit = parseInt(searchParams.limit ?? "20");
  const offset = parseInt(searchParams.offset ?? "0");

  const courses = await getPublishedCourseCatalog(limit, offset);

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

        <CourseCatalog courses={courses} />
      </div>
    </section>
  );
}
