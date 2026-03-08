import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailHero } from "~/components/student/course-detail-hero";
import { CourseSyllabus } from "~/components/student/course-syllabus";
import {
  getCourseDetailBySlug,
  getPublishedCourseSlugs,
} from "~/server/courses/course-detail";

import {
  resolveCoursePageData,
  resolveCourseStaticParams,
} from "./page.helpers";

export const metadata: Metadata = {
  title: "Detail Kursus",
  description: "Lihat detail lengkap kursus dan syllabus sebelum mulai belajar.",
};

export const revalidate = 300;

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return resolveCourseStaticParams(getPublishedCourseSlugs);
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await resolveCoursePageData(slug, getCourseDetailBySlug, notFound);

  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <CourseDetailHero course={course} />
        <CourseSyllabus chapters={course.chapters} />
      </div>
    </section>
  );
}
