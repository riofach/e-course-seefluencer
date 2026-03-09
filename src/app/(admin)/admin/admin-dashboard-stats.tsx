import { BookOpen, CreditCard, Users } from "lucide-react";

import { StatCard } from "~/components/admin/StatCard";
import {
  getActiveSubscriptionsCount,
  getTotalCoursesCount,
  getTotalUsersCount,
} from "~/server/queries/analytics";

export async function AdminDashboardStatsSection() {
  try {
    const [totalUsers, totalCourses, activeSubscriptions] = await Promise.all([
      getTotalUsersCount(),
      getTotalCoursesCount(),
      getActiveSubscriptionsCount(),
    ]);

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Courses"
          value={totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>
    );
  } catch {
    return (
      <div
        role="alert"
        className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 text-sm text-neutral-600"
      >
        Analytics could not be loaded at this time. Please refresh the page in a
        few moments.
      </div>
    );
  }
}
