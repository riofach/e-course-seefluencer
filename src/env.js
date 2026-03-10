import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const runtimeEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
};

export const env =
  process.env.NODE_ENV === "test"
    ? {
        DATABASE_URL: runtimeEnv.DATABASE_URL,
        NODE_ENV: runtimeEnv.NODE_ENV ?? "test",
        NEXTAUTH_SECRET: runtimeEnv.NEXTAUTH_SECRET,
        NEXTAUTH_URL: runtimeEnv.NEXTAUTH_URL,
        MIDTRANS_SERVER_KEY: runtimeEnv.MIDTRANS_SERVER_KEY,
        NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: runtimeEnv.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
      }
    : createEnv({
        server: {
          DATABASE_URL: z.string().url(),
          NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
          NEXTAUTH_SECRET:
            process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
          NEXTAUTH_URL: z.string().url(),
          MIDTRANS_SERVER_KEY: z.string().min(1),
        },

        client: {
          NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1),
        },

        runtimeEnv,
        skipValidation: !!process.env.SKIP_ENV_VALIDATION,
        emptyStringAsUndefined: true,
      });
