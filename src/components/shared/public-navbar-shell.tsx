import type { ReactNode } from "react";

import { PublicNavbar } from "~/components/shared/public-navbar";

type PublicNavbarShellProps = {
  children: ReactNode;
};

export function PublicNavbarShell({ children }: PublicNavbarShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
