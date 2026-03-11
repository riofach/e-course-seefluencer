import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CourseDetailHero,
  type CourseDetailHeroProgressData,
} from "~/components/student/course-detail-hero";
import { CourseOutcomes } from "~/components/student/course-outcomes";
import { CourseSyllabus } from "~/components/student/course-syllabus";
import { Button } from "~/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  getCourseDetailBySlug,
} from "~/server/courses/course-detail";
import { getCourseSidebarData } from "~/server/courses/lesson-navigation";
import { calculateProgressPercent } from "~/server/courses/lesson-navigation.shared";
import { getServerAuthSession } from "~/server/auth";
import { getUserActiveSubscription } from "~/server/queries/subscriptions";

import {
  getCourseOutcomeItems,
  resolveCourseLandingCta,
  resolveCoursePageData,
} from "./page.helpers";

export const metadata: Metadata = {
  title: "Detail Kursus",
  description: "Lihat detail lengkap kursus dan syllabus sebelum mulai belajar.",
};

export const dynamic = "force-dynamic";

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const session = await getServerAuthSession();

  const [course, sidebarData, activeSubscription] = await Promise.all([
    resolveCoursePageData(slug, getCourseDetailBySlug, notFound),
    session?.user?.id
      ? getCourseSidebarData(slug, session.user.id)
      : Promise.resolve(null),
    session?.user?.id
      ? getUserActiveSubscription(session.user.id)
      : Promise.resolve(null),
  ]);

  const progressData: CourseDetailHeroProgressData | undefined =
    sidebarData && sidebarData.completedCount > 0
      ? {
          progressPercent: calculateProgressPercent(
            sidebarData.completedCount,
            sidebarData.totalLessons,
          ),
          completedCount: sidebarData.completedCount,
          totalLessons: sidebarData.totalLessons,
        }
      : undefined;

  const primaryCta = resolveCourseLandingCta({
    course,
    isAuthenticated: !!session?.user,
    hasActiveSubscription: activeSubscription !== null,
  });
  const outcomeItems = getCourseOutcomeItems(course);

  return (
    <section>
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/courses" className="text-slate-400 hover:text-white">
                  Courses
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-200">{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <CourseDetailHero
          course={course}
          cta={primaryCta}
          progressData={progressData}
        />
        <CourseSyllabus courseSlug={course.slug} chapters={course.chapters} />
        <CourseOutcomes title={course.title} outcomes={outcomeItems} />

        <section className="rounded-[32px] border border-[#2A2A3C] bg-[#1A1A24] px-6 py-8 text-center sm:px-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Ready to start?
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Join the learning flow without scrolling back to the top.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 tracking-[-0.02em] text-slate-300 sm:text-base">
            Choose the next step that matches your access level. The same primary CTA is repeated here to preserve momentum after the syllabus and trust section.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button asChild className="min-h-[44px] rounded-full bg-indigo-600 px-6 text-white hover:bg-indigo-500">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <p className="text-sm leading-6 tracking-[-0.02em] text-slate-400">
              {primaryCta.helperText}
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
