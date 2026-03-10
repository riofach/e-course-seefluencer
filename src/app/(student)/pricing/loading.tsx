import { PricingPageSkeleton } from "~/components/student/pricing-page-skeleton";

export default function PricingLoading() {
  return (
    <section className="bg-[#0F0F14] font-[family-name:var(--font-inter)] tracking-[-0.02em] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex h-8 w-44 rounded-full bg-white/10" />
          <div className="space-y-3">
            <div className="h-12 w-full max-w-2xl rounded-xl bg-white/10 sm:h-14" />
            <div className="h-5 w-full max-w-xl rounded-lg bg-white/10" />
          </div>
        </div>

        <PricingPageSkeleton />
      </div>
    </section>
  );
}
