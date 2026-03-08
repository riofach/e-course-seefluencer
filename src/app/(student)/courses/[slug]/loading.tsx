import { CourseDetailSkeleton } from "~/components/student/course-detail-skeleton";

export default function CourseDetailLoading() {
  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <CourseDetailSkeleton />
      </div>
    </section>
  );
}
