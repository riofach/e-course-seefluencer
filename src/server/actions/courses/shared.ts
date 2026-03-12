import {
  courseCreateSchema,
  courseUpdateSchema,
  type CourseUpdateInput,
  validateCourseThumbnailFile,
} from "../../../lib/validations/course.ts";
import type { ActionResponse } from "../../../types/index.ts";
import {
  generateUniquePublishedCourseSlug,
  isDraftCourseSlug,
} from "./slug.ts";

export type AdminSession = {
  user?: {
    id?: string;
    role?: string;
  };
} | null;

export type CourseActionDependencies = {
  getSession: () => Promise<AdminSession>;
  createDraftSlug: () => string;
  insertCourse: (values: {
    title: string;
    slug: string;
    description: string | null;
    thumbnailUrl: string | null;
    isFree: boolean;
    isPublished: boolean;
  }) => Promise<number | string | undefined>;
  updateCourse: (
    courseId: number,
    data: {
      title: string;
      description: string | null;
      thumbnailUrl: string | null;
      isFree: boolean;
    },
  ) => Promise<void>;
  findCourseById: (
    courseId: number,
  ) => Promise<
    | {
        id: number | string;
        title: string;
        isPublished: boolean;
        slug: string;
        thumbnailUrl: string | null;
      }
    | undefined
  >;
  isCourseSlugTaken: (slug: string, excludeCourseId: number) => Promise<boolean>;
  updateCourseThumbnail: (
    courseId: number,
    thumbnailUrl: string,
  ) => Promise<void>;
  processThumbnailUpload: (file: File) => Promise<Uint8Array>;
  storeThumbnail: (args: {
    courseId: number;
    content: Uint8Array;
  }) => Promise<{ thumbnailUrl: string }>;
  cleanupThumbnail: (thumbnailUrl: string) => Promise<void>;
  setCoursePublishState: (
    courseId: number,
    isPublished: boolean,
    slug?: string,
  ) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  revalidatePaths: (paths: string[]) => void;
};

async function resolvePublishSlug(args: {
  course: {
    id: number | string;
    title: string;
    slug: string;
  };
  dependencies: Pick<CourseActionDependencies, "isCourseSlugTaken">;
}): Promise<string | undefined> {
  if (!isDraftCourseSlug(args.course.slug)) {
    return undefined;
  }

  return generateUniquePublishedCourseSlug({
    courseId: Number(args.course.id),
    title: args.course.title,
    isSlugTaken: args.dependencies.isCourseSlugTaken,
  });
}

function getValidationErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const typedError = error as {
      errors?: Array<{ message?: string }>;
    };

    if (typeof typedError.errors?.[0]?.message === "string") {
      return typedError.errors[0].message;
    }
  }

  return fallback;
}

function parseCourseId(courseId: string): number | null {
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
    return null;
  }

  return parsedCourseId;
}

async function requireAdminSession(
  getSession: CourseActionDependencies["getSession"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { ok: false, error: "Unauthorized." };
  }

  return { ok: true };
}

export async function createCourseWithDependencies(
  dependencies: CourseActionDependencies,
): Promise<ActionResponse<{ courseId: string }>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsed = courseCreateSchema.safeParse({ title: "Untitled Course" });

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(parsed.error, "Invalid course payload."),
    };
  }

  try {
    const courseId = await dependencies.insertCourse({
      title: parsed.data.title,
      slug: dependencies.createDraftSlug(),
      description: null,
      thumbnailUrl: null,
      isFree: false,
      isPublished: false,
    });

    if (courseId === undefined) {
      return { success: false, error: "Failed to create course." };
    }

    dependencies.revalidatePaths(["/admin/courses"]);

    return {
      success: true,
      data: { courseId: String(courseId) },
    };
  } catch (error) {
    console.error("Failed to create course", error);
    return {
      success: false,
      error: "Failed to create course.",
    };
  }
}

export async function updateCourseWithDependencies(
  courseId: string,
  data: CourseUpdateInput,
  dependencies: CourseActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedCourseId = parseCourseId(courseId);

  if (parsedCourseId === null) {
    return { success: false, error: "Invalid course id." };
  }

  const parsed = courseUpdateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: getValidationErrorMessage(parsed.error, "Invalid course payload."),
    };
  }

  try {
    await dependencies.updateCourse(parsedCourseId, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      thumbnailUrl: parsed.data.thumbnailUrl ?? null,
      isFree: parsed.data.isFree,
    });

    dependencies.revalidatePaths([
      "/admin/courses",
      `/admin/courses/${parsedCourseId}`,
      "/courses",
    ]);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update course", error);
    return {
      success: false,
      error: "Failed to update course.",
    };
  }
}

export async function toggleCoursePublishStatusWithDependencies(
  courseId: string,
  dependencies: CourseActionDependencies,
): Promise<ActionResponse<{ newStatus: string }>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedCourseId = parseCourseId(courseId);

  if (parsedCourseId === null) {
    return { success: false, error: "Invalid course id." };
  }

  try {
    const course = await dependencies.findCourseById(parsedCourseId);

    if (!course) {
      return { success: false, error: "Course not found." };
    }

    const nextPublishedState = !course.isPublished;
    const nextSlug = nextPublishedState
      ? await resolvePublishSlug({ course, dependencies })
      : undefined;

    await dependencies.setCoursePublishState(
      parsedCourseId,
      nextPublishedState,
      nextSlug,
    );
    dependencies.revalidatePaths([
      "/courses",
      "/admin/courses",
      `/admin/courses/${parsedCourseId}`,
      ...(course.isPublished ? [`/courses/${course.slug}`] : []),
      ...(nextPublishedState ? [`/courses/${nextSlug ?? course.slug}`] : []),
    ]);

    return {
      success: true,
      data: { newStatus: nextPublishedState ? "published" : "draft" },
    };
  } catch (error) {
    console.error("Failed to toggle course publish status", error);
    return {
      success: false,
      error: "Failed to update course status.",
    };
  }
}

export async function uploadCourseThumbnailWithDependencies(
  courseId: string,
  formData: FormData,
  dependencies: CourseActionDependencies,
): Promise<ActionResponse<{ thumbnailUrl: string }>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedCourseId = parseCourseId(courseId);

  if (parsedCourseId === null) {
    return { success: false, error: "Invalid course id." };
  }

  const course = await dependencies.findCourseById(parsedCourseId);

  if (!course) {
    return { success: false, error: "Course not found." };
  }

  const thumbnailEntry = formData.get("thumbnail");
  const file = thumbnailEntry instanceof File ? thumbnailEntry : null;
  const validation = validateCourseThumbnailFile(file);

  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  const validatedFile = validation.data;

  let storedThumbnail: { thumbnailUrl: string } | null = null;

  try {
    const processedThumbnail = await dependencies.processThumbnailUpload(validatedFile);
    storedThumbnail = await dependencies.storeThumbnail({
      courseId: parsedCourseId,
      content: processedThumbnail,
    });
  } catch (error) {
    console.error("Failed to process course thumbnail", error);
    return {
      success: false,
      error: "Failed to process thumbnail. Please try another image.",
    };
  }

  try {
    await dependencies.updateCourseThumbnail(
      parsedCourseId,
      storedThumbnail.thumbnailUrl,
    );
  } catch (error) {
    console.error("Failed to persist course thumbnail", error);

    try {
      await dependencies.cleanupThumbnail(storedThumbnail.thumbnailUrl);
    } catch (cleanupError) {
      console.error("Failed to cleanup thumbnail after persistence error", cleanupError);
    }

    return {
      success: false,
      error: "Failed to update course thumbnail.",
    };
  }

  if (
    course.thumbnailUrl &&
    course.thumbnailUrl !== storedThumbnail.thumbnailUrl
  ) {
    try {
      await dependencies.cleanupThumbnail(course.thumbnailUrl);
    } catch (error) {
      console.error("Failed to cleanup previous course thumbnail", error);
    }
  }

  dependencies.revalidatePaths([
    "/admin/courses",
    `/admin/courses/${parsedCourseId}`,
    "/courses",
    `/courses/${course.slug}`,
  ]);

  return {
    success: true,
    data: {
      thumbnailUrl: storedThumbnail.thumbnailUrl,
    },
  };
}

export async function deleteCourseWithDependencies(
  courseId: string,
  dependencies: CourseActionDependencies,
): Promise<ActionResponse<void>> {
  const authorization = await requireAdminSession(dependencies.getSession);

  if (!authorization.ok) {
    return { success: false, error: authorization.error };
  }

  const parsedCourseId = parseCourseId(courseId);

  if (parsedCourseId === null) {
    return { success: false, error: "Invalid course id." };
  }

  try {
    await dependencies.deleteCourse(parsedCourseId);
    dependencies.revalidatePaths(["/admin/courses", "/courses"]);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete course", error);
    return { success: false, error: "Failed to delete course." };
  }
}
