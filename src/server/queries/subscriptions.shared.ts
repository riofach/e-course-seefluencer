import type { subscriptions } from "~/server/db/schema";

export type SubscriptionRecord = typeof subscriptions.$inferSelect;

export async function fetchUserActiveSubscription(
  loadSubscriptions: () => Promise<SubscriptionRecord[]>,
): Promise<SubscriptionRecord | null> {
  const [subscription] = await loadSubscriptions();

  if (!subscription) {
    return null;
  }

  if (subscription.status !== "active") {
    return null;
  }

  if (!subscription.endDate || subscription.endDate <= new Date()) {
    return null;
  }

  return subscription;
}
