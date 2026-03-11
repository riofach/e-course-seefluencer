"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  COURSE_THUMBNAIL_ACCEPTED_MIME_TYPES,
  courseUpdateSchema,
  type CourseUpdateInput,
} from "~/lib/validations/course";
import {
  toggleCoursePublishStatus,
  uploadCourseThumbnail,
  updateCourse,
} from "~/server/actions/courses";
import type { CourseAdminListItem } from "~/server/queries/courses";
import { Button } from "~/components/ui/button";
import { ThumbnailWithFallback } from "~/components/shared/thumbnail-with-fallback";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

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

  const handleThumbnailUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.error("Select a thumbnail image before uploading.", {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("thumbnail", file);

    setIsUploadingThumbnail(true);

    const result = await uploadCourseThumbnail(String(course.id), formData);

    setIsUploadingThumbnail(false);

    if (!result.success) {
      toast.error(result.error, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    const nextValues = {
      ...form.getValues(),
      thumbnailUrl: result.data.thumbnailUrl,
    } satisfies CourseUpdateInput;

    lastSavedValueRef.current = JSON.stringify(nextValues);
    form.reset(nextValues);
    setSelectedFileName(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success("Thumbnail updated", {
      duration: 3000,
      position: "bottom-right",
    });
  }, [course.id, form]);

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
          htmlFor="course-thumbnail-upload"
          className="mb-1 block text-[10px] font-semibold tracking-wider text-gray-600 uppercase"
        >
          Thumbnail image
        </label>
        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <input
            id="course-thumbnail-upload"
            ref={fileInputRef}
            type="file"
            accept={COURSE_THUMBNAIL_ACCEPTED_MIME_TYPES.join(",")}
            className={fieldClassName(Boolean(form.formState.errors.thumbnailUrl))}
            onChange={(event) => {
              setSelectedFileName(event.currentTarget.files?.[0]?.name ?? null);
            }}
          />
          <p className="text-xs leading-5 text-gray-500">
            Upload a single JPG, PNG, or WebP image up to 5 MB. The server
            will resize it for thumbnail use, convert it to WebP, and store it
            locally as a temporary transitional asset.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => {
                void handleThumbnailUpload();
              }}
              disabled={isUploadingThumbnail}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isUploadingThumbnail
                ? "Uploading thumbnail..."
                : watchedThumbnailUrl
                  ? "Replace thumbnail"
                  : "Upload thumbnail"}
            </Button>
            {selectedFileName ? (
              <p className="text-xs text-gray-500">Selected: {selectedFileName}</p>
            ) : null}
          </div>
        </div>
        {form.formState.errors.thumbnailUrl ? (
          <p className="mt-1 text-[11px] text-red-500">
            {form.formState.errors.thumbnailUrl.message}
          </p>
        ) : null}
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
            Current preview
          </p>
          <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-100">
            <ThumbnailWithFallback
              src={watchedThumbnailUrl}
              alt="Thumbnail preview"
              className="h-32 w-full object-cover"
              fallback={
                <div className="flex h-32 items-center justify-center bg-gradient-to-tr from-indigo-100 via-white to-teal-100 text-xs font-medium text-gray-500">
                  Thumbnail placeholder
                </div>
              }
            />
          </div>
          {watchedThumbnailUrl ? (
            <p className="break-all text-xs text-gray-500">
              Stored asset path: {watchedThumbnailUrl}
            </p>
          ) : null}
        </div>
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
