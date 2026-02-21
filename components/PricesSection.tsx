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
    <section id="prices" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{t("prices_section.title")}</h2>
          <p className="text-lg text-slate-400">
            {t("prices_section.subtitle")}
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="group relative glass-dark border-white/10 rounded-[2.5rem] p-10 md:p-14 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />

            {/* Discount Badge */}
            <div className="absolute top-8 right-8">
              <div className="bg-success text-white px-5 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-success/20 animate-pulse">
                <Crown className="w-4 h-4" />
                {prices.discount_percent}% {t("prices_section.discount")}
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold text-white">{t("prices_section.premium")}</h3>
                <p className="text-slate-400 font-medium">To'liq imkoniyatlardan foydalaning</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 line-through text-xl block font-medium" suppressHydrationWarning>
                  {formatPrice(prices.original_price)} so'm
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl md:text-7xl font-black text-white tracking-tighter" suppressHydrationWarning>
                    {formatPrice(prices.discounted_price)}
                  </span>
                  <span className="text-xl font-bold text-slate-500">{t("prices_section.month")}</span>
                </div>
              </div>

              <div className="w-full space-y-4 pt-8 border-t border-white/5">
                {[t("prices_section.feature1"), t("prices_section.feature2"), t("prices_section.feature3")].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 group/item">
                    <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-success group-hover/item:text-white transition-all">
                      <Check className="w-4 h-4 text-success group-hover/item:text-white" />
                    </div>
                    <span className="text-base font-semibold text-slate-300 group-hover/item:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="w-full pt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full h-16 bg-success hover:bg-success/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-success/20 transition-all hover:scale-[1.03] active:scale-[0.97]"
                >
                  <Link href="/register">
                    {t("prices_section.cta")}
                  </Link>
                </Button>

                <p className="text-xs text-slate-500 mt-6 font-medium uppercase tracking-widest">
                  <span className="inline-block mr-2">🔒</span>
                  {t("prices_section.secure")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

