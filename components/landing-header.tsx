"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "react-i18next"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export function LandingHeader() {
    const { t } = useTranslation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-heading tracking-tight text-white">SARVAR AVTOTEST</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#statistics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {t("landing.statistics")}
                    </Link>
                    <Link href="#prices" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {t("landing.prices")}
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {t("landing.about")}
                    </Link>
                    <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {t("landing.contact")}
                    </Link>
                </nav>

                <div className="hidden md:flex gap-4 items-center">
                    <LanguageSwitcher />
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6">
                        <Link href="/register">{t("landing.start")}</Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    <LanguageSwitcher />
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-white/5 p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
                    <Link href="#statistics" className="text-lg font-medium text-muted-foreground hover:text-foreground p-2" onClick={() => setIsMenuOpen(false)}>
                        {t("landing.statistics")}
                    </Link>
                    <Link href="#prices" className="text-lg font-medium text-muted-foreground hover:text-foreground p-2" onClick={() => setIsMenuOpen(false)}>
                        {t("landing.prices")}
                    </Link>
                    <Link href="#about" className="text-lg font-medium text-muted-foreground hover:text-foreground p-2" onClick={() => setIsMenuOpen(false)}>
                        {t("landing.about")}
                    </Link>
                    <Link href="#contact" className="text-lg font-medium text-muted-foreground hover:text-foreground p-2" onClick={() => setIsMenuOpen(false)}>
                        {t("landing.contact")}
                    </Link>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 w-full mt-2">
                        <Link href="/register">{t("landing.start")}</Link>
                    </Button>
                </div>
            )}
        </header>
    )
}
