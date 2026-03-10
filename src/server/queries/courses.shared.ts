export type CourseAdminListItem = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  slug: string;
  isFree: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAllCoursesFromQuery(
  query: () => Promise<CourseAdminListItem[]>,
): Promise<CourseAdminListItem[]> {
  return query();
}

export async function getCourseByIdFromQuery(
  courseId: string,
  query: (parsedCourseId: number) => Promise<CourseAdminListItem | undefined>,
): Promise<CourseAdminListItem | undefined> {
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
    return undefined;
  }

  return query(parsedCourseId);
}
