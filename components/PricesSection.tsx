"use client"

import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { PriceData } from "@/lib/landing-types"

interface PricesSectionProps {
  prices: PriceData
}

export function PricesSection({ prices }: PricesSectionProps) {
  const { t } = useTranslation()

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("uz-UZ").format(Number.parseInt(price || "0"))
  }

  return (
    <section id="prices" className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">{t("prices_section.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("prices_section.subtitle")}
          </p>
        </div>

        <div className="max-w-md mx-auto relative group">
          {/* Glowing Border Layout */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse" />

          <div className="relative bg-background/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
            {/* Discount Badge */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-2 rounded-full shadow-lg font-bold tracking-wide text-sm sm:text-base flex items-center gap-2">
                <Crown className="w-5 h-5" />
                {prices.discount_percent}% {t("prices_section.discount")}
              </div>
            </div>

            <div className="text-center mt-6 space-y-6">
              <h3 className="text-2xl font-semibold text-primary">{t("prices_section.premium")}</h3>

              <div className="space-y-2">
                <span className="text-muted-foreground line-through text-xl block" suppressHydrationWarning>
                  {formatPrice(prices.original_price)} so'm
                </span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground" suppressHydrationWarning>
                    {formatPrice(prices.discounted_price)}
                  </span>
                  <span className="text-xl font-medium text-muted-foreground self-end mb-2">{t("prices_section.month")}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-muted-foreground">{t("prices_section.feature1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-muted-foreground">{t("prices_section.feature2")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-muted-foreground">{t("prices_section.feature3")}</span>
                </div>
              </div>

              <Button asChild className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 mt-8 transition-transform hover:scale-[1.02]">
                <Link href="/register">
                  {t("prices_section.cta")}
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                {t("prices_section.secure")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

