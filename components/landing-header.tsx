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
                    ? "bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl shadow-blue-500/5 scale-[0.98]"
                    : "bg-transparent border-transparent"
                    }`}
            >
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-all group">
                        <div className="text-blue-700 font-black">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Tezkor</span>
                            <span className="text-base font-bold text-slate-800 tracking-tight uppercase">Avtotest</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8 font-black uppercase tracking-tighter italic">
                        {["home", "features", "pricing", "results", "about"].map((item) => (
                            <Link
                                key={item}
                                href={item === "home" ? "/" : `#${item}`}
                                className="text-sm font-black text-slate-400 transition-colors hover:text-blue-600 relative group"
                            >
                                {t(`nav.${item}`)}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <Button
                        asChild
                        className="rounded-[1rem] font-black uppercase italic tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-6"
                    >
                        <Link href="/login">{t("nav.login")}</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
