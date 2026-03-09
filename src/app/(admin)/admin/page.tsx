import { Suspense } from "react";

import { StatCardsSkeleton } from "~/components/admin/StatCard";
import { AdminDashboardStatsSection } from "./admin-dashboard-stats";

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6 bg-white">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          Monitor key platform metrics to view the health of users, content, and
          active subscriptions.
        </p>
      </div>

      <Suspense fallback={<StatCardsSkeleton />}>
        <AdminDashboardStatsSection />
      </Suspense>
    </section>
  );
}
