import assert from "node:assert/strict";
import { test } from "vitest";

import type { ProcessWebhookPayload } from "./process-webhook.shared.ts";
import { processMidtransWebhookWithDependencies } from "./process-webhook.shared.ts";

function createDependencies(overrides?: {
  subscription?: {
    id: number;
    planId: number | null;
    status: string;
  } | null;
  plan?: {
    id: number;
    durationDays: number;
  } | null;
}) {
  const updates: Array<Record<string, unknown>> = [];
  const now = new Date("2026-03-10T08:00:00.000Z");

  return {
    updates,
    now,
    deps: {
      getSubscriptionByOrderId: async () =>
        overrides?.subscription === undefined
          ? {
              id: 1,
              userId: "user-1",
              planId: 7,
              status: "inactive",
              startDate: null,
              endDate: null,
              midtransOrderId: "sub_user1_123",
              createdAt: now,
            }
          : overrides.subscription === null
            ? null
            : {
                id: overrides.subscription.id,
                userId: "user-1",
                planId: overrides.subscription.planId,
                status: overrides.subscription.status,
                startDate: null,
                endDate: null,
                midtransOrderId: "sub_user1_123",
                createdAt: now,
              },
      getPlanById: async () =>
        overrides?.plan === undefined
          ? {
              id: 7,
              name: "Pro Monthly",
              price: 99_000,
              durationDays: 30,
              createdAt: now,
            }
          : overrides.plan === null
            ? null
            : {
                id: overrides.plan.id,
                name: "Plan",
                price: 99_000,
                durationDays: overrides.plan.durationDays,
                createdAt: now,
              },
      updateSubscription: async (
        _subscriptionId: number,
        values: Record<string, unknown>,
      ) => {
        updates.push(values);
      },
      getNow: () => now,
    },
  };
}

async function process(
  payload: ProcessWebhookPayload,
  overrides?: Parameters<typeof createDependencies>[0],
) {
  const { deps, updates, now } = createDependencies(overrides);
  const result = await processMidtransWebhookWithDependencies(payload, deps);

  return { result, updates, now };
}

void test("processMidtransWebhook activates subscription for settlement status", async () => {
  const { result, updates, now } = await process({
    orderId: "sub_user1_123",
    transactionStatus: "settlement",
  });

  assert.deepEqual(result, {
    status: 200,
    body: { ok: true },
  });
  assert.equal(updates.length, 1);
  assert.equal(updates[0]?.status, "active");
  assert.equal(
    (updates[0]?.startDate as Date).toISOString(),
    now.toISOString(),
  );
  assert.equal(
    (updates[0]?.endDate as Date).toISOString(),
    new Date("2026-04-09T08:00:00.000Z").toISOString(),
  );
});

void test("processMidtransWebhook returns early for already active subscription", async () => {
  const { result, updates } = await process(
    {
      orderId: "sub_user1_123",
      transactionStatus: "capture",
    },
    {
      subscription: {
        id: 1,
        planId: 7,
        status: "active",
      },
    },
  );

  assert.deepEqual(result, {
    status: 200,
    body: { ok: true },
  });
  assert.equal(updates.length, 0);
});

void test("processMidtransWebhook marks subscription inactive for denied payments", async () => {
  const { result, updates } = await process({
    orderId: "sub_user1_123",
    transactionStatus: "deny",
  });

  assert.deepEqual(result, {
    status: 200,
    body: { ok: true },
  });
  assert.deepEqual(updates, [{ status: "inactive" }]);
});

void test("processMidtransWebhook returns not found for unknown order id", async () => {
  const { result, updates } = await process(
    {
      orderId: "missing-order",
      transactionStatus: "settlement",
    },
    {
      subscription: null,
    },
  );

  assert.deepEqual(result, {
    status: 404,
    body: { error: "Subscription not found" },
  });
  assert.equal(updates.length, 0);
});

void test("processMidtransWebhook returns not found for missing plan", async () => {
  const { result, updates } = await process(
    {
      orderId: "sub_user1_123",
      transactionStatus: "settlement",
    },
    {
      subscription: {
        id: 1,
        planId: 999,
        status: "inactive",
      },
      plan: null,
    },
  );

  assert.deepEqual(result, {
    status: 404,
    body: { error: "Plan not found" },
  });
  assert.equal(updates.length, 0);
});
