import "server-only";

import { and, eq, gt } from "drizzle-orm";

import { db } from "~/server/db";
import { subscriptions } from "~/server/db/schema";

import { fetchUserActiveSubscription } from "./subscriptions.shared";

export async function getUserActiveSubscription(userId: string) {
  return fetchUserActiveSubscription(async () =>
    db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gt(subscriptions.endDate, new Date()),
        ),
      )
      .limit(1),
  );
}
