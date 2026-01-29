"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"

export function LandingHeader() {
    const { t } = useTranslation()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 max-w-7xl">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-bold text-primary">Tezkor</span>
                            <span className="text-lg font-medium text-gray-700">Avtotest</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/" className="text-[19.2px] font-medium text-gray-800 hover:text-primary transition-colors">
                            {t("nav.home")}
                        </Link>
                        <Link href="#features" className="text-[19.2px] font-medium text-gray-800 hover:text-primary transition-colors">
                            {t("nav.features")}
                        </Link>
                        <Link href="#prices" className="text-[19.2px] font-medium text-gray-800 hover:text-primary transition-colors">
                            {t("nav.pricing")}
                        </Link>
                        <Link href="#results" className="text-[19.2px] font-medium text-gray-800 hover:text-primary transition-colors">
                            {t("nav.results")}
                        </Link>
                        <Link href="#about" className="text-[19.2px] font-medium text-gray-800 hover:text-primary transition-colors">
                            {t("nav.about")}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <Button asChild variant="outline" className="hidden border-primary/20 text-gray-600 hover:bg-gray-50 rounded-xl px-6 h-11 text-[19.2px]">
                        <Link href="/login">{t("nav.login")}</Link>
                    </Button>
                    <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-6 h-11 text-[19.2px] border-none shadow-none">
                        <Link href="/login">{t("nav.login")}</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
