import type React from "react"
import type { Metadata } from "next"
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
    default: "Sarvar Avto Test - Haydovchilik Imtihoniga Tayyorgarlik",
    template: "%s | Sarvar Avto Test",
  },
  description:
    "Sarvar Avto Test — O'zbekistonda haydovchilik imtihoniga tayyorlanish uchun №1 platforma. 2024-2025 YHQ (PDD) testlari, bepul biletlar, mavzular bo'yicha testlar va imtihon simulyatori. sarvaravtotest.uz",
  keywords: [
    "sarvar avtotest",
    "sarvar avto test",
    "sarvar avto test uz",
    "sarvaravtotest",
    "sarvaravtotest.uz",
    "avtotest",
    "avto test",
    "avtomaktab testi",
    "haydovchilik imtihoni",
    "haydovchilik guvohnomasi",
    "yhq testlari",
    "yo'l harakati qoidalari",
    "pdd testlari",
    "pdd o'zbek",
    "bilet testlari",
    "2024 biletlar",
    "2025 biletlar",
    "imtihon simulyatori",
    "bepul avtotest",
    "avtotest tayyorgarlik",
    "haydovchilik kursi",
    "ekspres kurs avtotest",
    "sarvar avtotest express",
  ],
  authors: [{ name: "Sarvar Avto Test", url: "https://sarvaravtotest.uz" }],
  creator: "Sarvar Avto Test",
  publisher: "Sarvar Avto Test",
  category: "Education",
  metadataBase: new URL("https://sarvaravtotest.uz"),
  alternates: {
    canonical: "https://sarvaravtotest.uz",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://sarvaravtotest.uz",
    siteName: "Sarvar Avto Test",
    title: "Sarvar Avto Test — YHQ Testlari va Haydovchilik Imtihoniga Tayyorgarlik",
    description:
      "O'zbekistonda haydovchilik imtihoniga tayyorlanish uchun №1 platforma. Bepul YHQ testlari, biletlar va imtihon simulyatori.",
    images: [
      {
        url: "/images/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Sarvar Avto Test — YHQ Testlari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarvar Avto Test — YHQ Testlari",
    description: "O'zbekistonda haydovchilik imtihoniga tayyorlanish uchun №1 platforma.",
    images: ["/images/logo.jpg"],
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
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sarvaravtotest.uz/#website",
      url: "https://sarvaravtotest.uz",
      name: "Sarvar Avto Test",
      description: "O'zbekistonda haydovchilik imtihoniga tayyorlanish uchun №1 platforma",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://sarvaravtotest.uz/topics?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "uz-UZ",
    },
    {
      "@type": "Organization",
      "@id": "https://sarvaravtotest.uz/#organization",
      name: "Sarvar Avto Test",
      alternateName: ["sarvaravtotest", "Sarvar AvtoTest", "sarvar avto test uz"],
      url: "https://sarvaravtotest.uz",
      logo: {
        "@type": "ImageObject",
        url: "https://sarvaravtotest.uz/images/logo.jpg",
        width: 1269,
        height: 479,
      },
      sameAs: ["https://www.instagram.com/sarvar_avtotest"],
      description:
        "Sarvar Avto Test — O'zbekistonda haydovchilik imtihoniga tayyorlanish uchun №1 platforma. YHQ testlari, bepul biletlar va imtihon simulyatori.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+998880021313",
        contactType: "customer service",
        availableLanguage: "Uzbek",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://sarvaravtotest.uz/#edu",
      name: "Sarvar Avto Test",
      url: "https://sarvaravtotest.uz",
      description: "Haydovchilik kursi va YHQ testlariga tayyorgarlik markazi",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "YHQ Test Kurslari",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Course",
              name: "YHQ Bilet Testlari",
              description: "O'zbekiston yo'l harakati qoidalari bo'yicha 2024-2025 bilet testlari",
              url: "https://sarvaravtotest.uz/tickets",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Course",
              name: "Mavzular bo'yicha Testlar",
              description: "YHQ mavzulari bo'yicha tematik testlar",
              url: "https://sarvaravtotest.uz/topics",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Course",
              name: "Imtihon Simulyatori",
              description: "Haqiqiy imtihonga yaqin sharoitda sinov imtihoni",
              url: "https://sarvaravtotest.uz/exams",
            },
          },
        ],
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
