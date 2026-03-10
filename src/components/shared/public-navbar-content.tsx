import Link from "next/link";
import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { LogoutButton } from "./logout-button";
import { PublicMobileMenu } from "./public-mobile-menu";

const NAV_LINKS = [
  { href: "/#hero", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
] as const;

export type PublicNavbarContentProps = {
  displayName: string | null;
  profileImage: string;
  userEmail: string;
};

export function PublicNavbarContent({
  displayName,
  profileImage,
  userEmail,
}: PublicNavbarContentProps) {
  const initials = displayName?.substring(0, 2).toUpperCase() ?? "SF";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#0F0F14]/80">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair-display)] inline-flex min-h-[44px] min-w-[44px] items-center rounded-xl text-xl font-bold tracking-tight text-slate-900 transition hover:text-[#9B59B6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-white dark:hover:text-[#FF6B6B]"
        >
          Seefluencer
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {displayName ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hover:bg-slate-100 dark:hover:bg-white/10 inline-flex min-h-[44px] min-w-[44px] items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-white/5"
                >
                  <Avatar className="h-9 w-9 border border-slate-200/80 dark:border-white/10">
                    <AvatarImage src={profileImage} alt={displayName} />
                    <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="pr-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 text-sm">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogoutButton
                    variant="ghost"
                    className="h-auto min-h-0 w-full justify-start p-0 font-normal hover:bg-transparent"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="min-h-[44px] rounded-full px-5">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="min-h-[44px] rounded-full bg-gradient-to-r from-[#FF6B6B] via-[#9B59B6] to-[#1ABC9C] px-5 text-white hover:opacity-90"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <PublicMobileMenu displayName={displayName} />
      </div>
    </nav>
  );
}
