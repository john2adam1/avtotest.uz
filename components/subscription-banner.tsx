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
      <Card className="bg-green-50 border-green-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{t("subscription.premiumActive")}</h3>
                <p className="text-sm text-gray-600">
                  {t("subscription.validUntil")}: {timeLeft}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-sky-50 border-sky-200">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg">
              <Crown className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{t("subscription.getPremium")}</h3>
              <p className="text-sm text-gray-600">
                {t("subscription.premiumDescription")}
              </p>
            </div>
          </div>
          <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
              <Crown className="h-4 w-4 mr-2" />
              {t("subscription.buySubscription")}
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
