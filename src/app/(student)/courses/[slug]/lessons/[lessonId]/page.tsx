import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AutoNavCountdown } from "~/components/student/auto-nav-countdown";
import { LessonLayout } from "~/components/student/lesson-layout";
import { MarkCompleteButton } from "~/components/student/mark-complete-button";
import { PaywallTeaserOverlay } from "~/components/student/paywall-teaser-overlay";
import { QuizEngine } from "~/components/student/quiz-engine";
import { TextLessonContent } from "~/components/student/text-lesson-content";
import { VideoPlayerWrapper } from "~/components/student/video-player-wrapper";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { getServerAuthSession } from "~/server/auth";
import {
  getLessonById,
  type LessonDetail,
} from "~/server/courses/lesson-detail";
import {
  calculateProgressPercent,
  toLessonTypeLabel,
} from "~/server/courses/lesson-navigation.shared";
import { getUserActiveSubscription } from "~/server/queries/subscriptions";
import {
  getQuizQuestions,
  type ClientQuizQuestion,
} from "~/server/courses/quiz-questions";
import {
  getAdjacentLessons,
  getCourseSidebarData,
} from "~/server/courses/lesson-navigation";

import {
  requireAuthenticatedUserId,
  resolveLessonPageData,
  shouldShowPaywallOverlay,
} from "./page.helpers";

type LessonPageProps = {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function renderLessonContent(
  lesson: LessonDetail,
  quizQuestions: ClientQuizQuestion[],
  courseSlug: string,
  nextLessonId?: number,
) {
  switch (lesson.type.toLowerCase()) {
    case "video":
      return (
        <VideoPlayerWrapper
          videoUrl={lesson.videoUrl ?? ""}
          title={lesson.title}
        />
      );
    case "text":
      return <TextLessonContent content={lesson.content ?? ""} />;
    case "quiz":
      return (
        <QuizEngine
          questions={quizQuestions}
          lessonId={lesson.id}
          courseSlug={courseSlug}
          nextLessonId={nextLessonId}
        />
      );
    default:
      return <TextLessonContent content={lesson.content ?? ""} />;
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;
  const session = await getServerAuthSession();
  const userId = requireAuthenticatedUserId(session, redirect);
  const lesson = resolveLessonPageData(
    await getLessonById(lessonId, slug),
    notFound,
  );

  const activeSubscription = lesson.isFree
    ? null
    : await getUserActiveSubscription(userId);
  const showPaywallOverlay = shouldShowPaywallOverlay(
    lesson,
    activeSubscription !== null,
  );

  if (showPaywallOverlay) {
    lesson.content = null;
    lesson.videoUrl = null;
  }

  const quizQuestions =
    !showPaywallOverlay && lesson.type === "quiz"
      ? await getQuizQuestions(lesson.id)
      : [];
  const sidebarData = await getCourseSidebarData(slug, userId);
  const adjacentLessons = await getAdjacentLessons(lesson.id, slug);
  const completedLessonIds = sidebarData?.completedLessonIds ?? [];
  const isAlreadyCompleted = completedLessonIds.includes(lesson.id);
  const progressPercent = calculateProgressPercent(
    sidebarData?.completedCount ?? 0,
    sidebarData?.totalLessons ?? 0,
  );
  const lessonContent = renderLessonContent(
    lesson,
    quizQuestions,
    slug,
    adjacentLessons.nextLesson?.id,
  );

  return (
    <LessonLayout
      courseSlug={slug}
      chapters={sidebarData?.chapters ?? []}
      activeLessonId={lesson.id}
      completedLessonIds={completedLessonIds}
      progressPercent={progressPercent}
    >
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList className="text-slate-400">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-slate-400 hover:text-white">
                <Link href="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-slate-400 hover:text-white"
              >
                <Link href={`/courses/${lesson.course.slug}`}>
                  {lesson.course.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-300">
                {lesson.chapter.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-50">
                {lesson.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-[#2A2A3C] bg-[#1A1A24] text-slate-100"
            >
              {toLessonTypeLabel(lesson.type)}
            </Badge>
            <Badge
              variant={lesson.isFree ? "secondary" : "default"}
              className={
                lesson.isFree
                  ? "bg-slate-700 text-slate-100"
                  : "bg-indigo-500 text-white"
              }
            >
              {lesson.isFree ? "Free" : "Premium"}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">
              Chapter {lesson.chapter.order} • Lesson {lesson.order}
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              {lesson.title}
            </h1>
          </div>
        </div>

        {showPaywallOverlay ? <PaywallTeaserOverlay /> : lessonContent}

        {!showPaywallOverlay && lesson.type !== "quiz" && (
          <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-[#2A2A3C] bg-[#0F0F14]/90 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <MarkCompleteButton
              lessonId={lesson.id}
              courseSlug={slug}
              lessonType={lesson.type}
              isAlreadyCompleted={isAlreadyCompleted}
            />
          </div>
        )}

        <AutoNavCountdown
          nextLesson={adjacentLessons.nextLesson}
          courseSlug={slug}
          currentLessonType={lesson.type}
        />
      </div>
    </LessonLayout>
  );
}
