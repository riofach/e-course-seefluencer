import assert from "node:assert/strict";
import { test } from "vitest";

import { getTableColumns } from "drizzle-orm";

import { plans, subscriptions } from "./schema.ts";

void test("plans schema matches story 4.1 requirements", () => {
  const columns = getTableColumns(plans);

  assert.deepEqual(Object.keys(columns), [
    "id",
    "name",
    "price",
    "durationDays",
    "createdAt",
  ]);
  assert.equal(columns.id.notNull, true);
  assert.equal(columns.name.notNull, true);
  assert.equal(columns.price.notNull, true);
  assert.equal(columns.durationDays.notNull, true);
  assert.equal(columns.createdAt.notNull, false);
});

void test("subscriptions schema matches story 4.1 requirements", () => {
  const columns = getTableColumns(subscriptions);

  assert.deepEqual(Object.keys(columns), [
    "id",
    "userId",
    "planId",
    "status",
    "startDate",
    "endDate",
    "midtransOrderId",
    "createdAt",
  ]);
  assert.equal(columns.userId.notNull, true);
  assert.equal(columns.planId.notNull, false);
  assert.equal(columns.status.notNull, true);
  assert.equal(columns.startDate.notNull, false);
  assert.equal(columns.endDate.notNull, false);
  assert.equal(columns.midtransOrderId.notNull, false);
  assert.equal(columns.createdAt.notNull, false);
});
