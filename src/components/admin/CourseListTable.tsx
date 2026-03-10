"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteCourse, createCourse } from "~/server/actions/courses";
import type { CourseAdminListItem } from "~/server/queries/courses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

type CourseListTableProps = {
  courses: CourseAdminListItem[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge
      className={
        isPublished
          ? "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"
          : "rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
      }
    >
      {isPublished ? "Published" : "Draft"}
    </Badge>
  );
}

function PricingBadge({ isFree }: { isFree: boolean }) {
  return (
    <Badge
      className={
        isFree
          ? "rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
          : "rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700"
      }
    >
      {isFree ? "Free" : "Premium"}
    </Badge>
  );
}

export function CourseListTable({ courses }: CourseListTableProps) {
  const router = useRouter();
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [creatingCourse, setCreatingCourse] = useState(false);

  const handleCreateCourse = async () => {
    setCreatingCourse(true);

    const result = await createCourse();

    setCreatingCourse(false);

    if (result.success) {
      router.push(`/admin/courses/${result.data.courseId}`);
    }
  };

  const handleDelete = async (courseId: number) => {
    setDeletingCourseId(courseId);

    const result = await deleteCourse(String(courseId));

    setDeletingCourseId(null);

    if (result.success) {
      router.refresh();
    }
  };

  return (
    <section className="space-y-6 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Courses</h1>
        <Button
          type="button"
          onClick={handleCreateCourse}
          disabled={creatingCourse}
          className="bg-indigo-600 px-4 py-2 text-xs text-white hover:bg-indigo-700"
        >
          {creatingCourse ? "Creating..." : "+ Create New Course"}
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mb-1 text-sm font-semibold text-gray-900">No courses yet</h3>
          <p className="mb-6 max-w-xs text-xs text-gray-500">
            Get started by creating your first course. It will be saved as a draft until you publish it.
          </p>
          <Button
            type="button"
            onClick={handleCreateCourse}
            disabled={creatingCourse}
            className="bg-indigo-600 px-4 py-2 text-xs text-white hover:bg-indigo-700"
          >
            + Create New Course
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Pricing</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Created</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{course.title}</td>
                  <td className="px-4 py-3"><StatusBadge isPublished={course.isPublished} /></td>
                  <td className="px-4 py-3"><PricingBadge isFree={course.isFree} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(course.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`} className="text-xs text-gray-600 hover:text-gray-900">
                        Edit
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-1 text-xs text-red-500 hover:text-red-700">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will also delete all Chapters and Lessons.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(course.id)}
                            className="bg-red-600 text-white hover:bg-red-700"
                            aria-label="Yes, delete course"
                            disabled={deletingCourseId === course.id}
                          >
                            Yes, delete course
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
