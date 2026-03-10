import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, test, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

afterEach(() => {
  cleanup();
});

import { QuizEngine } from "./quiz-engine";
import * as submitAction from "~/server/actions/progress/submit-quiz";
import * as sonner from "sonner";

// Mock the submit action and toast
vi.spyOn(submitAction, "submitQuiz").mockResolvedValue({
  success: true,
  data: { score: 10, totalPoints: 10, passed: true },
});

vi.spyOn(sonner.toast, "success").mockImplementation(() => "");
vi.spyOn(sonner.toast, "error").mockImplementation(() => "");

const mockQuestions = [
  {
    id: 1,
    lessonId: 1,
    question: "What is 2+2?",
    optionA: "3",
    optionB: "4",
    optionC: "5",
    optionD: "6",
  },
];

test("quiz engine renders an empty state when questions are empty", () => {
  render(<QuizEngine questions={[]} lessonId={1} courseSlug="test" />);
  expect(screen.getByText("No questions available yet.")).toBeDefined();
});

test("quiz engine enforces allAnswered before enabling submit", async () => {
  render(
    <QuizEngine questions={mockQuestions} lessonId={1} courseSlug="test" />,
  );

  const submitButton = screen.getByRole("button", { name: /submit quiz/i });
  expect((submitButton as HTMLButtonElement).disabled).toBe(true);

  const radioB = screen.getAllByRole("radio")[1];
  await userEvent.click(radioB);

  expect((submitButton as HTMLButtonElement).disabled).toBe(false);
});

test("quiz engine submits and swaps to result display", async () => {
  render(
    <QuizEngine questions={mockQuestions} lessonId={1} courseSlug="test" />,
  );

  await userEvent.click(screen.getAllByRole("radio")[1]!);

  const submitButton = screen.getByRole("button", { name: /submit quiz/i });
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/100%/i)).toBeDefined();
    expect(screen.getByText(/Passed/i)).toBeDefined();
  });
});
