import {
  quizCreateSchema,
  quizUpdateSchema,
  type QuizUpdateInput,
} from "../../../lib/validations/quiz.ts";
import type { ActionResponse } from "../../../types/index.ts";

type AdminSession = {
  user?: {
    id?: string;
    role?: string;
  };
} | null;

export type QuizActionDependencies = {
  getSession: () => Promise<AdminSession>;
  insertQuiz: (values: {
    lessonId: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    points: number;
  }) => Promise<number | undefined>;
  updateQuiz: (
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
  ) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  getLessonCourseId: (
    lessonId: number,
  ) => Promise<{ courseId: number; lessonId: number } | null>;
  getQuizLessonId: (quizId: number) => Promise<number | null>;
  revalidatePaths: (paths: string[]) => void;
};

function getValidationErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const typedError = error as {
      errors?: Array<{ message?: string }>;
    };

    if (typeof typedError.errors?.[0]?.message === "string") {
      return typedError.errors[0].message;
    }
  }

  return fallback;
}

function parseEntityId(value: string): number | null {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

async function requireAdminSession(
  getSession: QuizActionDependencies["getSession"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { ok: false, error: "Unauthorized." };
  }

  return { ok: true };
}

function getQuizBuilderPath(courseId: number, lessonId: number): string {
  return `/admin/courses/${courseId}/lessons/${lessonId}/quiz`;
}

export async function createQuizQuestionWithDependencies(
  lessonId: string,
  dependencies: QuizActionDependencies,
): Promise<ActionResponse<{ quizId: number }>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedLessonId = parseEntityId(lessonId);

  if (parsedLessonId === null) {
    return { success: false, error: "Invalid lesson id." };
  }

  const parsed = quizCreateSchema.safeParse({ lessonId: parsedLessonId });

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(parsed.error, "Invalid quiz payload."),
    };
  }

  try {
    const lessonContext = await dependencies.getLessonCourseId(parsed.data.lessonId);

    if (lessonContext === null) {
      return { success: false, error: "Lesson not found." };
    }

    const quizId = await dependencies.insertQuiz({
      lessonId: parsed.data.lessonId,
      question: "New Question",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      points: 10,
    });

    if (quizId === undefined) {
      return { success: false, error: "Failed to create quiz question." };
    }

    dependencies.revalidatePaths([
      getQuizBuilderPath(lessonContext.courseId, lessonContext.lessonId),
    ]);

    return { success: true, data: { quizId } };
  } catch (error) {
    console.error("Failed to create quiz question", error);
    return { success: false, error: "Failed to create quiz question." };
  }
}

export async function updateQuizQuestionWithDependencies(
  quizId: string,
  data: QuizUpdateInput,
  dependencies: QuizActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedQuizId = parseEntityId(quizId);

  if (parsedQuizId === null) {
    return { success: false, error: "Invalid quiz id." };
  }

  const parsed = quizUpdateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(parsed.error, "Invalid quiz payload."),
    };
  }

  try {
    const lessonId = await dependencies.getQuizLessonId(parsedQuizId);

    if (lessonId === null) {
      return { success: false, error: "Quiz question not found." };
    }

    const lessonContext = await dependencies.getLessonCourseId(lessonId);

    if (lessonContext === null) {
      return { success: false, error: "Lesson not found." };
    }

    await dependencies.updateQuiz(parsedQuizId, parsed.data);
    dependencies.revalidatePaths([
      getQuizBuilderPath(lessonContext.courseId, lessonContext.lessonId),
    ]);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update quiz question", error);
    return { success: false, error: "Failed to update quiz question." };
  }
}

export async function deleteQuizQuestionWithDependencies(
  quizId: string,
  dependencies: QuizActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedQuizId = parseEntityId(quizId);

  if (parsedQuizId === null) {
    return { success: false, error: "Invalid quiz id." };
  }

  try {
    const lessonId = await dependencies.getQuizLessonId(parsedQuizId);

    if (lessonId === null) {
      return { success: false, error: "Quiz question not found." };
    }

    const lessonContext = await dependencies.getLessonCourseId(lessonId);

    if (lessonContext === null) {
      return { success: false, error: "Lesson not found." };
    }

    await dependencies.deleteQuiz(parsedQuizId);
    dependencies.revalidatePaths([
      getQuizBuilderPath(lessonContext.courseId, lessonContext.lessonId),
    ]);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete quiz question", error);
    return { success: false, error: "Failed to delete quiz question." };
  }
}
