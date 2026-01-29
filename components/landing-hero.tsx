"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Crown } from "lucide-react"
import Image from "next/image"

export function LandingHero() {
    const { t } = useTranslation()

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                        {t("hero_title")}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-700 font-medium">
                        {t("hero_subtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Button asChild size="lg" className="bg-success hover:bg-success/90 text-white rounded-xl h-14 px-8 text-lg font-semibold shadow-lg shadow-success/20">
                            <Link href="/login" className="flex items-center gap-3">
                                <Crown className="h-6 w-6" />
                                {t("activate_premium")}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="relative hidden lg:block">
                    <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                        {/* Simple geometric phone mockup shape if no image is available */}
                        <div className="absolute inset-0 bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800">
                            <div className="h-full w-full bg-background rounded-[2.2rem] overflow-hidden relative">
                                {/* Mock UI */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-background border-b flex items-center px-6 justify-between">
                                    <div className="w-24 h-4 bg-gray-100 rounded" />
                                    <div className="flex gap-2">
                                        <div className="w-6 h-6 bg-yellow-400 rounded-full" />
                                        <div className="w-6 h-6 bg-blue-500 rounded-full" />
                                    </div>
                                </div>
                                <div className="p-6 pt-20 space-y-4">
                                    <div className="w-3/4 h-6 bg-gray-100 rounded" />
                                    <div className="w-full h-24 bg-success/10 rounded-2xl flex items-center justify-center">
                                        <span className="text-success font-bold text-sm">Video darslar</span>
                                    </div>
                                    <div className="w-full h-24 bg-yellow-400/10 rounded-2xl flex items-center justify-center">
                                        <span className="text-yellow-600 font-bold text-sm">Testlar</span>
                                    </div>
                                    <div className="w-full h-24 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                        <span className="text-red-500 font-bold text-sm">Imtihon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
