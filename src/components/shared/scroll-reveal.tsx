'use client';

import { useEffect, useRef, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const matchMedia =
      typeof window.matchMedia === "function"
        ? window.matchMedia.bind(window)
        : typeof globalThis.matchMedia === "function"
          ? globalThis.matchMedia.bind(globalThis)
          : null;

    const mediaQuery = matchMedia?.(REDUCED_MOTION_QUERY) ?? { matches: false };

    if (mediaQuery.matches || typeof element.animate !== "function") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        element.animate(
          [
            { opacity: 0, transform: "translateY(20px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 300,
            delay,
            easing: "cubic-bezier(0, 0, 0.2, 1)",
            fill: "both",
          },
        );

        observer.unobserve(element);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
