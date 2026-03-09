import { Skeleton } from "~/components/ui/skeleton";

export function LessonViewSkeleton() {
  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 px-4 py-8 sm:py-10 lg:py-14">
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        <Skeleton className="aspect-video w-full rounded-2xl" />

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[88%]" />
          <Skeleton className="h-5 w-[74%]" />
        </div>
      </div>
    </section>
  );
}
