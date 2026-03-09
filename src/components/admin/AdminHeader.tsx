import { getServerAuthSession } from "~/server/auth";
import { AdminHeaderContent } from "./AdminHeaderContent";

export async function AdminHeader() {
  const session = await getServerAuthSession();

  const displayName = session?.user?.name ?? "Admin";
  const email = session?.user?.email ?? "admin@seefluencer.local";

  return <AdminHeaderContent displayName={displayName} email={email} />;
}
