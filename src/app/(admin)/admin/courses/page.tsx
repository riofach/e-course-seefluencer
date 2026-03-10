import { Suspense } from "react";

import { CourseListTable } from "~/components/admin/CourseListTable";
import { Skeleton } from "~/components/ui/skeleton";
import { getAllCourses } from "~/server/queries/courses";

export function CourseListSkeleton() {
  return (
    <div className="space-y-4 rounded-md border border-gray-200 p-4">
      <Skeleton className="h-10 w-48 bg-gray-100" />
      <Skeleton className="h-52 w-full bg-gray-100" />
    </div>
  );
}

export async function CoursesTableSection() {
  const courses = await getAllCourses();

  return <CourseListTable courses={courses} />;
}

export default function CoursesPage() {
  return (
    <section className="space-y-6 bg-white">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
          Admin Courses
        </p>
        <h1 className="text-lg font-semibold text-gray-900">Courses</h1>
        <p className="max-w-2xl text-sm leading-6 text-gray-600">
          Manage your draft and published catalog from one admin workspace.
        </p>
      </div>

      <Suspense fallback={<CourseListSkeleton />}>
        <CoursesTableSection />
      </Suspense>
    </section>
  );
}
