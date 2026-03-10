import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CourseEditForm,
  CoursePublishStatusButton,
} from "~/components/admin/CourseEditForm";
import { ChapterList } from "~/components/admin/ChapterList";
import { getCourseById } from "~/server/queries/courses";
import { getChaptersByCourseId } from "~/server/queries/chapters";
import { getLessonsByCourseId } from "~/server/queries/lessons";

type CourseEditorPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseEditorPage({ params }: CourseEditorPageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const chapters = await getChaptersByCourseId(course.id);
  const lessonsMap = await getLessonsByCourseId(course.id);

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
        <ChapterList
          courseId={String(course.id)}
          initialChapters={chapters}
          initialLessonsMap={lessonsMap}
        />
      </div>
    </div>
  );
}
