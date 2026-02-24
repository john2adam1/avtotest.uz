"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Crown } from "lucide-react"

export function LandingHero() {
    const { t } = useTranslation()

    return (
        <div className="container mx-auto px-6 py-24 md:py-32 relative text-center">
            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/5">
                    <Crown className="h-4 w-4" />
                    <span>Eng zamonaviy avtotest platformasi</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter italic uppercase">
                    {t("hero_title")}
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed font-bold">
                    {t("hero_subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                    <Button
                        asChild
                        size="lg"
                        className="h-20 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 group uppercase italic tracking-widest text-xl"
                    >
                        <Link href="/login" className="flex items-center gap-3">
                            <Crown className="h-7 w-7 group-hover:rotate-12 transition-transform" />
                            {t("activate_premium")}
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="h-20 px-12 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all text-xl font-black uppercase italic tracking-widest"
                    >
                        <Link href="#features">
                            Batafsil
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
