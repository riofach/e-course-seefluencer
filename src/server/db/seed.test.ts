import assert from "node:assert/strict";
import test from "node:test";

import { initialPlans, seedPlans } from "./seed.shared.ts";

void test("initialPlans includes the Pro Monthly plan", () => {
  assert.deepEqual(initialPlans, [
    {
      name: "Pro Monthly",
      price: 99_000,
      durationDays: 30,
    },
  ]);
});

void test("seedPlans inserts plans only when matching rows do not exist", async () => {
  const calls: Array<{ query: string; values: unknown[] }> = [];

  await seedPlans(async (query, values) => {
    calls.push({ query, values });
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0]?.query ?? "", /insert into plans/i);
  assert.deepEqual(calls[0]?.values, ["Pro Monthly", 99_000, 30]);
});
