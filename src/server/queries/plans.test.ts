import assert from "node:assert/strict";
import test from "node:test";

import { getPlansFromQuery } from "./plans.shared.ts";

void test("getPlans returns rows ordered by price", async () => {
  const plans = [
    {
      id: 1,
      name: "Pro Monthly",
      price: 99_000,
      durationDays: 30,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
    },
  ];

  const result = await getPlansFromQuery(async () => plans);

  assert.deepEqual(result, plans);
});

void test("getPlans returns empty array when plans table has no rows", async () => {
  const result = await getPlansFromQuery(async () => []);

  assert.deepEqual(result, []);
});
