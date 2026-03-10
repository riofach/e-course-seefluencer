import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("mark complete button hides itself for quiz lessons and uses optimistic transitions", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/mark-complete-button.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /"use client"/);
  assert.match(contents, /if \(lessonType === "quiz"\) \{?[\s\S]*return null/);
  assert.match(contents, /useOptimistic/);
  assert.match(contents, /startTransition\(async \(\) =>/);
  assert.match(contents, /setOptimisticCompleted\(true\)/);
});

void test("mark complete button renders loading and completed states with sonner toasts", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/mark-complete-button.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /toast\.success\("Lesson marked as complete!"\)/);
  assert.match(contents, /toast\.error\(/);
  assert.match(contents, /Loader2/);
  assert.match(contents, /CheckCircle2/);
  assert.match(contents, /Marking\.\.\./);
  assert.match(contents, /Completed/);
  assert.match(contents, /Mark as Complete/);
  assert.match(contents, /min-h-11 gap-2 rounded-xl px-4 py-2\.5 text-sm font-semibold shadow-sm transition-all duration-200/);
  assert.match(contents, /!isCompleted &&[\s\S]*dark:bg-indigo-500 dark:hover:bg-indigo-400/);
  assert.match(contents, /isCompleted \? \([\s\S]*<CheckCircle2 className="size-4" \/>[\s\S]*<span>Completed<\/span>[\s\S]*\) : \([\s\S]*<span>Mark as Complete<\/span>/);
});
