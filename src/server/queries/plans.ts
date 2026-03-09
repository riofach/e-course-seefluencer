import "server-only";

import { asc } from "drizzle-orm";

import { db } from "~/server/db";
import { plans } from "~/server/db/schema";

import { getPlansFromQuery } from "./plans.shared";

export type Plan = typeof plans.$inferSelect;

export async function getPlans(): Promise<Plan[]> {
  return getPlansFromQuery(async () =>
    db.select().from(plans).orderBy(asc(plans.price)),
  );
}
