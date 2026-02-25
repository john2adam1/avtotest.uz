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
    <section id="prices" className="py-24 relative overflow-hidden bg-[#e9f6ff]">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{t("prices_section.title")}</h2>
          <p className="text-xl text-slate-500 font-bold">
            {t("prices_section.subtitle")}
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="group relative bg-white border border-slate-100 rounded-[3rem] p-10 md:p-14 overflow-hidden shadow-2xl shadow-blue-500/5 transition-all duration-300 hover:scale-105">
            {/* Discount Badge */}
            <div className="absolute top-8 right-8">
              <div className="bg-green-500 text-white px-5 py-2 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-green-500/20 uppercase tracking-widest animate-pulse">
                <Crown className="w-4 h-4" />
                {prices.discount_percent}% {t("prices_section.discount")}
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">{t("prices_section.premium")}</h3>
                <p className="text-slate-500 font-bold">{t("dashboard.randomQuestions")}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-300 line-through text-xl block font-black uppercase italic" suppressHydrationWarning>
                  {formatPrice(prices.original_price)} {t("common.currency", "so'm")}
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter italic" suppressHydrationWarning>
                    {formatPrice(prices.discounted_price)}
                  </span>
                  <span className="text-xl font-black text-slate-400 uppercase italic">{t("prices_section.month")}</span>
                </div>
              </div>

              <div className="w-full space-y-4 pt-8 border-t border-slate-50">
                {[t("prices_section.feature1"), t("prices_section.feature2"), t("prices_section.feature3")].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-green-600 font-black" />
                    </div>
                    <span className="text-base font-bold text-slate-600 uppercase tracking-tight italic">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="w-full pt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl rounded-[2rem] shadow-2xl shadow-blue-500/20 transition-all uppercase italic tracking-widest"
                >
                  <Link href="/register">
                    {t("prices_section.cta")}
                  </Link>
                </Button>

                <p className="text-[10px] text-slate-400 mt-6 font-black uppercase tracking-[0.2em]">
                  🔒 {t("prices_section.secure")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

