"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { LogoutButton } from "./logout-button";

type PublicMobileMenuProps = {
  displayName: string | null;
};

export function PublicMobileMenu({ displayName }: PublicMobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-900 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-72 border-l border-slate-200/80 bg-white/95 pt-6 backdrop-blur-xl dark:border-white/10 dark:bg-[#0F0F14]/95"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-[family-name:var(--font-playfair-display)] text-left text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Seefluencer
          </SheetTitle>
          <SheetDescription className="text-left tracking-[-0.02em] text-slate-600 dark:text-slate-300">
            Navigate the landing experience and access your account.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-8 px-6 pb-6">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            <SheetClose asChild>
              <Link
                href="/#hero"
                className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Home
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/courses"
                className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Courses
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/pricing"
                className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Pricing
              </Link>
            </SheetClose>
          </nav>

          <div className="mt-auto rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
            {displayName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B6B] via-[#9B59B6] to-[#1ABC9C] text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Signed in as
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                  </div>
                </div>

                <SheetClose asChild>
                  <Button variant="outline" asChild className="min-h-[44px] w-full justify-start rounded-xl">
                    <Link href="/profile">Profile</Link>
                  </Button>
                </SheetClose>

                <LogoutButton variant="ghost" className="w-full justify-start rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Sign in to continue your learning journey.
                </p>

                <SheetClose asChild>
                  <Button variant="ghost" asChild className="min-h-[44px] w-full rounded-xl">
                    <Link href="/login">Login</Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    asChild
                    className="min-h-[44px] w-full rounded-xl bg-gradient-to-r from-[#FF6B6B] via-[#9B59B6] to-[#1ABC9C] text-white hover:opacity-90"
                  >
                    <Link href="/register">Get Started</Link>
                  </Button>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
