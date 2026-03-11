import assert from "node:assert/strict";
import { test } from "vitest";

import {
  quizCreateSchema,
  quizUpdateSchema,
  type QuizCreateInput,
  type QuizUpdateInput,
} from "./quiz.ts";

void test("quizCreateSchema accepts positive lesson ids", () => {
  const result = quizCreateSchema.safeParse({ lessonId: 5 });

  assert.equal(result.success, true);

  if (!result.success) {
    assert.fail("Expected valid quiz create payload");
  }

  assert.deepEqual(result.data, { lessonId: 5 } satisfies QuizCreateInput);
});

void test("quizCreateSchema rejects non-positive lesson ids", () => {
  const result = quizCreateSchema.safeParse({ lessonId: 0 });

  assert.equal(result.success, false);
});

void test("quizUpdateSchema accepts valid quiz updates", () => {
  const result = quizUpdateSchema.safeParse({
    question: "What does RSC stand for?",
    optionA: "React Server Components",
    optionB: "React Static Compiler",
    optionC: "Runtime Styled Components",
    optionD: "Remote State Container",
    correctAnswer: "A",
    points: 10,
  });

  assert.equal(result.success, true);

  if (!result.success) {
    assert.fail("Expected valid quiz update payload");
  }

  assert.deepEqual(
    result.data,
    {
      question: "What does RSC stand for?",
      optionA: "React Server Components",
      optionB: "React Static Compiler",
      optionC: "Runtime Styled Components",
      optionD: "Remote State Container",
      correctAnswer: "A",
      points: 10,
    } satisfies QuizUpdateInput,
  );
});

void test("quizUpdateSchema rejects unsupported correct answers", () => {
  const result = quizUpdateSchema.safeParse({
    question: "Question",
    optionA: "One",
    optionB: "Two",
    optionC: "Three",
    optionD: "Four",
    correctAnswer: "E",
    points: 10,
  });

  assert.equal(result.success, false);
});

void test("quizUpdateSchema rejects empty question text", () => {
  const result = quizUpdateSchema.safeParse({
    question: "",
    optionA: "One",
    optionB: "Two",
    optionC: "Three",
    optionD: "Four",
    correctAnswer: "A",
    points: 10,
  });

  assert.equal(result.success, false);
});
