export type PlanSeedRow = {
  name: string;
  price: number;
  durationDays: number;
};

export const initialPlans: PlanSeedRow[] = [
  {
    name: "Pro Monthly",
    price: 99_000,
    durationDays: 30,
  },
];

export type SeedExecutor = (query: string, values: unknown[]) => Promise<void>;

export async function seedPlans(execute: SeedExecutor): Promise<void> {
  for (const plan of initialPlans) {
    await execute(
      `
        insert into plans (name, price, duration_days)
        select $1, $2, $3
        where not exists (
          select 1
          from plans
          where name = $1
            and price = $2
            and duration_days = $3
        )
      `,
      [plan.name, plan.price, plan.durationDays],
    );
  }
}
