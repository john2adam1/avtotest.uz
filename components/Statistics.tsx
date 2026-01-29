"use client"

import { Clock, BookOpen, Trophy, Shield } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Statistics() {
  const { t } = useTranslation()

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
    <section id="statistics" className="mt-32 mb-32">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-4xl font-extrabold tracking-tight mb-14">
          {t("stats.title")}
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, idx) => {
            const Icon = item.icon

            return (
              <div
                key={idx}
                className="
                  group relative overflow-hidden rounded-2xl border 
                  bg-background/60 backdrop-blur-xl
                  p-8 text-center
                  transition-all duration-300
                  hover:-translate-y-2 hover:shadow-2xl
                "
              >
                {/* gradient border effect */}
                <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-purple-500/30" />
                </div>

                {/* icon */}
                <div className="
                  mx-auto mb-5 flex h-14 w-14 items-center justify-center 
                  rounded-full bg-primary/10
                  transition-all duration-300
                  group-hover:scale-110 group-hover:rotate-6
                ">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
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
