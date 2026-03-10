import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("course syllabus links each lesson row to the lesson viewer route", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/course-syllabus.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /href=\{`\/courses\/\$\{courseSlug\}\/lessons\/\$\{lesson.id\}`\}/);
  assert.match(contents, /min-h-11/);
});

void test("course syllabus uses accordion treatment and premium lesson affordances", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/course-syllabus.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /Accordion/);
  assert.match(contents, /Unlock with Premium/i);
  assert.match(contents, /Lock/);
  assert.match(contents, /focus-visible:ring-indigo-500/);
});
