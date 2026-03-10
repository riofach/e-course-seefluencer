import type { ReactNode } from "react";

import { PublicNavbarShell } from "~/components/shared/public-navbar-shell";

export default function PricingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PublicNavbarShell>{children}</PublicNavbarShell>;
}
