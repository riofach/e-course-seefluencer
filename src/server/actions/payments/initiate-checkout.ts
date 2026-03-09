"use server";

import { eq } from "drizzle-orm";

import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { plans, subscriptions } from "~/server/db/schema";

import {
  initiateMidtransCheckoutWithDependencies,
  type CheckoutPlan,
  type MidtransTransactionPayload,
} from "./initiate-checkout.shared";

function toBasicAuth(serverKey: string) {
  return Buffer.from(`${serverKey}:`).toString("base64");
}

export async function initiateMidtransCheckout(planId: number) {
  return initiateMidtransCheckoutWithDependencies(planId, {
    getSession: getServerAuthSession,
    getPlanById: async (id) => {
      const plan = await db.query.plans.findFirst({
        where: eq(plans.id, id),
      });

      return (plan as CheckoutPlan | null) ?? null;
    },
    createSubscription: async (subscription) => {
      await db.insert(subscriptions).values(subscription);
    },
    requestSnapToken: async (payload: MidtransTransactionPayload) => {
      const response = await fetch(
        "https://app.sandbox.midtrans.com/snap/v1/transactions",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${toBasicAuth(env.MIDTRANS_SERVER_KEY)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const json = (await response.json()) as {
        token?: string;
        error_messages?: string[];
        status_message?: string;
      };

      if (!response.ok || !json.token) {
        throw new Error(
          json.error_messages?.[0] ??
            json.status_message ??
            "Failed to initiate checkout",
        );
      }

      return { token: json.token };
    },
    getNow: () => new Date(),
  });
}
