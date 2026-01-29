"use client"

import { Clock, BookOpen, Trophy, Shield } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useState, useEffect } from "react"

export function Statistics() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const stats = [
    {
      icon: Clock,
      title: t("stats.access247"),
      description: t("stats.access247_desc")
    },
    {
      icon: BookOpen,
      title: t("stats.categories"),
      description: t("stats.categories_desc")
    },
    {
      icon: Trophy,
      title: t("stats.progress"),
      description: t("stats.progress_desc")
    },
    {
      icon: Shield,
      title: t("stats.secure"),
      description: t("stats.secure_desc")
    }
  ]

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-primary mb-16">
          {t("stats.title")}
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {stats.map((item, idx) => {
            const Icon = item.icon

            return (
              <div
                key={idx}
                className="space-y-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-lg text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
