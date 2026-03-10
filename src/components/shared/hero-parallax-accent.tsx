'use client';

import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function HeroParallaxAccent() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const matchMedia =
      typeof window.matchMedia === "function"
        ? window.matchMedia.bind(window)
        : typeof globalThis.matchMedia === "function"
          ? globalThis.matchMedia.bind(globalThis)
          : null;

    if (matchMedia?.(REDUCED_MOTION_QUERY).matches) {
      return;
    }

    const handleScroll = () => {
      setOffset(Math.min(window.scrollY * 0.12, 24));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-12 right-4 h-40 w-40 rounded-full bg-[#9B59B6]/10 blur-3xl sm:right-12 sm:h-56 sm:w-56"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      />
      <div
        className="absolute -bottom-16 left-0 h-32 w-32 rounded-full bg-[#1ABC9C]/10 blur-3xl sm:left-8 sm:h-44 sm:w-44"
        style={{ transform: `translate3d(0, ${offset * -0.6}px, 0)` }}
      />
    </div>
  );
}
