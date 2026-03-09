import "server-only";

import { sql } from "drizzle-orm";

import { db } from "~/server/db";
import { seedPlans } from "./seed.shared";

export async function runSeed(): Promise<void> {
  await seedPlans(async (query, values) => {
    const [name, price, durationDays] = values as [string, number, number];

    await db.execute(sql`
      insert into plans (name, price, duration_days)
      select ${name}, ${price}, ${durationDays}
      where not exists (
        select 1
        from plans
        where name = ${name}
          and price = ${price}
          and duration_days = ${durationDays}
      )
    `);
  });
}

if (process.argv[1]?.endsWith("seed.ts")) {
  runSeed()
    .then(() => {
      console.log("✅ Pricing plans seeded successfully.");
    })
    .catch((error: unknown) => {
      console.error("❌ Failed to seed pricing plans.", error);
      process.exitCode = 1;
    });
}
