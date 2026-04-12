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
    <section id="prices" className="py-16 md:py-24 relative overflow-hidden bg-[#eef8fd] w-full">
      <div className="container mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center mt-[-30px]">
        <div className="text-center mb-10 w-full flex justify-center">
          <span className="inline-block text-[#38bdf8] font-medium tracking-wide text-[15px] border-b-2 border-[#2dd4bf] pb-1 uppercase">
            {t("nav.pricing", "NARXLAR")}
          </span>
        </div>

        {/* Discount Badge */}
        <div
          className="bg-[#e41e26] w-[90px] h-[95px] flex flex-col items-center justify-start pt-[18px] mb-4 rounded-t-lg shadow-sm shrink-0"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)" }}
        >
          <span className="text-white font-bold text-[26px] leading-none mb-1">{prices.discount_percent}%</span>
          <span className="text-white text-[9px] uppercase font-bold tracking-wider">{t("prices_section.discount", "CHEGIRMA")}</span>
        </div>

        <p className="text-slate-800 text-lg font-medium mb-3">
          {prices.discount_percent}% {t("prices_section.discount_lower", "chegirma")}
        </p>

        <h2 className="text-[#085b4d] text-[28px] sm:text-[34px] font-bold mb-5 text-center leading-tight">
          {t("prices_section.promo_title", "Premium obunaga bugun ulgur!")}
        </h2>

        <p className="text-slate-500 text-[15px] sm:text-base mb-8 max-w-2xl text-center leading-relaxed px-4">
          {t("prices_section.promo_subtitle", "To'liq test rejimlaridan foydalanish, test statistikasi va boshqa qulayliklarga ega bo'ling.")}
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 w-full">
          <span className="text-[#94a3b8] text-[22px] sm:text-[28px] font-bold line-through tracking-tight" suppressHydrationWarning>
            {new Intl.NumberFormat("en-US").format(Number(prices.original_price || 0))} {t("test.currency", "so'm")}
          </span>
          <span className="text-[#dc2626] text-[22px] sm:text-[28px] font-bold tracking-tight" suppressHydrationWarning>
            {new Intl.NumberFormat("en-US").format(Number(prices.discounted_price || 0))} {t("test.currency", "so'm")}
          </span>
        </div>

        <Button
          asChild
          size="lg"
          className="h-12 sm:h-14 px-6 sm:px-10 bg-[#34a853] hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-all text-base sm:text-[17px] w-full sm:w-auto"
        >
          <Link suppressHydrationWarning href="/login" className="flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-[20px] leading-none -mt-[2px]">👑</span>
            {t("activate_premium", "Premium obunani faollashtiring")}
          </Link>
        </Button>
      </div>
    </section>
  )
}

