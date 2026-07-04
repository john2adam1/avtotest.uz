"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import type { User } from "@/lib/types"
import { hasActiveAccess } from "@/lib/access-control"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

interface SubscriptionBannerProps {
  user: User
  telegramLink?: string
}

export function SubscriptionBanner({ user, telegramLink = "https://t.me/yourusername" }: SubscriptionBannerProps) {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const hasAccess = hasActiveAccess(user)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!hasAccess || !user.subscription_end) return

    const updateTimer = () => {
      const now = new Date()
      const end = new Date(user.subscription_end!)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(t("subscription.expired"))
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      if (days > 0) {
        setTimeLeft(`${days} ${t("subscription.days")} ${hours} ${t("subscription.hours")}`)
      } else {
        setTimeLeft(`${hours} ${t("subscription.hours")}`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)

    return () => clearInterval(interval)
  }, [hasAccess, user.subscription_end, t])

  if (!mounted) {
    return null
  }

  if (hasAccess) {
    return (
      <div className="bg-green-50/50 backdrop-blur-sm border border-green-100 rounded-[2.5rem] p-8 shadow-xl shadow-green-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
          <Crown className="w-32 h-32 text-green-600" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Crown className="h-8 w-8 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">{t("subscription.premiumActive")}</h3>
              <p className="text-green-600 font-bold">
                {t("subscription.validUntil")}: {timeLeft}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0969DA]/5 backdrop-blur-sm border border-blue-100 rounded-[2.5rem] p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:-rotate-12 transition-transform duration-500">
        <Crown className="w-32 h-32 text-[#0969DA]" />
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 bg-[#0969DA] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Crown className="h-8 w-8 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">{t("subscription.getPremium")}</h3>
            <p className="text-slate-500 font-medium">
              {t("subscription.premiumDescription")}
            </p>
          </div>
        </div>
        <Button asChild className="h-16 px-10 bg-[#0969DA] hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase tracking-widest italic transition-all active:scale-95 shrink-0">
          <a href="https://t.me/sarvaravtotest_admin" target="_blank" rel="noopener noreferrer">
            {t("subscription.buySubscription")}
          </a>
        </Button>
      </div>
    </div>
  )
}
