"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
];

export function MobileAdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  return (
    <header className="flex h-14 items-center gap-4 border-b border-[#E5E7EB] bg-white px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-white p-0">
          <SheetHeader className="border-b border-[#E5E7EB] px-6 py-5 text-left">
            <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
              Seefluencer Admin
            </p>
            <SheetTitle className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
              Dashboard
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors hover:border-[#E5E7EB] hover:bg-neutral-50 hover:text-neutral-950",
                    isActive
                      ? "border-gray-200 bg-white text-neutral-950"
                      : "text-neutral-600",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        <p className="text-sm font-semibold text-neutral-950">
          Seefluencer Admin
        </p>
      </div>
    </header>
  );
}
