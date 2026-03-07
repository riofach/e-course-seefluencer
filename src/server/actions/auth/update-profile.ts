"use server";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ProfileSchema } from "./schemas";
import type { ActionResponse } from "~/types";

export async function updateProfile(
  _prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const parsed = ProfileSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await db
      .update(users)
      .set({ name: parsed.data.name })
      .where(eq(users.id, session.user.id));
    revalidatePath("/profile");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update profile", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating profile.",
    };
  }
}
