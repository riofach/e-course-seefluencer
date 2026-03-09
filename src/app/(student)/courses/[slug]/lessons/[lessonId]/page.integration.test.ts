import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("lesson page derives completion state and renders the mark complete button before auto-nav", () => {
  const filePath = resolve(
    process.cwd(),
    "src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(
    contents,
    /import \{ MarkCompleteButton \} from "~\/components\/student\/mark-complete-button"/,
  );
  assert.match(
    contents,
    /const isAlreadyCompleted = completedLessonIds\.includes\(lesson\.id\);/,
  );
  assert.match(
    contents,
    /<div className="bg-background\/80 border-border sticky bottom-0 border-t py-4 backdrop-blur-sm">[\s\S]*<MarkCompleteButton/,
  );
  assert.match(contents, /lessonId=\{lesson\.id\}/);
  assert.match(contents, /courseSlug=\{slug\}/);
  assert.match(contents, /lessonType=\{lesson\.type\}/);
  assert.match(contents, /isAlreadyCompleted=\{isAlreadyCompleted\}/);
  assert.match(
    contents,
    /<MarkCompleteButton[\s\S]*<\/div>[\s\S]*<AutoNavCountdown/,
  );
});
