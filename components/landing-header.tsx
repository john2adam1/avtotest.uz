"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"

export function LandingHeader() {
    const { t } = useTranslation()
    const [scrolled, setScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (!mounted) return null

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 pt-4 ${scrolled ? "h-20" : "h-24"
                }`}
        >
            <div
                className={`container mx-auto flex h-full items-center justify-between px-6 rounded-2xl transition-all duration-300 ${scrolled
                        ? "glass-dark border-white/10 shadow-2xl scale-[0.98]"
                        : "bg-transparent border-transparent"
                    }`}
            >
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
                        <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                            <span className="text-xl font-bold text-primary tracking-tighter">TA</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-bold text-white tracking-tight">Tezkor</span>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Avtotest</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        {["home", "features", "pricing", "results", "about"].map((item) => (
                            <Link
                                key={item}
                                href={item === "home" ? "/" : `#${item}`}
                                className="text-sm font-medium text-slate-400 transition-colors hover:text-white relative group"
                            >
                                {t(`nav.${item}`)}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <Button
                        asChild
                        variant="secondary"
                        className="rounded-xl font-bold bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                        <Link href="/login">{t("nav.login")}</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
