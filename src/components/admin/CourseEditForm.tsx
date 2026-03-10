"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  courseUpdateSchema,
  type CourseUpdateInput,
} from "~/lib/validations/course";
import {
  toggleCoursePublishStatus,
  updateCourse,
} from "~/server/actions/courses";
import type { CourseAdminListItem } from "~/server/queries/courses";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

type CourseEditFormProps = {
  course: CourseAdminListItem;
};

type CoursePublishStatusButtonProps = {
  courseId: string;
  isPublished: boolean;
};

function fieldClassName(hasError: boolean): string {
  return cn(
    "w-full rounded-md border px-3 py-1.5 text-sm outline-none",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
  );
}

export function CoursePublishStatusButton({
  courseId,
  isPublished,
}: CoursePublishStatusButtonProps) {
  const router = useRouter();

  const handleTogglePublishStatus = async () => {
    const result = await toggleCoursePublishStatus(courseId);

    if (!result.success) {
      toast.error(`Failed to update course status: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    toast.success(
      result.data.newStatus === "published"
        ? "Course is now live!"
        : "Course set to draft",
      {
        duration: 3000,
        position: "bottom-right",
      },
    );
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant={isPublished ? "outline" : "default"}
      className={cn(
        !isPublished && "bg-indigo-600 text-white hover:bg-indigo-700",
      )}
      onClick={handleTogglePublishStatus}
    >
      {isPublished ? "Unpublish" : "Publish Course"}
    </Button>
  );
}

export function CourseEditForm({ course }: CourseEditFormProps) {
  const lastSavedValueRef = useRef<string>(
    JSON.stringify({
      title: course.title,
      description: course.description ?? "",
      thumbnailUrl: course.thumbnailUrl ?? "",
      isFree: course.isFree,
    } satisfies CourseUpdateInput),
  );

  const form = useForm<CourseUpdateInput>({
    resolver: zodResolver(courseUpdateSchema),
    mode: "onBlur",
    defaultValues: {
      title: course.title,
      description: course.description ?? "",
      thumbnailUrl: course.thumbnailUrl ?? "",
      isFree: course.isFree,
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const watchedThumbnailUrl = form.watch("thumbnailUrl");

  const autoSave = useCallback(
    async (data: CourseUpdateInput) => {
      const serialized = JSON.stringify(data);

      if (serialized === lastSavedValueRef.current) {
        return;
      }

      const result = await updateCourse(String(course.id), data);

      if (!result.success) {
        toast.error(`Auto-save failed: ${result.error}`, {
          duration: 4000,
          position: "bottom-right",
        });
        return;
      }

      lastSavedValueRef.current = serialized;
      toast.success("Draft saved automatically", {
        duration: 2000,
        position: "bottom-right",
      });
    },
    [course.id],
  );

  useEffect(() => {
    const hasErrors = Object.keys(form.formState.errors).length > 0;

    if (hasErrors) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const currentValues = form.getValues();
      const parsed = courseUpdateSchema.safeParse(currentValues);

      if (parsed.success) {
        void autoSave(parsed.data);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoSave, form, form.formState.errors, watchedValues]);

  return (
    <form className="max-w-lg space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label
          htmlFor="course-title"
          className="mb-1 block text-[10px] font-semibold tracking-wider text-gray-600 uppercase"
        >
          Title
        </label>
        <input
          id="course-title"
          type="text"
          className={fieldClassName(Boolean(form.formState.errors.title))}
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="mt-1 text-[11px] text-red-500">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="course-description"
          className="mb-1 block text-[10px] font-semibold tracking-wider text-gray-600 uppercase"
        >
          Description
        </label>
        <textarea
          id="course-description"
          rows={4}
          className={cn(
            fieldClassName(Boolean(form.formState.errors.description)),
            "resize-none",
          )}
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="mt-1 text-[11px] text-red-500">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="course-thumbnail-url"
          className="mb-1 block text-[10px] font-semibold tracking-wider text-gray-600 uppercase"
        >
          Thumbnail URL
        </label>
        <input
          id="course-thumbnail-url"
          type="text"
          placeholder="https://example.com/thumbnail.jpg"
          className={fieldClassName(
            Boolean(form.formState.errors.thumbnailUrl),
          )}
          {...form.register("thumbnailUrl")}
        />
        {form.formState.errors.thumbnailUrl ? (
          <p className="mt-1 text-[11px] text-red-500">
            {form.formState.errors.thumbnailUrl.message}
          </p>
        ) : null}
        {watchedThumbnailUrl ? (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={watchedThumbnailUrl}
              alt="Thumbnail preview"
              className="h-32 w-auto rounded-md border border-gray-200 object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Free Course</p>
          <p className="text-xs text-gray-500">
            Students can access without payment
          </p>
        </div>
        <Switch
          checked={Boolean(form.watch("isFree"))}
          onCheckedChange={(value) => {
            form.setValue("isFree", value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });
          }}
          className="data-[state=checked]:bg-indigo-600"
          aria-label="Free Course"
        />
      </div>
    </form>
  );
}
