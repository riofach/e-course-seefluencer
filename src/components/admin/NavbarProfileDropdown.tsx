"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type NavbarProfileDropdownProps = {
  displayName: string;
  email: string;
};

export function NavbarProfileDropdown({
  displayName,
  email,
}: NavbarProfileDropdownProps) {
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-neutral-100"
        >
          <Avatar className="h-8 w-8 border border-[#E5E7EB]">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-neutral-100 text-xs font-medium text-neutral-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden pr-1 text-sm font-medium text-neutral-700 md:block">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border border-neutral-200 bg-white"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 text-sm">
            <p className="font-semibold text-neutral-950">{displayName}</p>
            <p className="text-xs text-neutral-500">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer text-neutral-700 focus:bg-neutral-50 focus:text-neutral-950">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-neutral-100" />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
