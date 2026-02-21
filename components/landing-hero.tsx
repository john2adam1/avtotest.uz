"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Crown } from "lucide-react"

export function LandingHero() {
    const { t } = useTranslation()

    return (
        <div className="container mx-auto px-6 py-24 md:py-32 relative text-center">
            {/* Background elements moved to page.tsx for global effect, 
                but keeping potential section-specific accents here if needed */}

            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-fade-in">
                    <Crown className="h-4 w-4" />
                    <span>Eng zamonaviy avtotest platformasi</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                    {t("hero_title")}
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    {t("hero_subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <Button
                        asChild
                        size="lg"
                        className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Link href="/login" className="flex items-center gap-2 text-lg">
                            <Crown className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                            {t("activate_premium")}
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all text-lg font-bold"
                    >
                        <Link href="#features">
                            Batafsil ma'lumot
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
