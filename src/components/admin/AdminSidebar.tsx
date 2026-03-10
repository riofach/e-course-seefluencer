"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/courses", label: "Courses" },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E5E7EB] bg-white md:flex">
      <div className="border-b border-[#E5E7EB] px-6 py-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500 uppercase">
          Seefluencer Admin
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
          Dashboard
        </h2>
      </div>

      <nav
        className="flex flex-col gap-1 px-3 py-4"
        aria-label="Admin navigation"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
