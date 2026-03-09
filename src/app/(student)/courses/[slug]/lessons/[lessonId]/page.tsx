import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AutoNavCountdown } from "~/components/student/auto-nav-countdown";
import { LessonLayout } from "~/components/student/lesson-layout";
import { MarkCompleteButton } from "~/components/student/mark-complete-button";
import { PaywallTeaserOverlay } from "~/components/student/paywall-teaser-overlay";
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
  hasActiveSubscription,
  type LessonDetail,
} from "~/server/courses/lesson-detail";
import {
  calculateProgressPercent,
  toLessonTypeLabel,
} from "~/server/courses/lesson-navigation.shared";
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

function renderLessonContent(lesson: LessonDetail) {
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
        <div className="border-border/70 bg-card mx-auto w-full max-w-3xl rounded-2xl border px-6 py-12 text-center shadow-sm">
          Quiz content coming soon
        </div>
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
    ? false
    : await hasActiveSubscription(userId);
  const showPaywallOverlay = shouldShowPaywallOverlay(
    lesson,
    activeSubscription,
  );
  const sidebarData = await getCourseSidebarData(slug, userId);
  const adjacentLessons = await getAdjacentLessons(lesson.id, slug);
  const completedLessonIds = sidebarData?.completedLessonIds ?? [];
  const isAlreadyCompleted = completedLessonIds.includes(lesson.id);
  const progressPercent = calculateProgressPercent(
    sidebarData?.completedCount ?? 0,
    sidebarData?.totalLessons ?? 0,
  );
  const lessonContent = renderLessonContent(lesson);

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
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/courses/${lesson.course.slug}`}>
                  {lesson.course.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.chapter.title}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">{toLessonTypeLabel(lesson.type)}</Badge>
            <Badge variant={lesson.isFree ? "secondary" : "default"}>
              {lesson.isFree ? "Free" : "Premium"}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">
              Chapter {lesson.chapter.order} • Lesson {lesson.order}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {lesson.title}
            </h1>
          </div>
        </div>

        {showPaywallOverlay ? (
          <PaywallTeaserOverlay>{lessonContent}</PaywallTeaserOverlay>
        ) : (
          lessonContent
        )}

        {lesson.type !== "quiz" && (
          <div className="bg-background/80 border-border sticky bottom-0 border-t py-4 backdrop-blur-sm">
            <MarkCompleteButton
              lessonId={lesson.id}
              courseSlug={slug}
              lessonType={lesson.type}
              isAlreadyCompleted={isAlreadyCompleted}
            />
          </div>
        )}

        <AutoNavCountdown
          key={lesson.id}
          nextLesson={adjacentLessons.nextLesson}
          courseSlug={slug}
          currentLessonType={lesson.type}
        />
      </div>
    </LessonLayout>
  );
}
