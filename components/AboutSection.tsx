"use client"

import Image from "next/image"
import { useTranslation } from "react-i18next"

export function AboutSection() {
  const { t } = useTranslation()

  return (
    <section id="about" className="mt-16 mb-16 sm:mt-32 sm:mb-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-8 md:grid-cols-2">

          {/* TEXT */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <span className="inline-block mb-4 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              {t("landing_about.badge")}
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 sm:mb-6">
              {t("landing_about.title")}
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Sarvar Avtotest</span> — {t("landing_about.desc1")}
            </p>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t("landing_about.desc2")}
              <span className="text-foreground font-medium"> {t("landing_about.progress")} </span>
              {t("landing_about.desc3")}
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative group order-1 md:order-2 mb-8 md:mb-0">
            {/* glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/30 via-transparent to-purple-500/30 opacity-0 blur-2xl transition group-hover:opacity-100" />

            <div className="
              relative overflow-hidden rounded-2xl border 
              bg-background/60 backdrop-blur-xl
              transition-transform duration-300
              group-hover:scale-[1.02]
            ">
              <Image
                src="/images/about-us.jpg"
                alt="Sarvar Avtotest platformasi"
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
