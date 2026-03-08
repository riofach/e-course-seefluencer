"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <section className="bg-background text-foreground flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center space-y-4 text-center">
        <div className="bg-destructive/10 text-destructive flex h-20 w-20 items-center justify-center rounded-full">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Gagal Memuat Katalog Kursus
        </h2>
        <p className="text-muted-foreground text-sm">
          Maaf, kami mengalami masalah saat mencoba menghubungkan ke database
          untuk memuat daftar kursus. Silakan coba lagi.
        </p>
        <div className="flex space-x-4 pt-4">
          <Button onClick={() => reset()} variant="default">
            Coba Kembali
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Muat Ulang Halaman
          </Button>
        </div>
      </div>
    </section>
  );
}
