import type { CourseDetailItem } from "~/server/courses/course-detail";

export type CourseLandingCta = {
  label: string;
  href: string;
  helperText: string;
};

export async function resolveCoursePageData(
  slug: string,
  getCourseDetail: (slug: string) => Promise<CourseDetailItem | null>,
  triggerNotFound: () => never,
) {
  const course = await getCourseDetail(slug);

  if (!course) {
    return triggerNotFound();
  }

  return course;
}

type ResolveCourseLandingCtaOptions = {
  course: Pick<CourseDetailItem, "isFree" | "slug" | "chapters">;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
};

function getFirstLessonHref(course: ResolveCourseLandingCtaOptions["course"]) {
  const firstLessonId = course.chapters[0]?.lessons[0]?.id;

  return firstLessonId
    ? `/courses/${course.slug}/lessons/${firstLessonId}`
    : `/courses/${course.slug}`;
}

export function resolveCourseLandingCta({
  course,
  isAuthenticated,
  hasActiveSubscription,
}: ResolveCourseLandingCtaOptions): CourseLandingCta {
  if (hasActiveSubscription) {
    return {
      label: "Continue Learning",
      href: getFirstLessonHref(course),
      helperText: "Langsung lanjut ke lesson pertama dan pertahankan momentum belajarmu.",
    };
  }

  if (course.isFree) {
    return {
      label: "Start Learning",
      href: isAuthenticated
        ? getFirstLessonHref(course)
        : `/login?callbackUrl=${encodeURIComponent(`/courses/${course.slug}`)}`,
      helperText: isAuthenticated
        ? "Masuk ke lesson pertama sekarang dan mulai progress pertamamu."
        : "Login singkat untuk membuka lesson gratis pertama dan menyimpan progresmu.",
    };
  }

  return {
    label: isAuthenticated ? "Get Premium Access" : "Get Premium Access",
    href: "/pricing",
    helperText:
      "Unlock semua lesson premium, quiz, dan learning path penuh dengan subscription aktif.",
  };
}

export function getCourseOutcomeItems(course: Pick<CourseDetailItem, "title" | "isFree">) {
  return [
    `Pahami framework inti di balik ${course.title} lewat lesson yang disusun bertahap dan mudah diikuti.`,
    "Bangun momentum dengan kombinasi video, text lesson, dan quiz reinforcement pada tiap chapter.",
    course.isFree
      ? "Mulai tanpa friksi lewat lesson gratis dan lihat apakah ritme belajar platform ini cocok untukmu."
      : "Lihat struktur lengkap course premium sebelum unlock semua materi untuk sprint belajar serius.",
    "Gunakan struktur chapter yang jelas untuk tahu apa yang akan dikuasai sebelum kamu commit belajar.",
  ];
}

export async function resolveCourseStaticParams(
  getSlugs: () => Promise<Array<{ slug: string }>>,
) {
  const slugs = await getSlugs();
  return slugs.map((course) => ({ slug: course.slug }));
}
