import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("course detail loading route renders the detail skeleton component", () => {
  const filePath = resolve(
    process.cwd(),
    "src/app/(student)/courses/[slug]/loading.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /CourseDetailSkeleton/);
  assert.match(contents, /container mx-auto/);
});
