import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./global.css"
import { I18nProvider } from "@/components/providers/i18n-provider"

import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Sarvar Avto Test - O'zbekiston Yo'l Harakati Qoidalari Testlari",
    template: "%s | Sarvar Avto Test",
  },
  description: "Sarvar Avto Test orqali haydovchilik imtihonlariga tayyorlaning. YHQ (PDD) testlari, 2024-2025 biletlari va mavzulashtirilgan testlar to'plami.",
  keywords: ["sarvar auto test", "sarvar avtotest", "preparation for auto test", "avtotestga tayyorgarlik", "yhq testlari", "pdd testlari", "haydovchilik imtihoni", "avtomaktab testlari"],
  authors: [{ name: "Sarvar Avto Test" }],
  creator: "Sarvar Avto Test",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sarvaravtotest.uz"),
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://sarvaravtotest.uz",
    siteName: "SarvarAvtoTest",
    title: "SarvarAvtoTest - O'zbekiston YHQ Testlari",
    description: "Avtotestlar orqali bilimingizni oshiring. YHQ (PDD) testlari va imtihonga tayyorgarlik.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SarvarAvtoTest Preview",
      },
    ],
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
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
      <body className={`${poppins.variable} font-sans antialiased bg-background text-foreground bg-premium-mesh min-h-screen`}>
        <I18nProvider>
          {children}
          <Toaster />
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  )
}
