import Link from "next/link";
import { notFound } from "next/navigation";

import { QuizQuestionList } from "~/components/admin/QuizQuestionList";
import { getCourseById } from "~/server/queries/courses";
import { getLessonById } from "~/server/queries/lessons";
import { getQuizzesByLessonId } from "~/server/queries/quizzes";

type QuizBuilderPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function QuizBuilderPage({ params }: QuizBuilderPageProps) {
  const { courseId, lessonId } = await params;

  const parsedLessonId = Number(lessonId);

  if (!Number.isInteger(parsedLessonId) || parsedLessonId <= 0) {
    notFound();
  }

  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const lesson = await getLessonById(parsedLessonId);

  if (lesson?.type !== "quiz") {
    notFound();
  }

  const quizzes = await getQuizzesByLessonId(parsedLessonId);

  return (
    <div className="min-h-screen flex-1 bg-white p-6">
      <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/admin" className="transition-colors hover:text-gray-900">
          Admin
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/admin/courses" className="transition-colors hover:text-gray-900">
          Courses
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/admin/courses/${courseId}`}
          className="transition-colors hover:text-gray-900"
        >
          {course.title || "Untitled Course"}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900">Quiz Builder</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Quiz Builder</h1>
          <p className="mt-0.5 text-xs text-gray-500">{lesson.title}</p>
        </div>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
          {quizzes.length} {quizzes.length === 1 ? "question" : "questions"}
        </span>
      </div>

      <QuizQuestionList lessonId={parsedLessonId} initialQuizzes={quizzes} />
    </div>
  );
}
