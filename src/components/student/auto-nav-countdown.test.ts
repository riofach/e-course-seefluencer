import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

void test("auto nav countdown uses light-default card styles with dark overrides", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/auto-nav-countdown.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /import \{ cn \} from "~\/lib\/utils";/);
  assert.match(contents, /const cardClassName = cn\(/);
  assert.match(
    contents,
    /border-slate-200\/80 bg-white\/95 text-slate-950 shadow-sm shadow-slate-200\/70 backdrop-blur supports-\[backdrop-filter\]:bg-white\/90/,
  );
  assert.match(
    contents,
    /dark:border-\[#2A2A3C\] dark:bg-\[#1A1A24\] dark:text-slate-50 dark:shadow-black\/20 dark:supports-\[backdrop-filter\]:bg-\[#1A1A24\]\/95/,
  );
  assert.doesNotMatch(contents, /<Card className="border-\[#2A2A3C\] bg-\[#1A1A24\] text-slate-50">/);
  assert.match(contents, /<Card className=\{cardClassName\}>/);
});

void test("auto nav countdown preserves quiz guard and completion messaging", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/auto-nav-countdown.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /if \(currentLessonType === "quiz"\) \{/);
  assert.match(contents, /You&apos;ve completed all lessons!/);
  assert.match(contents, /Up next: \{nextLesson\.title\}/);
  assert.match(contents, /router\.push\(nextLessonHref\)/);
});
