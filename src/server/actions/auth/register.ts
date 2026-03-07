"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import type { ActionResponse } from "~/types";

import { RegisterSchema } from "./schemas";

/**
 * Register server action.
 * Signature matches React 19 useActionState: (prevState, formData) => Promise<State>
 */
export async function registerUser(
  _prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // Step 1: Extract raw data
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Step 2: Validate with Zod (server-side — dual-layer validation)
    const validationResult = RegisterSchema.safeParse(rawData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError?.message ?? "Invalid form data.",
      };
    }

    const { name, email, password } = validationResult.data;

    // Step 3: Check for existing email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    // Step 4: Hash password with bcryptjs (NFR-S1, 12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Step 5: Insert new user (role defaults to "student" via schema)
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[registerUser] Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
