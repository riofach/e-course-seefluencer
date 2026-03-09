import { PricingPageSkeleton } from "~/components/student/pricing-page-skeleton";

export default function PricingLoading() {
  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <div className="max-w-3xl space-y-4">
          <div className="bg-primary/10 text-primary inline-flex h-6 w-28 rounded-full" />
          <div className="space-y-3">
            <div className="bg-muted h-10 w-full max-w-2xl rounded-xl sm:h-12" />
            <div className="bg-muted h-5 w-full max-w-xl rounded-lg" />
          </div>
        </div>

        <PricingPageSkeleton />
      </div>
    </section>
  );
}
