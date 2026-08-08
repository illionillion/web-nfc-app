import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { clsx } from "clsx";

import { AppToaster } from "@/components/app-toaster";
import { ConfirmProvider } from "@/components/confirm-provider";
import { SiteHeader } from "@/components/site-header";
import {
  SYSTEM_THEME_INLINE_SCRIPT,
  shouldUseDarkClass,
} from "@/features/settings/lib/apply-theme";
import { parseThemePreference, THEME_COOKIE_NAME } from "@/features/settings/lib/theme-cookie";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Web NFC",
    template: "%s | Web NFC",
  },
  description: "ブラウザだけで NFC タグ（NDEF）を読み書きするツール",
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
          <AppToaster theme={isDark ? "dark" : "light"} />
        </ConfirmProvider>
      </body>
    </html>
  );
}
