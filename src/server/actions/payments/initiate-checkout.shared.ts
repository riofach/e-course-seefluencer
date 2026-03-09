import { z } from "zod";

import type { ActionResponse } from "~/types";

const planIdSchema = z.number().int().positive();

type SessionLike = {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
  };
} | null;

export type CheckoutPlan = {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  createdAt: Date | null;
};

export type PendingSubscriptionInput = {
  userId: string;
  planId: number;
  status: "inactive";
  midtransOrderId: string;
  startDate: Date;
  endDate: Date;
};

export type MidtransTransactionPayload = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    email: string;
    first_name?: string;
  };
};

export type CheckoutDependencies = {
  getSession: () => Promise<SessionLike>;
  getPlanById: (planId: number) => Promise<CheckoutPlan | null>;
  createSubscription: (subscription: PendingSubscriptionInput) => Promise<void>;
  requestSnapToken: (
    payload: MidtransTransactionPayload,
  ) => Promise<{ token: string }>;
  getNow: () => Date;
};

function addDays(baseDate: Date, days: number) {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildMidtransOrderId(userId: string, now: Date) {
  const shortUserId = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "user";
  return `sub_${shortUserId}_${now.getTime()}`;
}

export async function initiateMidtransCheckoutWithDependencies(
  planId: number,
  dependencies: CheckoutDependencies,
): Promise<ActionResponse<{ snap_token: string }>> {
  const session = await dependencies.getSession();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsedPlanId = planIdSchema.safeParse(planId);

  if (!parsedPlanId.success) {
    return { success: false, error: "Invalid plan id" };
  }

  const plan = await dependencies.getPlanById(parsedPlanId.data);

  if (!plan) {
    return { success: false, error: "Plan not found" };
  }

  const now = dependencies.getNow();
  const orderId = buildMidtransOrderId(session.user.id, now);
  const email = session.user.email?.trim() ?? "customer@example.com";

  try {
    await dependencies.createSubscription({
      userId: session.user.id,
      planId: plan.id,
      status: "inactive",
      midtransOrderId: orderId,
      startDate: now,
      endDate: addDays(now, plan.durationDays),
    });

    const snap = await dependencies.requestSnapToken({
      transaction_details: {
        order_id: orderId,
        gross_amount: plan.price,
      },
      customer_details: {
        email,
        first_name: session.user.name?.trim() ?? undefined,
      },
    });

    return {
      success: true,
      data: {
        snap_token: snap.token,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initiate checkout",
    };
  }
}
