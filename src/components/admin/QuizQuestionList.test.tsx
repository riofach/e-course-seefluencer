import assert from "node:assert/strict";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test, vi } from "vitest";

const { mockCreateQuizQuestion } = vi.hoisted(() => ({
  mockCreateQuizQuestion: vi.fn<
    (lessonId: string) => Promise<{ success: true; data: { quizId: number } }>
  >(),
}));

vi.mock("~/server/actions/quizzes", () => ({
  createQuizQuestion: async (lessonId: string) => await mockCreateQuizQuestion(lessonId),
  updateQuizQuestion: vi.fn(),
  deleteQuizQuestion: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./QuizQuestionCard", () => ({
  QuizQuestionCard: ({ quiz, index }: { quiz: { question: string }; index: number }) => (
    <div>{`Card ${index + 1}: ${quiz.question}`}</div>
  ),
}));

import { QuizQuestionList } from "./QuizQuestionList";

beforeEach(() => {
  mockCreateQuizQuestion.mockReset();
});

afterEach(() => {
  cleanup();
});

const baseQuiz = {
  id: 1,
  lessonId: 5,
  question: "What is Next.js?",
  optionA: "Framework",
  optionB: "Database",
  optionC: "IDE",
  optionD: "Browser",
  correctAnswer: "A",
  points: 10,
  createdAt: new Date("2026-03-10T09:00:00.000Z"),
};

test("renders empty state when no quizzes", () => {
  render(<QuizQuestionList lessonId={5} initialQuizzes={[]} />);

  assert.ok(screen.getByText(/no questions yet/i));
  assert.ok(screen.getByRole("button", { name: /add first question/i }));
});

test("renders question cards when quizzes exist", () => {
  render(<QuizQuestionList lessonId={5} initialQuizzes={[baseQuiz]} />);

  assert.ok(screen.getByText(/card 1: what is next\.js\?/i));
  assert.ok(screen.getByRole("button", { name: /add question/i }));
});

test('"Add Question" button calls createQuizQuestion action', async () => {
  mockCreateQuizQuestion.mockResolvedValue({
    success: true,
    data: { quizId: 12 },
  });

  const user = userEvent.setup();

  render(<QuizQuestionList lessonId={5} initialQuizzes={[baseQuiz]} />);

  await user.click(screen.getByRole("button", { name: /add question/i }));

  await waitFor(() => {
    assert.equal(mockCreateQuizQuestion.mock.calls[0]?.[0], "5");
  });
});
