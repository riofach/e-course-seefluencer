import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const COURSE_THUMBNAIL_DIRECTORY = join("uploads", "course-thumbnails");

const THUMBNAIL_MAX_WIDTH = 1200;
const THUMBNAIL_MAX_HEIGHT = 675;
const THUMBNAIL_WEBP_QUALITY = 62;
const THUMBNAIL_WEBP_EFFORT = 6;

export function getCourseThumbnailStorageDirectory(
  rootDirectory = process.cwd(),
): string {
  return join(rootDirectory, "public", COURSE_THUMBNAIL_DIRECTORY);
}

export function getCourseThumbnailPublicPath(fileName: string): string {
  return `/${COURSE_THUMBNAIL_DIRECTORY.replaceAll("\\", "/")}/${fileName}`;
}

export function isManagedCourseThumbnailPath(
  thumbnailUrl: string | null | undefined,
): thumbnailUrl is string {
  return Boolean(
    thumbnailUrl?.startsWith("/uploads/course-thumbnails/"),
  );
}

export async function processCourseThumbnailUpload(
  file: File,
): Promise<Uint8Array> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const processedBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: THUMBNAIL_MAX_WIDTH,
      height: THUMBNAIL_MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: THUMBNAIL_WEBP_QUALITY,
      effort: THUMBNAIL_WEBP_EFFORT,
    })
    .toBuffer();

  return new Uint8Array(processedBuffer);
}

export async function storeCourseThumbnailLocally(args: {
  courseId: number;
  content: Uint8Array;
  rootDirectory?: string;
  now?: () => number;
  randomId?: () => string;
}): Promise<{ thumbnailUrl: string }> {
  const rootDirectory = args.rootDirectory ?? process.cwd();
  const now = args.now ?? (() => Date.now());
  const randomId = args.randomId ?? (() => crypto.randomUUID());
  const storageDirectory = getCourseThumbnailStorageDirectory(rootDirectory);
  const fileName = `course-${args.courseId}-${now()}-${randomId()}.webp`;
  const filePath = join(storageDirectory, fileName);

  await mkdir(storageDirectory, { recursive: true });
  await writeFile(filePath, args.content);

  return {
    thumbnailUrl: getCourseThumbnailPublicPath(fileName),
  };
}

export async function cleanupCourseThumbnailFile(args: {
  thumbnailUrl: string;
  rootDirectory?: string;
}): Promise<void> {
  if (!isManagedCourseThumbnailPath(args.thumbnailUrl)) {
    return;
  }

  const rootDirectory = args.rootDirectory ?? process.cwd();
  const relativePath = args.thumbnailUrl.replace(/^\//, "");
  const filePath = join(rootDirectory, "public", relativePath);

  await rm(filePath, { force: true });
}
