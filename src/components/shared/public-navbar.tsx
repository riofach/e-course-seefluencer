import { getServerAuthSession } from "~/server/auth";
import { getUserProfileData } from "~/server/users/queries";
import { PublicNavbarContent } from "./public-navbar-content";

export async function PublicNavbar() {
  const session = await getServerAuthSession();

  let displayName: string | null = null;
  let profileImage = "";
  let userEmail = "";

  if (session?.user?.id) {
    const user = await getUserProfileData(session.user.id);

    displayName = user?.name ?? session.user.name ?? "User";
    profileImage = user?.image ?? session.user.image ?? "";
    userEmail = session.user.email ?? "";
  }

  return (
    <PublicNavbarContent
      displayName={displayName}
      profileImage={profileImage}
      userEmail={userEmail}
    />
  );
}
