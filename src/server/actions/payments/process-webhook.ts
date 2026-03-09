import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { plans, subscriptions } from "~/server/db/schema";
import {
  processMidtransWebhookWithDependencies,
  type ProcessWebhookPayload,
  type ProcessWebhookResult,
} from "./process-webhook.shared";

export async function processMidtransWebhook(
  payload: ProcessWebhookPayload,
): Promise<ProcessWebhookResult> {
  return processMidtransWebhookWithDependencies(payload, {
    getSubscriptionByOrderId: async (orderId) => {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.midtransOrderId, orderId))
        .limit(1);

      return subscription ?? null;
    },
    getPlanById: async (planId) => {
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, planId))
        .limit(1);

      return plan ?? null;
    },
    updateSubscription: async (subscriptionId, values) => {
      await db
        .update(subscriptions)
        .set(values)
        .where(eq(subscriptions.id, subscriptionId));
    },
    getNow: () => new Date(),
  });
}
