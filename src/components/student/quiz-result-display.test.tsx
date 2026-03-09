/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test } from "vitest";
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

  assert.ok(screen.getByText("80%"));
  assert.ok(screen.getByText("8 / 10 pts"));
  assert.ok(screen.getByText("Passed ✓"));
  assert.ok(screen.getByRole("link", { name: /next lesson/i }));
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

  assert.ok(screen.getByText("40%"));
  assert.ok(screen.getByText("4 / 10 pts"));
  assert.ok(screen.getByText("Failed ✗"));

  const retakeBtn = screen.getByRole("button", { name: /retake quiz/i });
  await userEvent.click(retakeBtn);

  assert.equal(retakeCalled, true);
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

  assert.ok(screen.getByRole("link", { name: /back to course/i }));
});
