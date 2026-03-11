import { z } from "zod";

export const COURSE_THUMBNAIL_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const COURSE_THUMBNAIL_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidCourseThumbnailReference(value: string): boolean {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return true;
  }

  if (trimmedValue.startsWith("/")) {
    return true;
  }

  return isHttpUrl(trimmedValue);
}

export function validateCourseThumbnailFile<
  TFile extends Pick<File, "name" | "size" | "type">,
>(
  file: TFile | null | undefined,
):
  | { success: true; data: TFile }
  | { success: false; error: string } {
  if (!file) {
    return {
      success: false,
      error: "Thumbnail image is required.",
    };
  }

  if (!COURSE_THUMBNAIL_ACCEPTED_MIME_TYPES.includes(file.type as (typeof COURSE_THUMBNAIL_ACCEPTED_MIME_TYPES)[number])) {
    return {
      success: false,
      error: "Unsupported thumbnail format. Upload JPG, PNG, or WebP.",
    };
  }

  if (file.size > COURSE_THUMBNAIL_MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: "Thumbnail file is too large. Maximum size is 5 MB.",
    };
  }

  return {
    success: true,
    data: file,
  };
}

export const courseCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const courseUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
  description: z.string().optional(),
  thumbnailUrl: z
    .string()
    .trim()
    .refine(isValidCourseThumbnailReference, "Must be a valid URL or local asset path")
    .optional(),
  isFree: z.boolean(),
});

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
