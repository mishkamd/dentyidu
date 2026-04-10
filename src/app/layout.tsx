import React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SecurityScriptsInjector } from "@/components/security-scripts-injector";
import { getServerLocale, getTranslations } from "@/lib/locale-server";
import { getContent } from "@/lib/get-content";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, SUPPORTED_LOCALES, LOCALE_MAP } from "@/lib/seo";
import { getPublicSentryDsn } from "@/app/actions/sentry-settings";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let iconUrl: string | undefined
  try {
    const content = await getContent("hero")
    if (content?.value) {
      const data = JSON.parse(content.value)
      if (data.icon) iconUrl = data.icon
    }
  } catch { /* use default */ }

  const title = "DentyMD - Implant Dentar Chișinău | Turism Dentar Moldova | Economie până la 70%"
  const description = "Clinică stomatologică în Chișinău specializată în turism dentar. Implanturi dentare, fațete E-max, coroane zirconiu — economie până la 70% față de UE. Consultație online gratuită."

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: [
      "implant dentar Chișinău", "turism dentar Moldova", "fațete dentare preț",
      "coroane zirconiu", "stomatologie Chișinău", "dental tourism Moldova",
      "dental implants Chisinau", "cheap dental implants Europe",
      "tourisme dentaire Moldavie", "DentyMD",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: "/",
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `/?lang=${l}`])
      ),
    },
    ...(iconUrl && {
      icons: { icon: iconUrl },
    }),
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      locale: "ro_RO",
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== "ro").map((l) => LOCALE_MAP[l]),
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "DentyMD - Clinică Stomatologică Chișinău",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      // Add real values when available
      // google: "your-google-verification-code",
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale()
  const translations = await getTranslations(locale)
  const sentryData = await getPublicSentryDsn()

  return (
    <html lang={locale} suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
        {sentryData?.dsn && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__SENTRY_DSN__=${JSON.stringify(sentryData.dsn)};`,
            }}
          />
        )}
      </head>
      <body className={cn(
        "min-h-screen font-sans antialiased",
        plusJakartaSans.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={locale} initialTranslations={translations}>
            {children}
          </LanguageProvider>
          <SecurityScriptsInjector />
          <Toaster position="top-right" theme="system" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
