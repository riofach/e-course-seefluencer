"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type ThumbnailWithFallbackProps = {
  src: string | null | undefined;
  alt: string;
  className: string;
  fallback: ReactNode;
  testId?: string;
};

export function ThumbnailWithFallback({
  src,
  alt,
  className,
  fallback,
  testId,
}: ThumbnailWithFallbackProps) {
  const normalizedSource = useMemo(() => src?.trim() ?? "", [src]);
  const [hasFailed, setHasFailed] = useState(normalizedSource.length === 0);

  useEffect(() => {
    setHasFailed(normalizedSource.length === 0);
  }, [normalizedSource]);

  if (hasFailed) {
    return <>{fallback}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-testid={testId}
      src={normalizedSource}
      alt={alt}
      className={className}
      onError={() => {
        setHasFailed(true);
      }}
    />
  );
}
