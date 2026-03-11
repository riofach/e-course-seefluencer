import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "vitest";

void test("course detail loading route renders the detail skeleton component", () => {
  const filePath = resolve(
    process.cwd(),
    "src/app/(student)/courses/[slug]/loading.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /CourseDetailSkeleton/);
  assert.match(contents, /container mx-auto/);
});

void test("course detail skeleton includes hero, chapter, and outcomes placeholders", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/course-detail-skeleton.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /data-testid="course-detail-skeleton"/);
  assert.match(contents, /Array\.from\(\{ length: 4 \}\)/);
  assert.match(contents, /rounded-\[32px\]/);
});
