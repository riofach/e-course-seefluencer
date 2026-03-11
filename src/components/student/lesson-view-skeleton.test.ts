import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "vitest";

void test("lesson view skeleton mirrors the lesson layout using shadcn skeleton blocks", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/lesson-view-skeleton.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /Skeleton/);
  assert.match(contents, /aspect-video/);
  assert.match(contents, /container mx-auto/);
  assert.match(contents, /bg-\[#0F0F14\]/);
  assert.match(contents, /border-\[#2A2A3C\]/);
  assert.match(contents, /sticky bottom-0/);
  assert.match(contents, /w-\[280px\]/);
});
