import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect } from "vitest";
import { QuizResultDisplay } from "./quiz-result-display";

test("quiz result display renders passing state", () => {
  render(
    <QuizResultDisplay
      score={8}
      totalPoints={10}
      passed={true}
      onRetake={() => void 0}
      courseSlug="test-course"
      nextLessonId={2}
    />,
  );

  expect(screen.getByText("80%")).toBeDefined();
  expect(screen.getByText("8 / 10 pts")).toBeDefined();
  expect(screen.getByText("Passed ✓")).toBeDefined();
  expect(screen.getByRole("link", { name: /next lesson/i })).toBeDefined();
});

test("quiz result display renders failing state", async () => {
  let retakeCalled = false;

  render(
    <QuizResultDisplay
      score={4}
      totalPoints={10}
      passed={false}
      onRetake={() => {
        retakeCalled = true;
      }}
      courseSlug="test-course"
    />,
  );

  expect(screen.getByText("40%")).toBeDefined();
  expect(screen.getByText("4 / 10 pts")).toBeDefined();
  expect(screen.getByText("Failed ✗")).toBeDefined();

  const retakeBtn = screen.getByRole("button", { name: /retake quiz/i });
  await userEvent.click(retakeBtn);

  expect(retakeCalled).toBe(true);
});

test("quiz result display renders passing state without next lesson", () => {
  render(
    <QuizResultDisplay
      score={10}
      totalPoints={10}
      passed={true}
      onRetake={() => void 0}
      courseSlug="test-course"
    />,
  );

  expect(screen.getByRole("link", { name: /back to course/i })).toBeDefined();
});
