"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function LandingHeader() {
    const { t } = useTranslation()
    const [scrolled, setScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (!mounted) return null

    const navItems = ["home", "features", "pricing", "results", "about"]

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 pt-4 ${scrolled ? "h-auto pb-4" : "h-auto pb-4"}`}
        >
            <div
                className={`container mx-auto flex h-14 items-center justify-between px-4 sm:px-6 rounded-2xl transition-all duration-300 ${scrolled
                    ? "bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl shadow-blue-500/5 scale-[0.98]"
                    : "bg-transparent border-transparent"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-6 sm:gap-10">
                    <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-all group">
                        <div className="text-blue-700 font-black">
                            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter uppercase italic">Sarvar</span>
                            <span className="text-sm font-bold text-slate-800 tracking-tight uppercase">AvtoTest</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 font-black uppercase tracking-tighter italic">
                        {navItems.map((item) => (
                            <Link
                                key={item}
                                href={item === "home" ? "/" : `#${item}`}
                                suppressHydrationWarning
                                className="text-sm font-black text-slate-400 transition-colors hover:text-blue-600 relative group"
                            >
                                {t(`nav.${item}`)}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Language + CTA + Hamburger */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <LanguageSwitcher />
                    <Button
                        asChild
                        className="hidden sm:flex rounded-[1rem] font-black uppercase italic tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-4 sm:px-6 text-sm"
                    >
                        <Link suppressHydrationWarning href="/login">{t("nav.login")}</Link>
                    </Button>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileOpen && (
                <div className="lg:hidden container mx-auto mt-2 px-4">
                    <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl shadow-blue-500/10 p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item}
                                href={item === "home" ? "/" : `#${item}`}
                                suppressHydrationWarning
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 rounded-xl text-sm font-black text-slate-600 uppercase tracking-wider hover:bg-blue-50 hover:text-blue-600 transition-colors italic"
                            >
                                {t(`nav.${item}`)}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-slate-100">
                            <Button
                                asChild
                                className="w-full rounded-xl font-black uppercase italic tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                            >
                                <Link suppressHydrationWarning href="/login" onClick={() => setMobileOpen(false)}>
                                    {t("nav.login")}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
