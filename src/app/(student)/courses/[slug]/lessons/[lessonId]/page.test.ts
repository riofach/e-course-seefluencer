import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("lesson page fetches quiz questions in the RSC body and renders QuizEngine for quiz lessons", () => {
  const filePath = resolve(
    process.cwd(),
    "src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /const \{ slug, lessonId \} = await params/);
  assert.match(contents, /getServerAuthSession\(/);
  assert.match(contents, /getLessonById\(lessonId, slug\)/);
  assert.match(contents, /getQuizQuestions/);
  assert.match(
    contents,
    /const quizQuestions =\s*!showPaywallOverlay && lesson\.type === "quiz"\s*\? await getQuizQuestions\(lesson\.id\)\s*: \[\];/,
  );
  assert.match(contents, /QuizEngine/);
  assert.match(contents, /questions=\{quizQuestions\}/);
  assert.match(contents, /PaywallTeaserOverlay/);
  assert.match(contents, /Breadcrumb/);
  assert.doesNotMatch(contents, /Quiz content coming soon/);
});
