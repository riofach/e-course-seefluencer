import assert from "node:assert/strict";
import test from "node:test";

import { initiateMidtransCheckoutWithDependencies } from "./initiate-checkout.shared.ts";

void test("initiateMidtransCheckout returns unauthorized when no session exists", async () => {
  const result = await initiateMidtransCheckoutWithDependencies(1, {
    getSession: async () => null,
    getPlanById: async () => null,
    createSubscription: async () => undefined,
    requestSnapToken: async () => ({ token: "snap-token" }),
    getNow: () => new Date("2026-03-09T00:00:00.000Z"),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Unauthorized",
  });
});

void test("initiateMidtransCheckout returns plan not found for invalid plan id", async () => {
  const result = await initiateMidtransCheckoutWithDependencies(999, {
    getSession: async () => ({
      user: { id: "user-1", email: "rio@example.com" },
    }),
    getPlanById: async () => null,
    createSubscription: async () => undefined,
    requestSnapToken: async () => ({ token: "snap-token" }),
    getNow: () => new Date("2026-03-09T00:00:00.000Z"),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Plan not found",
  });
});

void test("initiateMidtransCheckout creates subscription row and returns snap token", async () => {
  let createdSubscription:
    | {
        userId: string;
        planId: number;
        status: "inactive";
        midtransOrderId: string;
        startDate: Date;
        endDate: Date;
      }
    | undefined;

  const now = new Date("2026-03-09T10:00:00.000Z");

  const result = await initiateMidtransCheckoutWithDependencies(1, {
    getSession: async () => ({
      user: { id: "user-1", email: "rio@example.com", name: "Rio" },
    }),
    getPlanById: async () => ({
      id: 1,
      name: "Pro Monthly",
      price: 99_000,
      durationDays: 30,
      createdAt: now,
    }),
    createSubscription: async (subscription) => {
      createdSubscription = subscription;
    },
    requestSnapToken: async (payload) => {
      assert.equal(payload.transaction_details.gross_amount, 99_000);
      assert.match(payload.transaction_details.order_id, /^sub_user1_/);
      assert.ok(payload.transaction_details.order_id.length <= 50);
      assert.equal(payload.customer_details.email, "rio@example.com");

      return { token: "snap-token-123" };
    },
    getNow: () => now,
  });

  assert.deepEqual(result, {
    success: true,
    data: {
      snap_token: "snap-token-123",
    },
  });

  assert.ok(createdSubscription);
  assert.equal(createdSubscription?.userId, "user-1");
  assert.equal(createdSubscription?.planId, 1);
  assert.equal(createdSubscription?.status, "inactive");
  assert.match(createdSubscription?.midtransOrderId ?? "", /^sub_user1_/);
  assert.equal(createdSubscription?.startDate.toISOString(), now.toISOString());
  assert.equal(
    createdSubscription?.endDate.toISOString(),
    new Date("2026-04-08T10:00:00.000Z").toISOString(),
  );
});

void test("initiateMidtransCheckout returns error when Midtrans request fails", async () => {
  const result = await initiateMidtransCheckoutWithDependencies(1, {
    getSession: async () => ({
      user: { id: "user-1", email: "rio@example.com" },
    }),
    getPlanById: async () => ({
      id: 1,
      name: "Pro Monthly",
      price: 99_000,
      durationDays: 30,
      createdAt: new Date("2026-03-09T00:00:00.000Z"),
    }),
    createSubscription: async () => undefined,
    requestSnapToken: async () => {
      throw new Error("Midtrans unavailable");
    },
    getNow: () => new Date("2026-03-09T00:00:00.000Z"),
  });

  assert.deepEqual(result, {
    success: false,
    error: "Midtrans unavailable",
  });
});
