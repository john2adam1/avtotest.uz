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
    <section id="features" className="py-24 relative overflow-hidden bg-[#e9f6ff]">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
            {t("stats.title")}
          </h2>
          <p className="text-slate-500 text-lg font-bold">
            Platformamiz orqali haydovchilik guvohnomasini olish imtihoniga tayyorgarlik ko&apos;ring
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, idx) => {
            const Icon = item.icon

            return (
              <div
                key={idx}
                className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] text-center hover:border-blue-100 transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/5"
              >
                <div className="relative z-10 space-y-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icon className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed font-bold">
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
