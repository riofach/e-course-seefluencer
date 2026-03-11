import assert from "node:assert/strict";
import { test } from "vitest";

import {
  fetchUserActiveSubscription,
  type SubscriptionRecord,
} from "./subscriptions.shared.ts";

function createSubscription(overrides: Partial<SubscriptionRecord> = {}): SubscriptionRecord {
  return {
    id: 1,
    userId: "user-1",
    planId: 2,
    status: "active",
    startDate: new Date("2026-03-01T00:00:00.000Z"),
    endDate: new Date("2026-04-01T00:00:00.000Z"),
    midtransOrderId: "order-1",
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    ...overrides,
  };
}

void test("getUserActiveSubscription returns null when query returns no rows", async () => {
  const result = await fetchUserActiveSubscription(async () => []);

  assert.equal(result, null);
});

void test("getUserActiveSubscription returns subscription when active row exists", async () => {
  const subscription = createSubscription();

  const result = await fetchUserActiveSubscription(async () => [subscription]);

  assert.deepEqual(result, subscription);
});

void test("getUserActiveSubscription returns null when returned row is expired", async () => {
  const result = await fetchUserActiveSubscription(async () => [
    createSubscription({
      endDate: new Date("2026-02-01T00:00:00.000Z"),
    }),
  ]);

  assert.equal(result, null);
});

void test("getUserActiveSubscription returns null when returned row is inactive", async () => {
  const result = await fetchUserActiveSubscription(async () => [
    createSubscription({
      status: "inactive",
    }),
  ]);

  assert.equal(result, null);
});
