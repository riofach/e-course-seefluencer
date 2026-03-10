import { z } from "zod";

export const lessonTypeSchema = z.enum(["video", "text", "quiz"]);

export const lessonCreateSchema = z.object({
  chapterId: z.number().int().positive(),
});

export const lessonUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  type: lessonTypeSchema,
  videoUrl: z.string().url("Video URL must be a valid URL").optional().or(z.literal("")),
  content: z.string().optional(),
  isFree: z.boolean(),
});

export const lessonTitleSchema = lessonUpdateSchema.pick({ title: true });

export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
export type LessonTitleInput = z.infer<typeof lessonTitleSchema>;
