export const COURSE_SEARCH_QUERY_MAX_LENGTH = 100;

export function normalizeCourseSearchTerm(query?: string): string | undefined {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return undefined;
  }

  return trimmedQuery.slice(0, COURSE_SEARCH_QUERY_MAX_LENGTH);
}

export function buildCourseSearchHref(
  pathname: string,
  query: string | undefined,
  currentSearch = "",
): string {
  const params = new URLSearchParams(currentSearch);
  const normalizedQuery = normalizeCourseSearchTerm(query);

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  } else {
    params.delete("q");
  }

  const nextSearch = params.toString();

  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}
