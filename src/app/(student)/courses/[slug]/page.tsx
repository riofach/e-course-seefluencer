import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CourseDetailHero,
  type CourseDetailHeroProgressData,
} from "~/components/student/course-detail-hero";
import { CourseSyllabus } from "~/components/student/course-syllabus";
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

import { resolveCoursePageData } from "./page.helpers";

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

  const [course, sidebarData] = await Promise.all([
    resolveCoursePageData(slug, getCourseDetailBySlug, notFound),
    session?.user?.id
      ? getCourseSidebarData(slug, session.user.id)
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

  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <CourseDetailHero course={course} progressData={progressData} />
        <CourseSyllabus courseSlug={course.slug} chapters={course.chapters} />
      </div>
    </section>
  );
}
