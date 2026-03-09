import { MobileAdminSidebar } from "./MobileAdminSidebar";
import { NavbarProfileDropdown } from "./NavbarProfileDropdown";

type AdminHeaderContentProps = {
  displayName: string;
  email: string;
};

export function AdminHeaderContent({
  displayName,
  email,
}: AdminHeaderContentProps) {
  return (
    <>
      <MobileAdminSidebar />
      <header className="hidden h-14 items-center justify-end px-6 py-4 md:flex">
        <NavbarProfileDropdown displayName={displayName} email={email} />
      </header>
    </>
  );
}
