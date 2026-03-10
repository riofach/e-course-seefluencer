import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CourseEditForm,
  CoursePublishStatusButton,
} from "~/components/admin/CourseEditForm";
import { getCourseById } from "~/server/queries/courses";

type CourseEditorPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseEditorPage({ params }: CourseEditorPageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen flex-1 bg-white p-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin" className="transition-colors hover:text-gray-900">Admin</Link>
        <span className="text-gray-300">/</span>
        <Link href="/admin/courses" className="transition-colors hover:text-gray-900">Courses</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900">{course.title || "New Course"}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{course.title || "Untitled Course"}</h1>
        <CoursePublishStatusButton courseId={String(course.id)} isPublished={course.isPublished} />
      </div>

      <CourseEditForm course={course} />

      <div className="mt-10 border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Chapters</h2>
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          Chapters management will be available in the next update.
        </div>
      </div>
    </div>
  );
}
