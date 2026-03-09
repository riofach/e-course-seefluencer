import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";

export const metadata: Metadata = {
  title: "E-Course Platform",
  description: "Learn at your own pace with our e-course platform.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

import { ThemeProvider } from "~/components/shared/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { GlobalHeader } from "~/components/shared/global-header";
import { NavbarAuth } from "~/components/shared/navbar-auth";
import { env } from "~/env";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <GlobalHeader>
              <NavbarAuth />
            </GlobalHeader>
            <main className="flex-1">{children}</main>
          </div>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
