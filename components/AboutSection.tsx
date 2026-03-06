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
    <section id="about" className="py-24 relative overflow-hidden bg-[#e9f6ff]">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* TEXT */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-white border border-blue-100 px-5 py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-lg shadow-blue-500/5">
                {t("landing_about.badge")}
              </span>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
                {t("common.appName")}
              </h2>
            </div>

            <div className="space-y-6 text-base sm:text-xl text-slate-500 leading-relaxed max-w-xl font-bold">
              <p>
                <span className="font-black text-slate-900 uppercase italic">{t("common.appName")}</span> — {t("landing_about.desc1")}
              </p>

              <p className="p-4 sm:p-8 rounded-[2rem] bg-white border-l-[6px] border-blue-600 italic shadow-xl shadow-blue-500/5">
                {t("landing_about.desc2")}
                <span className="text-blue-600 font-black"> {t("landing_about.progress")} </span>
                {t("landing_about.desc3")}
              </p>
            </div>
          </div>

          {/* IMAGE */}
          <div className="order-1 lg:order-2 group">
            <div className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-4 shadow-2xl shadow-blue-500/10 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/images/about-us.jpg"
                alt={t("common.appName")}
                width={600}
                height={400}
                className="rounded-[2.5rem] object-cover w-full h-auto"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
