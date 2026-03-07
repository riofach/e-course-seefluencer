import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileForm } from "~/components/shared/profile-form";

export const metadata = {
  title: "Profile | E-Course Platform",
};

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { name: true, email: true },
  });

  if (!user) {
    // Should never happen for an authenticated session unless DB is out of sync
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Profile Settings</h1>
      <ProfileForm initialName={user.name ?? ""} email={user.email ?? ""} />
    </main>
  );
}
