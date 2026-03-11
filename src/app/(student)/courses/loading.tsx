import { CourseCatalogSkeleton } from "~/components/student/course-catalog-skeleton";

export default function CoursesLoading() {
  return (
    <section>
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pb-24">
        <CourseCatalogSkeleton />
      </div>
    </section>
  );
}
