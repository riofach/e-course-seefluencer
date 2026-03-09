const ACTIVE_STATUSES = new Set(["settlement", "capture"]);
const INACTIVE_STATUSES = new Set(["deny", "cancel", "expire", "failure"]);

export type SubscriptionLike = {
  id: number;
  planId: number | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  midtransOrderId: string | null;
  createdAt: Date | null;
  userId: string;
};

export type PlanLike = {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  createdAt: Date | null;
};

export type ProcessWebhookPayload = {
  orderId: string;
  transactionStatus: string;
};

export type ProcessWebhookDependencies = {
  getSubscriptionByOrderId: (
    orderId: string,
  ) => Promise<SubscriptionLike | null>;
  getPlanById: (planId: number) => Promise<PlanLike | null>;
  updateSubscription: (
    subscriptionId: number,
    values: Partial<Pick<SubscriptionLike, "status" | "startDate" | "endDate">>,
  ) => Promise<void>;
  getNow: () => Date;
};

export type ProcessWebhookResult = {
  status: number;
  body: { ok: true } | { error: string };
};

function addDurationDays(startDate: Date, durationDays: number) {
  return new Date(
    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );
}

export async function processMidtransWebhookWithDependencies(
  payload: ProcessWebhookPayload,
  dependencies: ProcessWebhookDependencies,
): Promise<ProcessWebhookResult> {
  const subscription = await dependencies.getSubscriptionByOrderId(payload.orderId);

  if (!subscription) {
    return {
      status: 404,
      body: { error: "Subscription not found" },
    };
  }

  if (subscription.status === "active") {
    return {
      status: 200,
      body: { ok: true },
    };
  }

  if (ACTIVE_STATUSES.has(payload.transactionStatus)) {
    if (!subscription.planId) {
      return {
        status: 404,
        body: { error: "Plan not found" },
      };
    }

    const plan = await dependencies.getPlanById(subscription.planId);

    if (!plan) {
      return {
        status: 404,
        body: { error: "Plan not found" },
      };
    }

    const startDate = dependencies.getNow();
    const endDate = addDurationDays(startDate, plan.durationDays);

    await dependencies.updateSubscription(subscription.id, {
      status: "active",
      startDate,
      endDate,
    });

    return {
      status: 200,
      body: { ok: true },
    };
  }

  if (INACTIVE_STATUSES.has(payload.transactionStatus)) {
    await dependencies.updateSubscription(subscription.id, {
      status: "inactive",
    });
  }

  return {
    status: 200,
    body: { ok: true },
  };
}
