import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("lesson page awaits async params and composes the lesson viewer components", () => {
  const filePath = resolve(
    process.cwd(),
    "src/app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /const \{ slug, lessonId \} = await params/);
  assert.match(contents, /getServerAuthSession\(/);
  assert.match(contents, /getLessonById\(lessonId, slug\)/);
  assert.match(contents, /PaywallTeaserOverlay/);
  assert.match(contents, /Breadcrumb/);
  assert.match(contents, /Quiz content coming soon/);
});
