import { z } from "zod";

export const quizCorrectAnswerSchema = z.enum(["A", "B", "C", "D"]);

export const quizCreateSchema = z.object({
  lessonId: z.number().int().positive(),
});

export const quizUpdateSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(2000, "Question is too long"),
  optionA: z.string().min(1, "Option A is required").max(500, "Option A is too long"),
  optionB: z.string().min(1, "Option B is required").max(500, "Option B is too long"),
  optionC: z.string().min(1, "Option C is required").max(500, "Option C is too long"),
  optionD: z.string().min(1, "Option D is required").max(500, "Option D is too long"),
  correctAnswer: quizCorrectAnswerSchema,
  points: z.number().int().min(1, "Points must be at least 1").max(1000, "Points must be at most 1000"),
});

export type QuizCreateInput = z.infer<typeof quizCreateSchema>;
export type QuizUpdateInput = z.infer<typeof quizUpdateSchema>;
