"use client"

import { Button } from "@/components/ui/button"
import { Crown, Check } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { PriceData } from "@/lib/landing-types"

interface PricesSectionProps {
  prices: PriceData
}

import { useState, useEffect } from "react"

export function PricesSection({ prices }: PricesSectionProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("uz-UZ").format(Number.parseInt(price || "0"))
  }

  return (
    <section id="prices" className="py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">{t("prices_section.title")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            {t("prices_section.subtitle")}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-background border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-primary/5 relative">
            {/* Discount Badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <div className="bg-red-500 text-white px-8 py-2 rounded-full shadow-lg font-bold text-lg flex items-center gap-2">
                <Crown className="w-6 h-6" />
                {prices.discount_percent}% {t("prices_section.discount")}
              </div>
            </div>

            <div className="text-center mt-6 space-y-8">
              <h3 className="text-3xl font-bold text-primary tracking-tight">{t("prices_section.premium")}</h3>

              <div className="space-y-4">
                <span className="text-gray-400 line-through text-2xl font-medium block" suppressHydrationWarning>
                  {formatPrice(prices.original_price)} so'm
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-6xl font-black text-gray-900" suppressHydrationWarning>
                    {formatPrice(prices.discounted_price)}
                  </span>
                  <span className="text-2xl font-bold text-gray-500 self-end mb-2">{t("prices_section.month")}</span>
                </div>
              </div>

              <div className="space-y-5 pt-4 text-left border-t border-gray-100 mt-8">
                {[t("prices_section.feature1"), t("prices_section.feature2"), t("prices_section.feature3")].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-lg font-medium text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="w-full bg-success hover:bg-success/90 text-white h-16 rounded-2xl text-xl font-bold shadow-lg shadow-success/20 mt-10 transition-all hover:scale-[1.02]">
                <Link href="/register">
                  {t("prices_section.cta")}
                </Link>
              </Button>

              <p className="text-sm font-medium text-gray-400 mt-6 tracking-wide">
                {t("prices_section.secure")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

