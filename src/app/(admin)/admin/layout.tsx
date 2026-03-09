import type { ReactNode } from "react";

import { AdminHeader } from "~/components/admin/AdminHeader";
import { AdminSidebar } from "~/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col bg-neutral-50/30">
          <AdminHeader />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
