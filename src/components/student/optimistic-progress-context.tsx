"use client";

import { createContext, useContext } from "react";

export type OptimisticProgressContextType = {
  addOptimisticLesson: (lessonId: number) => void;
};

export const OptimisticProgressContext =
  createContext<OptimisticProgressContextType | null>(null);

export function useOptimisticProgress() {
  return useContext(OptimisticProgressContext);
}
