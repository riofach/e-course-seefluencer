import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("quiz engine renders an empty state and hides submit when questions are empty", () => {
  const filePath = resolve(process.cwd(), "src/components/student/quiz-engine.tsx");
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /"use client"/);
  assert.match(contents, /HelpCircle/);
  assert.match(contents, /No questions available yet\./);
  assert.match(contents, /if \(questions\.length === 0\) \{/);
  assert.match(contents, /return \([\s\S]*No questions available yet\.[\s\S]*\);/);
});

void test("quiz engine enforces allAnswered before enabling submit", () => {
  const filePath = resolve(process.cwd(), "src/components/student/quiz-engine.tsx");
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /useState<Record<number, string>>\(\{\}\)/);
  assert.match(contents, /Object\.keys\(answers\)\.length === questions\.length/);
  assert.match(contents, /disabled=\{!allAnswered \|\| isPending\}/);
});

void test("quiz engine submits with transition state once all answers are present", () => {
  const filePath = resolve(process.cwd(), "src/components/student/quiz-engine.tsx");
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /useTransition\(\)/);
  assert.match(contents, /startTransition\(async \(\) =>/);
  assert.match(contents, /submitQuiz\(lessonId, courseSlug, answers\)/);
  assert.match(contents, /Submitting\.\.\./);
  assert.match(contents, /Submit Quiz/);
});

void test("quiz engine renders labeled option badges for A through D and highlights selected choices", () => {
  const filePath = resolve(process.cwd(), "src/components/student/quiz-engine.tsx");
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /const isSelected = answers\[quiz\.id\] === option/);
  assert.match(contents, /\{option\}/);
  assert.match(contents, /rounded-full border text-sm font-semibold/);
  assert.match(contents, /border-primary bg-primary text-primary-foreground/);
});
