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
    default: "Tezkor Avtotest - O'zbekiston Yo'l Harakati Qoidalari Testlari",
    template: "%s | Tezkor Avtotest",
  },
  description: "Avtotestlar orqali bilimingizni oshiring. YHQ (PDD) testlari, imtihon biletlari va mavzulashtirilgan testlar.",
  keywords: ["avtotest", "yhq", "pdd", "uzbekistan", "prava", "imtihon", "test", "yo'l harakati qoidalari"],
  authors: [{ name: "Tezkor Avtotest Team" }],
  creator: "Tezkor Avtotest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tezkoravtotest.uz"),
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://tezkoravtotest.uz",
    siteName: "Tezkor Avtotest",
    title: "Tezkor Avtotest - O'zbekiston YHQ Testlari",
    description: "Avtotestlar orqali bilimingizni oshiring. YHQ (PDD) testlari va imtihonga tayyorgarlik.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tezkor Avtotest Preview",
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
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-sans antialiased bg-slate-950 text-slate-200`}>
        <I18nProvider>
          {children}
          <Toaster />
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  )
}
