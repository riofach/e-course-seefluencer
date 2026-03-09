import type { LessonDetail } from "~/server/courses/lesson-detail";

type SessionLike = {
  user?: {
    id?: string;
  };
} | null;

export function requireAuthenticatedUserId(
  session: SessionLike,
  redirectTo: (path: string) => never,
) {
  const userId = session?.user?.id;

  if (!userId) {
    return redirectTo("/login");
  }

  return userId;
}

export function resolveLessonPageData(
  lesson: LessonDetail | null,
  triggerNotFound: () => never,
) {
  if (!lesson) {
    return triggerNotFound();
  }

  return lesson;
}

export function shouldShowPaywallOverlay(
  lesson: Pick<LessonDetail, "isFree">,
  activeSubscription: boolean,
) {
  return !lesson.isFree && !activeSubscription;
}
