"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { QuizUpdateInput } from "~/lib/validations/quiz";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { chapters, lessons, quizzes } from "~/server/db/schema";
import type { ActionResponse } from "~/types";

import {
  createQuizQuestionWithDependencies,
  deleteQuizQuestionWithDependencies,
  updateQuizQuestionWithDependencies,
} from "./shared";

const dependencies = {
  getSession: getServerAuthSession,
  insertQuiz: async (values: {
    lessonId: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    points: number;
  }) => {
    const result = await db.insert(quizzes).values(values).returning({ id: quizzes.id });
    return result[0]?.id;
  },
  updateQuiz: async (
    quizId: number,
    data: Partial<{
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      points: number;
    }>,
  ) => {
    await db.update(quizzes).set(data).where(eq(quizzes.id, quizId));
  },
  deleteQuiz: async (quizId: number) => {
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
  },
  getLessonCourseId: async (lessonId: number) => {
    const result = await db
      .select({ courseId: chapters.courseId, lessonId: lessons.id })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);

    return result[0] ?? null;
  },
  getQuizLessonId: async (quizId: number) => {
    const result = await db
      .select({ lessonId: quizzes.lessonId })
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    return result[0]?.lessonId ?? null;
  },
  revalidatePaths: (paths: string[]) => {
    for (const path of paths) {
      revalidatePath(path);
    }

    revalidatePath("/admin/courses/[courseId]/lessons/[lessonId]/quiz");
  },
};

export async function createQuizQuestion(
  lessonId: string,
): Promise<ActionResponse<{ quizId: number }>> {
  return createQuizQuestionWithDependencies(lessonId, dependencies);
}

export async function updateQuizQuestion(
  quizId: string,
  data: QuizUpdateInput,
): Promise<ActionResponse<void>> {
  return updateQuizQuestionWithDependencies(quizId, data, dependencies);
}

export async function deleteQuizQuestion(
  quizId: string,
): Promise<ActionResponse<void>> {
  return deleteQuizQuestionWithDependencies(quizId, dependencies);
}
