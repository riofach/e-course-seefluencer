import "server-only";

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getUserProfileData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { name: true, image: true },
  });

  return user;
}
