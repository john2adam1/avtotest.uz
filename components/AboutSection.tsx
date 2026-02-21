"use client"

import Image from "next/image"
import { useTranslation } from "react-i18next"

import { useState, useEffect } from "react"

export function AboutSection() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* TEXT */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-5 py-1.5 text-sm font-bold text-primary uppercase tracking-widest">
                {t("landing_about.badge")}
              </span>

              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                {t("common.appName")}
              </h2>
            </div>

            <div className="space-y-6 text-lg text-slate-400 leading-relaxed max-w-xl">
              <p>
                <span className="font-bold text-white">{t("common.appName")}</span> — {t("landing_about.desc1")}
              </p>

              <p className="p-6 rounded-2xl bg-white/5 border-l-4 border-primary italic">
                {t("landing_about.desc2")}
                <span className="text-primary font-bold"> {t("landing_about.progress")} </span>
                {t("landing_about.desc3")}
              </p>
            </div>
          </div>

          {/* IMAGE */}
          <div className="order-1 lg:order-2 group">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 glass-dark p-3 transition-transform duration-500 group-hover:scale-[1.02]">
              <Image
                src="/images/about-us.jpg"
                alt={t("common.appName")}
                width={600}
                height={400}
                className="rounded-[2rem] object-cover w-full h-auto shadow-2xl transition-all duration-500 group-hover:brightness-110"
              />

              {/* Overlay Decoration */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
