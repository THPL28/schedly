import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import PWARegister from "@/components/pwa-register";
import OfflineBanner from '@/components/offline-banner'
import PWAInstallCTA from '@/components/pwa-install-cta'
import PWAUpdateToast from '@/components/pwa-update-toast'
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedly - Smart Scheduling",
  description: "Gerencie seus agendamentos profissionais de forma eficiente",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Schedly",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  themeColor: "#6366f1",
  viewport: { width: "device-width", initialScale: 1 },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "pt";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PWARegister />
        {children}

        {/* PWA UX helpers */}
        <script defer />
        <div id="pwa-ui-root" />
        <OfflineBanner />
        <PWAInstallCTA />
        <PWAUpdateToast />

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
