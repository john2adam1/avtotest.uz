// components/subscription-banner.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, ExternalLink } from "lucide-react"
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
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days} ${t("subscription.days")} ${hours} ${t("subscription.hours")}`)
      } else if (hours > 0) {
        setTimeLeft(`${hours} ${t("subscription.hours")} ${minutes} ${t("subscription.minutes")}`)
      } else {
        setTimeLeft(`${minutes} ${t("subscription.minutes")}`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [hasAccess, user.subscription_end, t])

  if (!mounted) {
    return null // or a specific skeleton loader
  }

  if (hasAccess) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t("subscription.premiumActive")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.validUntil")}: {timeLeft}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("subscription.contactSupport")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t("subscription.getPremium")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("subscription.premiumDescription")}
              </p>
            </div>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-none">
            <a href={telegramLink} target="_blank" rel="noopener noreferrer">
              <Crown className="h-4 w-4 mr-2" />
              {t("subscription.buySubscription")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}