import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { LogoutButton } from "./logout-button";
import { Button } from "~/components/ui/button";

export async function NavbarAuth() {
  const session = await getServerAuthSession();

  if (session?.user) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { name: true },
    });

    return (
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm font-medium">
          {user?.name ?? session.user.name ?? session.user.email}
        </span>
        <Button variant="ghost" asChild className="min-h-[44px]">
          <Link href="/profile">Profile</Link>
        </Button>
        <LogoutButton />
      </div>
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
