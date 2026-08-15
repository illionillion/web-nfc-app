import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { clsx } from "clsx";

import { AppToaster } from "@/components/app-toaster";
import { ConfirmProvider } from "@/components/confirm-provider";
import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  SYSTEM_THEME_INLINE_SCRIPT,
  shouldUseDarkClass,
} from "@/features/settings/lib/apply-theme";
import { parseThemePreference, THEME_COOKIE_NAME } from "@/features/settings/lib/theme-cookie";
import { SITE_ORIGIN, OG_IMAGE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultDescription = "ブラウザだけで NFC タグ（NDEF）を読み書きするツール";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: "Web NFC",
  title: {
    default: "Web NFC",
    template: "%s | Web NFC",
  },
  description: defaultDescription,
  // HTML に出る所有確認用。秘密情報ではない
  verification: {
    google: "Jb-kdqdlbXyt8O9rI0WOAQ92_gL1YGjN468S2392Rdc",
  },
  appleWebApp: {
    capable: true,
    title: "Web NFC",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "Web NFC",
    title: "Web NFC",
    description: defaultDescription,
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web NFC",
    description: defaultDescription,
    images: [
      {
        url: OG_IMAGE.url,
        alt: OG_IMAGE.alt,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = parseThemePreference(cookieStore.get(THEME_COOKIE_NAME)?.value);
  const isDark = shouldUseDarkClass(theme);

  return (
    <html
      lang="ja"
      suppressHydrationWarning
      data-theme={theme}
      className={clsx([
        geistSans.variable,
        geistMono.variable,
        "h-full",
        "antialiased",
        isDark ? "dark" : null,
      ])}
      style={{ colorScheme: isDark ? "dark" : theme === "light" ? "light" : undefined }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_INLINE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ConfirmProvider>
          <SiteHeader theme={theme} />
          {children}
          <SiteFooter />
          <AppToaster theme={isDark ? "dark" : "light"} />
          <PwaRegister />
        </ConfirmProvider>
      </body>
    </html>
  );
}
