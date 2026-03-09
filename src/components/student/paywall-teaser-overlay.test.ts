import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("paywall teaser overlay keeps lesson content on the same route behind an overlay", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/paywall-teaser-overlay.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /relative overflow-hidden rounded-2xl/);
  assert.match(contents, /absolute inset-0/);
  assert.match(contents, /backdrop-blur-sm bg-black\/60|bg-black\/60.*backdrop-blur-sm/);
  assert.match(contents, /href="\/pricing"/);
  assert.doesNotMatch(contents, /redirect\(/);
});
