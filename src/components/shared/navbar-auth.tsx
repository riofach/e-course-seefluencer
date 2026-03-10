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
          <button
            type="button"
            className="hover:bg-muted flex items-center gap-2 rounded-full p-1 transition-colors"
          >
            <Avatar className="border-border h-8 w-8 border">
              <AvatarImage
                src={user?.image ?? session.user.image ?? ""}
                alt={displayName}
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground hidden pr-2 text-sm font-medium md:block">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1 text-sm">
              <p className="text-foreground font-semibold">{displayName}</p>
              <p className="text-muted-foreground text-xs">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="focus:bg-muted focus:text-foreground cursor-pointer"
          >
            <Link href="/profile" className="flex w-full items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
          >
            <LogoutButton
              variant="ghost"
              className="hover:text-destructive h-auto min-h-0 w-full justify-start p-0 font-normal hover:bg-transparent"
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
