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
    <section id="about" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-16 md:grid-cols-2">

          {/* TEXT */}
          <div className="order-2 md:order-1 text-left">
            <span className="inline-block mb-6 rounded-full bg-primary/10 px-6 py-2 text-base font-semibold text-primary">
              {t("landing_about.badge")}
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
              {t("common.appName")}
            </h2>

            <div className="space-y-6 text-lg md:text-xl text-gray-600 leading-relaxed">
              <p>
                <span className="font-bold text-primary">{t("common.appName")}</span> — {t("landing_about.desc1")}
              </p>

              <p>
                {t("landing_about.desc2")}
                <span className="text-primary font-bold"> {t("landing_about.progress")} </span>
                {t("landing_about.desc3")}
              </p>
            </div>
          </div>

          {/* IMAGE */}
          <div className="order-1 md:order-2">
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-gray-200/50">
              <Image
                src="/images/about-us.jpg"
                alt={t("common.appName")}
                width={600}
                height={400}
                className="object-cover w-full h-auto"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
