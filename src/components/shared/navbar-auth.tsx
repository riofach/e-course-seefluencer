import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { getUserProfileData } from "~/server/users/queries";
import { LogoutButton } from "./logout-button";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { User } from "lucide-react";

export async function NavbarAuth() {
  const session = await getServerAuthSession();

  if (session?.user) {
    const user = await getUserProfileData(session.user.id);

    const displayName = user?.name ?? session.user.name ?? "User";
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted/50 relative h-10 w-10 gap-2 rounded-full p-0 transition-colors md:w-auto md:justify-center md:px-2"
          >
            <Avatar className="border-border h-8 w-8 border">
              <AvatarImage
                src={user?.image ?? session.user.image ?? ""}
                alt={displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:block">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{displayName}</p>
              <p className="text-muted-foreground text-xs leading-none">
                {session.user.email}
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
          <DropdownMenuItem
            asChild
            className="mt-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-900"
          >
            <LogoutButton
              variant="ghost"
              className="h-auto min-h-0 w-full justify-start p-0 font-normal hover:bg-transparent hover:text-red-900"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild className="min-h-[44px]">
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild className="min-h-[44px]">
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  );
}
