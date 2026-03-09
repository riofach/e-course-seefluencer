import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PricingPageClient } from "~/components/student/pricing-page-client";
import { getServerAuthSession } from "~/server/auth";
import { getPlans } from "~/server/queries/plans";
import { getUserActiveSubscription } from "~/server/queries/subscriptions";

export const metadata: Metadata = {
  title: "Pricing | E-Course Platform",
  description:
    "Pilih paket langganan premium Seefluencer dan lanjutkan ke checkout Midtrans.",
};

export default async function PricingPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [plans, activeSubscription] = await Promise.all([
    getPlans(),
    getUserActiveSubscription(session.user.id),
  ]);

  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 px-4 py-8 sm:py-10 lg:py-14">
        <div className="max-w-3xl space-y-4">
          <span className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
            Pricing
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Upgrade yang terasa worth it untuk akses semua materi premium.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
              Lihat paket yang tersedia, pahami nilainya, lalu lanjutkan ke
              checkout Midtrans tanpa meninggalkan halaman.
            </p>
          </div>
        </div>

        <PricingPageClient
          plans={plans}
          isSubscribed={activeSubscription !== null}
        />
      </div>
    </section>
  );
}
