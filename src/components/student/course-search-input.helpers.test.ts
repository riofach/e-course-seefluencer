import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCourseSearchHref,
  COURSE_SEARCH_QUERY_MAX_LENGTH,
  normalizeCourseSearchTerm,
} from "./course-search-input.helpers.ts";

void test("normalizeCourseSearchTerm trims whitespace and caps length", () => {
  const longQuery = `  ${"r".repeat(COURSE_SEARCH_QUERY_MAX_LENGTH + 25)}  `;
  const normalized = normalizeCourseSearchTerm(longQuery);

  assert.equal(normalized?.length, COURSE_SEARCH_QUERY_MAX_LENGTH);
  assert.equal(normalized, "r".repeat(COURSE_SEARCH_QUERY_MAX_LENGTH));
});

void test("normalizeCourseSearchTerm returns undefined for blank values", () => {
  assert.equal(normalizeCourseSearchTerm(undefined), undefined);
  assert.equal(normalizeCourseSearchTerm("   "), undefined);
});

void test("buildCourseSearchHref sets q while preserving unrelated params", () => {
  const href = buildCourseSearchHref("/courses", "react", "limit=20&offset=0");

  assert.equal(href, "/courses?limit=20&offset=0&q=react");
});

void test("buildCourseSearchHref removes q when query becomes empty", () => {
  const href = buildCourseSearchHref("/courses", "   ", "limit=20&q=react");

  assert.equal(href, "/courses?limit=20");
});
