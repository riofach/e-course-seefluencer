import { CourseListTable } from "~/components/admin/CourseListTable";
import { getAllCourses } from "~/server/queries/courses";

export async function CoursesTableSection() {
  const courses = await getAllCourses();

  return <CourseListTable courses={courses} />;
}
