export type PlanRecord = {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  createdAt: Date | null;
};

export async function getPlansFromQuery(
  execute: () => Promise<PlanRecord[]>,
): Promise<PlanRecord[]> {
  return execute();
}
