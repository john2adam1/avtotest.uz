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
    <section id="features" className="py-16 sm:py-24 relative overflow-hidden bg-[#eef8fd]">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-[42px] font-black text-slate-900 tracking-tight uppercase italic leading-tight">
            {t("stats.title")}
          </h2>
          <p className="text-slate-500 text-[15px] max-w-2xl mx-auto font-bold leading-relaxed">
            {t("landing.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, idx) => {
            const Icon = item.icon

            return (
              <div
                key={idx}
                className="group relative bg-white border border-transparent p-6 sm:px-4 sm:py-10 rounded-[2.5rem] text-center transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-5 h-10 w-10 flex items-center justify-center mx-auto">
                    <Icon className="h-full w-full text-blue-600" strokeWidth={1.5} />
                  </div>

                  <div className="space-y-4 px-2">
                    <h3 className="text-[15px] font-black text-slate-900 uppercase italic leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-[13px] text-slate-500 leading-relaxed font-bold">
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
