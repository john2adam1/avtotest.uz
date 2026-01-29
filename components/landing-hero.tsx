"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export function LandingHero() {
    const { t } = useTranslation()

    return (
        <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center justify-center mb-8">
                <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
                    <span className="text-yellow-400 font-medium text-sm tracking-wide">{t("landing.badge")}</span>
                </div>
            </div>

            <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-slate-900 leading-[1.1] tracking-tight mb-8">
                {t("landing.title1")} <br />
                {t("landing.title2")} <span className="text-primary">{t("landing.title3")}</span> <br />
                {t("landing.title4")}
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-zinc-400 mb-12 leading-relaxed">
                {t("landing.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-16 px-10 rounded-2xl shadow-[0_0_40px_-10px_rgba(250,204,21,0.5)] transition-all hover:scale-105">
                    <Link href="/register">{t("landing.register")}</Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-slate-900 text-lg backdrop-blur-sm transition-all hover:scale-105">
                    <Link href="/login">{t("landing.login")}</Link>
                </Button>
            </div>
        </div>
    )
}
