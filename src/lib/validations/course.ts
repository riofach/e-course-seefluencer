import { z } from "zod";

export const courseCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const courseUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
  description: z.string().optional(),
  thumbnailUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  isFree: z.boolean(),
});

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
