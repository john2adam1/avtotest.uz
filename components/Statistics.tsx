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
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t("stats.title")}
          </h2>
          <p className="text-slate-400 text-lg">
            Platformamiz orqali haydovchilik guvohnomasini olish imtihoniga tayyorgarlik ko'ring
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, idx) => {
            const Icon = item.icon

            return (
              <div
                key={idx}
                className="group relative glass-dark border-white/5 p-8 rounded-[2rem] text-center hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />

                <div className="relative z-10 space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
