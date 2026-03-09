import "server-only";

import { and, count, eq, gt } from "drizzle-orm";

import { db } from "~/server/db";
import { courses, subscriptions, users } from "~/server/db/schema";

export async function getTotalUsersCount(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(users);

  return result?.count ?? 0;
}

export async function getTotalCoursesCount(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(courses);

  return result?.count ?? 0;
}

export async function getActiveSubscriptionsCount(): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        gt(subscriptions.endDate, new Date()),
      ),
    );

  return result?.count ?? 0;
}
