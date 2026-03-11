import { PublicNavbarShell } from "~/components/shared/public-navbar-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicNavbarShell>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </PublicNavbarShell>
  );
}
