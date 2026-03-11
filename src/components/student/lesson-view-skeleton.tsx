import { Skeleton } from "~/components/ui/skeleton";

export function LessonViewSkeleton() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-[#0F0F14] font-[family-name:var(--font-inter)] tracking-[-0.02em] text-slate-50">
      <div className="container mx-auto min-h-[calc(100vh-3.5rem)] px-4 py-8 sm:py-10 lg:py-14">
        <div className="mb-4 lg:hidden">
          <Skeleton className="h-11 w-28 rounded-xl bg-[#1A1A24]" />
        </div>

        <div className="flex items-start gap-6">
          <aside className="hidden w-[280px] shrink-0 rounded-xl border border-[#2A2A3C] bg-[#1A1A24] lg:block">
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-2 w-full bg-white/10" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
                <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-48 bg-white/10" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-7 w-20 rounded-md bg-[#1A1A24]" />
                <Skeleton className="h-7 w-24 rounded-md bg-[#1A1A24]" />
              </div>
              <Skeleton className="h-10 w-full max-w-2xl bg-white/10" />
              <Skeleton className="h-5 w-40 bg-white/10" />
            </div>

            <Skeleton className="aspect-video w-full rounded-2xl border border-[#2A2A3C] bg-[#1A1A24]" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-[#2A2A3C] bg-[#1A1A24] p-6">
              <Skeleton className="h-5 w-full bg-white/10" />
              <Skeleton className="h-5 w-[92%] bg-white/10" />
              <Skeleton className="h-5 w-[88%] bg-white/10" />
              <Skeleton className="h-5 w-[74%] bg-white/10" />
              <Skeleton className="h-5 w-[68%] bg-white/10" />
            </div>

            <div className="sticky bottom-0 -mx-4 border-t border-[#2A2A3C] bg-[#0F0F14]/90 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              <div className="flex justify-end">
                <Skeleton className="h-11 w-40 rounded-xl bg-indigo-500/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
