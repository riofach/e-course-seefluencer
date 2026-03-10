import { z } from "zod";

export const chapterCreateSchema = z.object({
  courseId: z.number().int().positive(),
});

export const chapterUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
});

export type ChapterUpdateInput = z.infer<typeof chapterUpdateSchema>;
