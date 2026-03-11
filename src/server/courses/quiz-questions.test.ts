import assert from "node:assert/strict";
import { test } from "vitest";

import {
  sanitizeQuizQuestions,
  type QuizQuestion,
} from "./quiz-questions.shared.ts";

void test("sanitizeQuizQuestions returns an empty array when no questions exist", () => {
  assert.deepEqual(sanitizeQuizQuestions([]), []);
});

void test("sanitizeQuizQuestions removes sensitive grading fields like correctAnswer and points", () => {
  const dbQuestions: QuizQuestion[] = [
    {
      id: 1,
      lessonId: 42,
      question: "Apa fungsi bitrate?",
      optionA: "Mengatur warna video",
      optionB: "Menentukan kualitas data per detik",
      optionC: "Mengubah judul video",
      optionD: "Menyimpan password",
      correctAnswer: "B",
      points: 10,
      createdAt: new Date(),
    },
    {
      id: 2,
      lessonId: 42,
      question: "Codec audio yang umum dipakai adalah?",
      optionA: "AAC",
      optionB: "HTML",
      optionC: "PNG",
      optionD: "CSS",
      correctAnswer: "A",
      points: 5,
      createdAt: new Date(),
    },
  ];

  const sanitized = sanitizeQuizQuestions(dbQuestions);

  assert.equal(sanitized.length, 2);
  assert.equal("correctAnswer" in sanitized[0]!, false);
  assert.equal("points" in sanitized[0]!, false);
  assert.equal("createdAt" in sanitized[0]!, false);
  assert.equal(sanitized[0]!.id, 1);
  assert.equal(sanitized[1]!.id, 2);
});
